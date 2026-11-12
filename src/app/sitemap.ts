import type { MetadataRoute } from "next";
import { locales, localeMeta } from "@/i18n/routing";
import { navigation } from "@/content/data/navigation";
import { projects } from "@/content/data/projects";
import { listIds, getEntry } from "@/lib/content";
import { siteUrl } from "@/lib/site";

/** Every language version of every page, each declaring its siblings via hreflang alternates (row 12). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const paths: { path: string; lastModified?: string }[] = [
    { path: "" },
    ...navigation.map((n) => ({ path: n.href })),
    ...projects.map((p) => ({ path: `/projects/${p.slug}` })),
    ...(["garden", "journal"] as const).flatMap((c) =>
      listIds(c).map((id) => ({ path: `/${c}/${id}`, lastModified: getEntry(c, id, "en")?.updated ?? getEntry(c, id, "en")?.date })),
    ),
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
