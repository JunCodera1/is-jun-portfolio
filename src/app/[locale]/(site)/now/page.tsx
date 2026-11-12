import { getTranslations } from "next-intl/server";
import { nowSections, nowUpdated } from "@/content/data/now";
import { getRecentRepos } from "@/lib/github-feed";
import { formatDate } from "@/lib/format";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { LText } from "@/components/ui/LText";
import { Placeholder } from "@/components/ui/Placeholder";
import { ArrowUpRight } from "@/components/ui/Icons";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "now", "/now");

export default async function NowPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "now" });
  const th = await getTranslations({ locale, namespace: "home" });
  const feed = await getRecentRepos(5);

  return (
    <div className="page pb-8">
      <PageHeader navId="now" title={t("title")} lead={t("lead")}>
        <p className="label mt-8 inline-block border border-line-strong px-3 py-1.5">
          <time dateTime={nowUpdated}>{t("updated", { date: formatDate(nowUpdated, locale) })}</time>
        </p>
      </PageHeader>

      <div className="grid gap-x-8 md:grid-cols-2">
        {nowSections.map((s) => (
          <section key={s.id} aria-labelledby={`now-${s.id}`} className="reveal border-b border-line py-9">
            <h2 id={`now-${s.id}`} className="label mb-4 !text-fg-2">{t(`sections.${s.id}`)}</h2>
            {s.items.length === 0 ? (
              <Placeholder locale={locale} compact>{t("empty")}</Placeholder>
            ) : (
              <ul className="space-y-3 text-lg">
                {s.items.map((it, i) => <li key={i}><LText value={it} locale={locale} /></li>)}
              </ul>
            )}
          </section>
        ))}
      </div>

      <section aria-labelledby="now-github" className="mt-14">
        <h2 id="now-github" className="text-2xl md:text-3xl">{t("githubTitle")}</h2>
        <p className="label mt-2 !normal-case !tracking-normal">
          {t("githubNote")} {feed.source === "live" ? th("pulseSourceLive") : th("pulseSourceSnapshot", { date: formatDate(feed.asOf, locale, "short") })}
        </p>
        <ul className="mt-6 border-t border-line-strong">
          {feed.repos.map((r) => (
            <li key={r.name} className="border-b border-line">
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="index-row grid grid-cols-[1fr_auto] items-baseline gap-x-6 px-2 py-4 md:grid-cols-[14rem_1fr_9rem_1.5rem] md:px-4">
                <span className="font-display text-xl tracking-tight">{r.name}</span>
                <span className="col-span-2 col-start-1 row-start-2 text-sm text-fg-2 md:col-span-1 md:col-start-auto md:row-start-auto">{r.description ?? r.language ?? ""}</span>
                <span className="label text-right">{t("pushed", { date: formatDate(r.pushedAt, locale, "short") })}</span>
                <ArrowUpRight width={16} height={16} className="arrow hidden text-fg-3 md:block" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
