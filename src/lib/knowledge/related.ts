import { type Knowledge, type Kind } from "./types";

const SEARCHABLE = new Set<Kind>(["project", "note", "post", "concept", "research", "mistake", "decision", "idea"]);

/**
 * For each item, the pages it is connected to: direct edges first (strong), then items that share its topic (weaker).
 * Used by discovery ("follow a connection") and by the assistant ("inferred relations").
 */
export function relatedHrefs(k: Knowledge, limit = 12): Map<string, string[]> {
  const byId = new Map(k.items.map((i) => [i.id, i]));
  const strong = new Map<string, Set<string>>(), weak = new Map<string, Set<string>>();
  const add = (m: Map<string, Set<string>>, a: string, b: string) => { if (!m.has(a)) m.set(a, new Set()); m.get(a)!.add(b); };
  for (const e of k.edges) {
    const a = byId.get(e.from), b = byId.get(e.to);
    if (a && b && a.kind !== "topic" && b.kind !== "topic") { add(strong, a.id, b.id); add(strong, b.id, a.id); }
  }
  const byTopic = new Map<string, string[]>();
  for (const i of k.items) if (i.topic && SEARCHABLE.has(i.kind)) byTopic.set(i.topic, [...(byTopic.get(i.topic) ?? []), i.id]);
  for (const ids of byTopic.values()) for (const a of ids) for (const b of ids) if (a !== b) add(weak, a, b);
  const out = new Map<string, string[]>();
  for (const i of k.items) {
    const hrefs = [...(strong.get(i.id) ?? []), ...(weak.get(i.id) ?? [])].map((id) => byId.get(id)?.href.split("#")[0]).filter((h): h is string => !!h);
    out.set(i.id, [...new Set(hrefs)].slice(0, limit));
  }
  return out;
}
