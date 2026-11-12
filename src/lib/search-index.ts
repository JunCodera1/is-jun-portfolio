import "server-only";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { navigation } from "@/content/data/navigation";
import { projects } from "@/content/data/projects";
import { resolveText } from "@/lib/localized";
import { getEntries } from "@/lib/content";
import { tagLabel } from "@/lib/tags";
import type { SearchEntry } from "@/lib/search";

/** Index of pages, projects, notes and posts for one locale — built only from real content. */
export async function buildSearchIndex(locale: Locale): Promise<SearchEntry[]> {
  const t = await getTranslations({ locale });

  const pages: SearchEntry[] = navigation.map((n) => ({
    id: `page:${n.id}`, type: "page", title: t(`nav.${n.labelKey}`),
    summary: t.has(`nav.desc.${n.id}`) ? t(`nav.desc.${n.id}`) : "", tags: [], href: n.href, lang: locale, status: "translated",
  }));

  const projectEntries: SearchEntry[] = projects.map((p) => {
    const s = resolveText(p.summary, locale);
    return {
      id: `project:${p.slug}`, type: "project", title: p.name, summary: s.text,
      tags: [...new Set(p.stack.map((x) => x.name)), ...p.kinds.map((k) => t(`projects.kinds.${k}`))],
      href: `/projects/${p.slug}`, lang: s.lang, status: s.status,
    };
  });

  const content: SearchEntry[] = (["garden", "journal"] as const).flatMap((c) =>
    getEntries(c, locale).map<SearchEntry>((e) => ({
      id: `${c}:${e.id}`, type: c, title: e.title, summary: e.summary,
      tags: e.tags.map((tag) => tagLabel(t, tag)), href: `/${c}/${e.id}`, lang: e.lang, status: e.status,
    })),
  );

  return [...pages, ...projectEntries, ...content];
}
