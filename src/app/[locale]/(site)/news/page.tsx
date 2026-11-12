import { getFormatter, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getHackerNews, getZennTrending } from "@/lib/news-feed";
import type { NewsItem } from "@/lib/news";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArrowUpRight } from "@/components/ui/Icons";

export const revalidate = 1800;
export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "news", "/news");

async function Column({ id, items, locale, empty }: { id: "hn" | "zenn"; items: NewsItem[]; locale: Locale; empty: string }) {
  const t = await getTranslations({ locale, namespace: "news" });
  const f = await getFormatter({ locale });
  return (
    <section aria-labelledby={`news-${id}`}>
      <h2 id={`news-${id}`} className="text-3xl">{t(`${id}.title`)}</h2>
      <p className="label mt-1 !normal-case !tracking-normal">{t(`${id}.desc`)}</p>
      {items.length === 0 ? (
        <p className="slot mt-6">{empty}</p>
      ) : (
        <ol className="mt-6 border-t-2 border-outline">
          {items.map((n, i) => (
            <li key={n.id} className="border-b border-line">
              <a href={n.url} target="_blank" rel="noopener noreferrer nofollow" className="index-row grid grid-cols-[2rem_1fr_auto] items-baseline gap-x-3 px-2 py-4">
                <span className="label">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span lang={n.lang} className="block font-display text-lg leading-snug tracking-tight">{n.title}</span>
                  <span className="label mt-1 block !normal-case !tracking-normal">
                    {new URL(n.url).hostname.replace(/^www\./, "")}
                    {n.points !== undefined && ` · ${t("points", { n: n.points })}`}
                    {n.comments !== undefined && ` · ${t("comments", { n: n.comments })}`}
                    {n.time && ` · ${f.relativeTime(new Date(n.time))}`}
                  </span>
                </span>
                <ArrowUpRight width={16} height={16} className="arrow text-fg-3" />
                <span className="sr-only">({t("opensNewTab")})</span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default async function NewsPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "news" });
  const [hn, zenn] = await Promise.all([getHackerNews(12), getZennTrending(12)]);
  return (
    <div className="page pb-8">
      <PageHeader navId="news" title={t("title")} lead={t("lead")} />
      <p className="label mt-6 !normal-case !tracking-normal">{t("note")}</p>
      <div className="mt-10 grid gap-14 lg:grid-cols-2">
        <Column id="hn" items={hn} locale={locale} empty={t("empty")} />
        <Column id="zenn" items={zenn} locale={locale} empty={t("empty")} />
      </div>
    </div>
  );
}
