import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getKnowledge } from "@/lib/knowledge/build";
import { buildJsonFeed } from "@/lib/jsonfeed";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";
export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }));

const KINDS = new Set(["note", "post", "decision", "mistake", "research", "idea", "log"]);

/** JSON Feed of everything public and dated: notes, posts, Vault entries and the site log. Same data layer as search and the timeline. */
export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return new Response("Not found", { status: 404 });
  const t = await getTranslations({ locale });
  const base = `${siteUrl()}/${locale}`;
  const k = await getKnowledge(locale);
  const feed = buildJsonFeed({
    title: t("meta.siteName"), homeUrl: base, feedUrl: `${base}/feed.json`, description: t("meta.description"), language: locale,
    items: k.items.filter((i) => i.date && KINDS.has(i.kind)).map((i) => ({ id: `${base}${i.href}`, url: `${base}${i.href}`, title: i.title, summary: i.summary, date: i.date!, tags: [i.kind, ...(i.topic ? [i.topic] : [])], language: i.lang })),
  });
  return new Response(JSON.stringify(feed, null, 2), { headers: { "Content-Type": "application/feed+json; charset=utf-8" } });
}
