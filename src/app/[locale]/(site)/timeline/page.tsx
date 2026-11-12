import { getTranslations } from "next-intl/server";
import { githubSnapshot } from "@/content/data/github";
import { ownerTimeline } from "@/content/data/timeline";
import { textOf } from "@/lib/localized";
import { firstRepoPerLanguage } from "@/lib/derived";
import { formatDate } from "@/lib/format";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { Placeholder } from "@/components/ui/Placeholder";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "timeline", "/timeline");

export default async function TimelinePage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "timeline" });

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

      <div className="grid gap-12 py-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <Placeholder locale={locale} title={t("ownerSlotTitle")}>{t("ownerSlot")}</Placeholder>
        </div>

        <ol className="relative md:col-span-7 md:col-start-6">
          <span aria-hidden className="absolute bottom-2 left-[0.4rem] top-2 w-px bg-line-strong" />
          {rows.map((r, i) => (
            <li key={i} className="reveal relative pb-9 pl-9">
              <span aria-hidden className="absolute left-0 top-[0.55rem] h-[0.8rem] w-[0.8rem] border border-line-strong bg-bg" />
              <time dateTime={r.date.slice(0, 10)} className="label">{formatDate(r.date, locale)}</time>
              <p className="mt-1 font-display text-xl tracking-tight md:text-2xl">
                {r.href ? <a href={r.href} target="_blank" rel="noopener noreferrer" className="link">{r.title}</a> : r.title}
              </p>
              <p className="label mt-1 !text-fg-3">{r.source === "owner" ? t("sourceOwner") : t("sourceGithub")}</p>
            </li>
          ))}
        </ol>
      </div>
      <p className="label border-t border-line py-4 !normal-case !tracking-normal">
        {t("derivedNote", { date: formatDate(githubSnapshot.fetchedAt, locale) })}
      </p>
    </div>
  );
}
