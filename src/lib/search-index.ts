import "server-only";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { glossary } from "@/content/data/vault";
import { navigation } from "@/content/data/navigation";
import { getKnowledge } from "@/lib/knowledge/build";
import { relatedHrefs } from "@/lib/knowledge/related";
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
  const related = relatedHrefs(k);

  const pages: SearchEntry[] = navigation.map((n) => ({
    id: `page:${n.id}`, type: "page", title: t(`nav.${n.labelKey}`),
    summary: t.has(`nav.desc.${n.id}`) ? t(`nav.desc.${n.id}`) : "", tags: [], href: n.href, lang: locale, status: "translated",
  }));

  const items: SearchEntry[] = k.items.flatMap((i): SearchEntry[] => {
    const type = SEARCHABLE[i.kind];
    if (!type) return [];
    const tags = type === "garden" || type === "journal" ? i.tags.map((tag) => tagLabel(t, tag)) : type === "vault" ? [t(`vault.topics.${i.topic ?? "general"}`)] : i.tags;
    return [{ id: i.id, type, title: i.title, summary: i.summary, tags, href: i.href, lang: i.lang, status: i.status, related: related.get(i.id) ?? [] }];
  });

  const terms: SearchEntry[] = glossary.map((g) => {
    const d = resolveText(g.def, locale);
    return { id: `term:${g.id}`, type: "vault", title: `${g.term.en} · ${g.term.ja} · ${g.term.vi}`, summary: d.text, tags: [t(`vault.topics.${g.topic}`)], href: `/vault/glossary#${g.id}`, lang: d.lang, status: d.status };
  });

  return [...pages, ...items, ...terms];
}
