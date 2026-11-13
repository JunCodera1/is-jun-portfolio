/**
 * The unified data model. Every dated or linkable thing on the site — a note, a project, a decision, a mistake — is normalised into an
 * `Item`; every real relationship into an `Edge`. Pure types and pure helpers only, so they are testable without Next.js.
 */
export type Visibility = "public" | "unlisted" | "private";
export type Kind = "project" | "tech" | "note" | "post" | "concept" | "research" | "mistake" | "decision" | "idea" | "path" | "topic" | "log" | "event";
export type Source = "owner" | "site" | "github" | "public";
export type Status = "translated" | "draft" | "untranslated";

export interface Item {
  id: string;
  kind: Kind;
  title: string;
  summary: string;
  /** One of the Vault topics, when the item has one. */
  topic?: string;
  /** Raw tag ids (not localised). */
  tags: string[];
  /** ISO day. Only real dates: an item without one is simply not placed on the timeline. */
  date?: string;
  /** Locale-less path (may carry a #fragment). */
  href: string;
  source: Source;
  /** Where the item comes from and what proves it. */
  provenance: { origin: string; evidence?: string };
  visibility: Visibility;
  status: Status;
  /** Language of title/summary (differs from the requested locale on fallback). */
  lang: string;
}

export interface Edge { from: string; to: string; kind: "uses" | "related" | "topic" | "supersedes" | "next"; evidence?: string }
export interface Knowledge { items: Item[]; edges: Edge[] }

/** Only public items may leave the site (search, feeds, graph, timeline, discovery). */
export const isPublic = (i: { visibility: Visibility }) => i.visibility === "public";

/** Drop non-public items and every edge that touches one. The single choke point for privacy. */
export function publicOnly(k: Knowledge): Knowledge {
  const items = k.items.filter(isPublic);
  const ids = new Set(items.map((i) => i.id));
  return { items, edges: k.edges.filter((e) => ids.has(e.from) && ids.has(e.to)) };
}

export function degree(id: string, edges: readonly Edge[]): number {
  let n = 0;
  for (const e of edges) if (e.from === id || e.to === id) n++;
  return n;
}

const STOP = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "are", "with", "as", "by", "it", "that", "this", "be", "at", "from", "into", "how", "what", "why", "was"]);
const words = (s: string) => new Set(s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !STOP.has(w)));

/**
 * Rule-based suggestions: pairs of items that share at least `min` tags or significant words in title/summary and are not yet linked.
 * It only ever suggests; nothing is written anywhere.
 */
export function suggestConnections(k: Knowledge, min = 2, limit = 8): { a: Item; b: Item; shared: string[] }[] {
  const linked = new Set(k.edges.flatMap((e) => [`${e.from}|${e.to}`, `${e.to}|${e.from}`]));
  const feats = k.items.filter((i) => i.kind !== "topic" && i.kind !== "tech").map((i) => ({ i, f: new Set([...i.tags.map((t) => `#${t}`), ...words(`${i.title} ${i.summary}`)]) }));
  const out: { a: Item; b: Item; shared: string[] }[] = [];
  for (let x = 0; x < feats.length; x++) for (let y = x + 1; y < feats.length; y++) {
    const A = feats[x]!, B = feats[y]!;
    if (linked.has(`${A.i.id}|${B.i.id}`) || A.i.kind === B.i.kind && A.i.kind === "log") continue;
    const shared = [...A.f].filter((w) => B.f.has(w));
    if (shared.length >= min) out.push({ a: A.i, b: B.i, shared: shared.slice(0, 4) });
  }
  return out.sort((p, q) => q.shared.length - p.shared.length || p.a.id.localeCompare(q.a.id) || p.b.id.localeCompare(q.b.id)).slice(0, limit);
}
