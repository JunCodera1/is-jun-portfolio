import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getEntries } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";
export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }));

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 feed of Journal posts in the requested language (supplementary feature, not a sheet row). */
export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return new Response("Not found", { status: 404 });
  const t = await getTranslations({ locale });
  const base = `${siteUrl()}/${locale}`;
  const items = getEntries("journal", locale)
    .map((e) => `    <item>
      <title>${esc(e.title)}</title>
      <link>${base}/journal/${e.id}</link>
      <guid isPermaLink="true">${base}/journal/${e.id}</guid>
      <pubDate>${new Date(`${e.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(e.summary)}</description>
    </item>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${t("meta.siteName")} — ${t("journal.title")}`)}</title>
    <link>${base}/journal</link>
    <description>${esc(t("journal.lead"))}</description>
    <language>${locale}</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
