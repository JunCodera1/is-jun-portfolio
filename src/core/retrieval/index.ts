import { decide, type Actor } from "@/core/policy";
import type { Item } from "@/lib/knowledge/types";

/**
 * Retrieval core: BM25 over the data layer's items. Permission-aware (an actor only ever searches what it may read),
 * multilingual (Latin text is word-tokenised and accent-folded; Japanese is indexed as character bigrams), deterministic,
 * and dependency-free. It is the single foundation for search, the assistant and agents.
 * Semantic (embedding) retrieval would plug in behind the same `retrieve` signature; none is shipped.
 */
export type Doc = Pick<Item, "id" | "kind" | "title" | "summary" | "tags" | "href" | "date" | "source" | "provenance" | "visibility" | "authorship" | "status" | "lang"> & { related?: string[] };

const STOP = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "are", "was", "were", "be", "with", "as", "by", "it", "that", "this", "at", "from", "what", "how", "why", "who", "which", "does", "did", "has", "have", "i", "you", "me", "my", "about", "tell"]);
const CJK = /[぀-ヿ㐀-鿿豈-﫿ｦ-ﾟ]/u;

const fold = (s: string) => s.normalize("NFKC").toLowerCase().replace(/đ/g, "d").normalize("NFD").replace(/[̀-ͯ]/g, "");

export function tokenize(text: string): string[] {
  const out: string[] = [];
  let latin = "", cjk = "";
  const flushLatin = () => { if (latin) { for (const w of latin.split(/[^a-z0-9+#.]+/)) { const t = w.replace(/^[.+#]+|[.]+$/g, ""); if (t.length >= 2 && !STOP.has(t)) out.push(t); } latin = ""; } };
  const flushCjk = () => { if (cjk) { const cs = [...cjk]; if (cs.length === 1) out.push(cs[0]!); for (let i = 0; i + 1 < cs.length; i++) out.push(cs[i]! + cs[i + 1]!); cjk = ""; } };
  for (const ch of fold(text)) {
    if (CJK.test(ch)) { flushLatin(); cjk += ch; } else { flushCjk(); latin += ch; }
  }
  flushLatin(); flushCjk();
  return out;
}

interface Indexed { doc: Doc; tf: Map<string, number>; len: number }
export interface Index { docs: Indexed[]; df: Map<string, number>; avgLen: number }
const W = { title: 3, tags: 2, summary: 1 } as const;

export function buildIndex(docs: readonly Doc[]): Index {
  const indexed: Indexed[] = docs.map((doc) => {
    const tf = new Map<string, number>();
    let len = 0;
    for (const [field, w] of [[doc.title, W.title], [doc.tags.join(" "), W.tags], [doc.summary, W.summary]] as const) for (const t of tokenize(field)) { tf.set(t, (tf.get(t) ?? 0) + w); len += w; }
    return { doc, tf, len };
  });
  const df = new Map<string, number>();
  for (const x of indexed) for (const t of x.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  return { docs: indexed, df, avgLen: indexed.reduce((s, x) => s + x.len, 0) / Math.max(1, indexed.length) };
}

export interface Hit { doc: Doc; score: number; matched: string[] }
const K1 = 1.2, B = 0.75;

export function search(index: Index, query: string, limit = 8): { hits: Hit[]; terms: string[] } {
  const terms = [...new Set(tokenize(query))];
  const N = index.docs.length;
  const hits: Hit[] = [];
  for (const x of index.docs) {
    let score = 0; const matched: string[] = [];
    for (const t of terms) {
      const f = x.tf.get(t);
      if (!f) continue;
      const n = index.df.get(t) ?? 0;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      score += idf * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * x.len) / index.avgLen)));
      matched.push(t);
    }
    if (score > 0) hits.push({ doc: x.doc, score, matched });
  }
  hits.sort((a, b) => b.score - a.score || a.doc.id.localeCompare(b.doc.id));
  return { hits: hits.slice(0, limit), terms };
}

/**
 * A heuristic, not a probability: how well the top hit covers the query terms (70%) and how clearly it beats the runner-up (30%).
 * 0 means "nothing in the data answers this".
 */
export function confidence(terms: readonly string[], hits: readonly Hit[]): number {
  const top = hits[0];
  if (!top || terms.length === 0) return 0;
  const coverage = top.matched.length / terms.length;
  const margin = hits[1] ? (top.score - hits[1].score) / top.score : 1;
  return Math.round(Math.max(0, Math.min(1, 0.7 * coverage + 0.3 * margin)) * 100) / 100;
}

/** The only entry point agents and the assistant use: filter by what the actor may read, then rank. */
export function retrieve(docs: readonly Doc[], query: string, actor: Actor, limit = 8) {
  const allowed = docs.filter((d) => decide(actor, { kind: "read" }, d).allow);
  const { hits, terms } = search(buildIndex(allowed), query, limit);
  return { hits, terms, confidence: confidence(terms, hits), searched: allowed.length };
}
