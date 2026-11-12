import { getTranslations } from "next-intl/server";
import { aboutSections } from "@/content/data/about";
import { githubSnapshot } from "@/content/data/github";
import { profile } from "@/content/data/profile";
import { languageCounts } from "@/lib/derived";
import { formatDate } from "@/lib/format";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { LText } from "@/components/ui/LText";
import { Placeholder } from "@/components/ui/Placeholder";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "about", "/about");

export default async function AboutPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "about" });
  const langs = languageCounts(githubSnapshot.repos).slice(0, 8);
  const max = Math.max(1, ...langs.map((l) => l.count));

  return (
    <div className="page pb-8">
      <PageHeader navId="about" title={t("title")} lead={t("lead")} />
      <section aria-labelledby="glance" className="border-b border-line py-10">
        <h2 id="glance" className="label mb-4">{t("glance")}</h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {profile.facts.map((f, i) => <li key={i} className="border-2 border-outline bg-surface p-4 shadow-[4px_4px_0_var(--accent)]"><LText value={f} locale={locale} /></li>)}
        </ul>
      </section>

      <div className="mt-4 divide-y divide-line">
        {aboutSections.map((s, i) => (
          <section key={s.id} aria-labelledby={`about-${s.id}`} className="reveal grid gap-4 py-10 md:grid-cols-12 md:gap-8 md:py-14">
            <div className="md:col-span-4">
              <p className="label mb-2">{String(i + 1).padStart(2, "0")}</p>
              <h2 id={`about-${s.id}`} className="text-3xl md:text-4xl">{t(`sections.${s.id}.title`)}</h2>
            </div>
            <div className="max-w-[62ch] text-lg md:col-span-7 md:col-start-6">
              {s.body ? <LText value={s.body} locale={locale} block /> : <Placeholder locale={locale}>{t(`sections.${s.id}.prompt`)}</Placeholder>}
            </div>
          </section>
        ))}
      </div>

      <section aria-labelledby="verified-title" className="mt-10 border-t border-line-strong pt-12 md:pt-16">
        <p className="label mb-2">+</p>
        <h2 id="verified-title" className="text-3xl md:text-5xl">{t("verifiedTitle")}</h2>
        <p className="mt-3 max-w-[52ch] text-fg-2">{t("verifiedLead")}</p>

        <dl className="mt-10 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <dt className="label mb-1">GitHub</dt>
            <dd className="font-display text-4xl tracking-tight md:text-5xl">{t("repoCount", { count: githubSnapshot.repos.length })}</dd>
            <dd className="mt-2 text-fg-2">{t("since", { date: formatDate(githubSnapshot.user.createdAt, locale) })}</dd>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <dt className="label mb-1">{t("languagesTitle")}</dt>
            <dd>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {langs.map((l) => (
                  <li key={l.language} className="grid grid-cols-[8rem_1fr_2rem] items-center gap-4 py-2.5">
                    <span className="font-mono text-sm">{l.language}</span>
                    {/* unit chart: one square per repository (not a percentage, not a skill level) */}
                    <span aria-hidden className="flex flex-wrap gap-[3px]">
                      {Array.from({ length: l.count }).map((_, k) => <span key={k} className="h-2 w-2 bg-accent-fg" style={{ opacity: 0.35 + 0.65 * (l.count / max) }} />)}
                    </span>
                    <span className="text-right font-mono text-sm tabular-nums">{l.count}</span>
                  </li>
                ))}
              </ul>
              <p className="label mt-3 !normal-case !tracking-normal">{t("languagesNote")} {t("snapshot", { date: formatDate(githubSnapshot.fetchedAt, locale) })}</p>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
