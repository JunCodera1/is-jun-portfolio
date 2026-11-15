import type { MetadataRoute } from "next";
import { locales, localeMeta } from "@/i18n/routing";
import { navigation } from "@/content/data/navigation";
import { projects } from "@/content/data/projects";
import { concepts } from "@/content/data/vault";
import { getEntries } from "@/lib/content";
import { siteUrl } from "@/lib/site";

/** Every language version of every page, each declaring its siblings via hreflang alternates (row 12). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const paths: { path: string; lastModified?: string }[] = [
    { path: "" },
    ...navigation.map((n) => ({ path: n.href })),
    ...projects.map((p) => ({ path: `/projects/${p.slug}` })),
    ...concepts.map((c) => ({ path: `/vault/concepts/${c.id}` })),
    // listed (public) entries only: a private or unlisted note must not even have its address published
    ...(["garden", "journal"] as const).flatMap((c) => getEntries(c, "en").map((e) => ({ path: `/${c}/${e.id}`, lastModified: e.updated ?? e.date }))),
  ];
  return paths.flatMap(({ path, lastModified }) =>
    locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      ...(lastModified ? { lastModified: new Date(`${lastModified}T00:00:00Z`) } : {}),
      alternates: {
        languages: {
          ...Object.fromEntries(locales.map((l) => [localeMeta[l].htmlLang, `${base}/${l}${path}`])),
          "x-default": `${base}/en${path}`,
        },
      },
    })),
  );
}
