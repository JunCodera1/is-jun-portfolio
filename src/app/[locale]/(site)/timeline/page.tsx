import { getTranslations } from "next-intl/server";
import { githubSnapshot } from "@/content/data/github";
import { ownerTimeline } from "@/content/data/timeline";
import { textOf } from "@/lib/localized";
import { firstRepoPerLanguage } from "@/lib/derived";
import { formatDate } from "@/lib/format";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { HorizontalGallery } from "@/components/motion/HorizontalGallery";
import { PageHeader } from "@/components/ui/PageHeader";
import { Placeholder } from "@/components/ui/Placeholder";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "timeline", "/timeline");

export default async function TimelinePage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "timeline" });
  const tg = await getTranslations({ locale, namespace: "gallery" });

  type Row = { date: string; title: string; href?: string; source: "github" | "owner" };
  const rows: Row[] = [
    { date: githubSnapshot.user.createdAt, title: t("accountCreated"), href: `https://github.com/${githubSnapshot.user.login}`, source: "github" as const },
    ...firstRepoPerLanguage(githubSnapshot.repos).map((f): Row => ({
      date: f.createdAt, title: t("firstRepo", { language: f.language, repo: f.repo }), href: f.url, source: "github",
    })),
    ...ownerTimeline.map((o): Row => ({ date: o.date, title: textOf(o.title, locale), href: o.url, source: "owner" })),
  ].sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <div className="page pb-8">
      <PageHeader navId="timeline" title={t("title")} lead={t("lead")} />

      <div className="max-w-3xl py-10">
        <Placeholder locale={locale} title={t("ownerSlotTitle")}>{t("ownerSlot")}</Placeholder>
      </div>
      <HorizontalGallery label={t("title")} prev={tg("prev")} next={tg("next")}>
        {rows.map((r, i) => (
          <article key={i} data-card className="card-ink flex w-[min(78vw,22rem)] shrink-0 snap-center flex-col p-6">
            <time dateTime={r.date.slice(0, 10)} className="font-display text-3xl leading-none">{formatDate(r.date, locale)}</time>
            <p className="mt-4 font-display text-xl leading-snug tracking-tight [overflow-wrap:anywhere]">
              {r.href ? <a href={r.href} target="_blank" rel="noopener noreferrer" className="link">{r.title}</a> : r.title}
            </p>
            <p className="label mt-auto pt-5 !text-fg-3">{String(i + 1).padStart(2, "0")} · {r.source === "owner" ? t("sourceOwner") : t("sourceGithub")}</p>
          </article>
        ))}
      </HorizontalGallery>
      <p className="label border-t border-line py-4 !normal-case !tracking-normal">
        {t("derivedNote", { date: formatDate(githubSnapshot.fetchedAt, locale) })}
      </p>
    </div>
  );
}
