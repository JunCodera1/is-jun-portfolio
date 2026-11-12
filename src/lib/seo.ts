import type { Metadata } from "next";
import { locales, localeMeta, type Locale } from "@/i18n/routing";
import { siteUrl, SITE_NAME } from "@/lib/site";

/** `path` is locale-less ("" for home, "/projects", "/garden/some-note"). */
export function buildMetadata(opts: {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
  type?: "website" | "article";
  noindex?: boolean;
  publishedTime?: string;
}): Metadata {
  const { locale, path = "", title, description, type = "website", noindex, publishedTime } = opts;
  const base = siteUrl();
  const url = `${base}/${locale}${path}`;
  const languages: Record<string, string> = Object.fromEntries(locales.map((l) => [localeMeta[l].htmlLang, `${base}/${l}${path}`]));
  languages["x-default"] = `${base}/en${path}`;
  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale: localeMeta[locale].ogLocale,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeMeta[l].ogLocale),
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Serialise JSON-LD safely for inlining in a <script> tag. */
export const jsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, "\\u003c");
