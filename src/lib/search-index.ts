import "server-only";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { glossary } from "@/content/data/vault";
import { navigation } from "@/content/data/navigation";
import { getKnowledge } from "@/lib/knowledge/build";
import type { Kind } from "@/lib/knowledge/types";
import { resolveText } from "@/lib/localized";
import { tagLabel } from "@/lib/tags";
import type { SearchEntry } from "@/lib/search";

const SEARCHABLE: Partial<Record<Kind, SearchEntry["type"]>> = { project: "project", note: "garden", post: "journal", concept: "vault", research: "vault", mistake: "vault", decision: "vault", idea: "vault" };

/**
 * Pages, then everything searchable from the unified data layer (public items only), then glossary terms.
 * Each entry also lists the pages it is connected to, which is what makes discovery context-aware.
 */
export async function buildSearchIndex(locale: Locale): Promise<SearchEntry[]> {
  const t = await getTranslations({ locale });
  const k = await getKnowledge(locale);
  const byId = new Map(k.items.map((i) => [i.id, i]));

  const neighbours = new Map<string, Set<string>>();
  const add = (a: string, b: string) => { if (!neighbours.has(a)) neighbours.set(a, new Set()); neighbours.get(a)!.add(b); };
  for (const e of k.edges) {
    const a = byId.get(e.from), b = byId.get(e.to);
    if (!a || !b) continue;
    if (a.kind !== "topic" && b.kind !== "topic") { add(a.id, b.id); add(b.id, a.id); }
  }
  // items that share a topic are related too (two hops through the topic hub)
  const byTopic = new Map<string, string[]>();
  for (const i of k.items) if (i.topic && SEARCHABLE[i.kind]) byTopic.set(i.topic, [...(byTopic.get(i.topic) ?? []), i.id]);
  for (const ids of byTopic.values()) for (const a of ids) for (const b of ids) if (a !== b) add(a, `~${b}`); // "~" marks a weaker, topic-level relation
  const hrefOf = (id: string) => byId.get(id.replace(/^~/, ""))?.href.split("#")[0];
  const relatedOf = (id: string) => {
    const set = neighbours.get(id) ?? new Set<string>();
    const strong = [...set].filter((x) => !x.startsWith("~")).map(hrefOf);
    const weak = [...set].filter((x) => x.startsWith("~")).map(hrefOf);
    return [...new Set([...strong, ...weak])].filter((x): x is string => !!x).slice(0, 12);
  };

  const pages: SearchEntry[] = navigation.map((n) => ({
    id: `page:${n.id}`, type: "page", title: t(`nav.${n.labelKey}`),
    summary: t.has(`nav.desc.${n.id}`) ? t(`nav.desc.${n.id}`) : "", tags: [], href: n.href, lang: locale, status: "translated",
  }));

  const items: SearchEntry[] = k.items.flatMap((i): SearchEntry[] => {
    const type = SEARCHABLE[i.kind];
    if (!type) return [];
    const tags = type === "garden" || type === "journal" ? i.tags.map((tag) => tagLabel(t, tag)) : type === "vault" ? [t(`vault.topics.${i.topic ?? "general"}`)] : i.tags;
    return [{ id: i.id, type, title: i.title, summary: i.summary, tags, href: i.href, lang: i.lang, status: i.status, related: relatedOf(i.id) }];
  });

  const terms: SearchEntry[] = glossary.map((g) => {
    const d = resolveText(g.def, locale);
    return { id: `term:${g.id}`, type: "vault", title: `${g.term.en} · ${g.term.ja} · ${g.term.vi}`, summary: d.text, tags: [t(`vault.topics.${g.topic}`)], href: `/vault/glossary#${g.id}`, lang: d.lang, status: d.status };
  });

  return [...pages, ...items, ...terms];
}
