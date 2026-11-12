import { getTranslations } from "next-intl/server";
import { careerEntries } from "@/content/data/education";
import { profile, socialLinks } from "@/content/data/profile";
import { featuredProjects } from "@/content/data/projects";
import { skillCategories, skills } from "@/content/data/skills";
import { githubSnapshot } from "@/content/data/github";
import { latestPush } from "@/lib/derived";
import { formatDate } from "@/lib/format";
import { textOf } from "@/lib/localized";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { LText } from "@/components/ui/LText";
import { Placeholder } from "@/components/ui/Placeholder";
import { PrintButton } from "@/components/interactive/PrintButton";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "recruiter", "/recruiter");

/** Compact view (row 24). Same verified data, one dense page, prints cleanly. Not linked from the home Index on purpose. */
export default async function RecruiterPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale });

  return (
    <div className="page max-w-5xl pb-8 pt-14 md:pt-20">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line-strong pb-8">
        <div>
          <p className="label mb-3">{t("recruiter.title")}</p>
          <h1 className="text-5xl font-medium tracking-[-0.03em] md:text-7xl">{profile.displayName}</h1>
          <p className="mt-3 max-w-[55ch] text-fg-2">{t("recruiter.lead")}</p>
        </div>
        <PrintButton label={t("recruiter.print")} />
      </header>

      <section aria-labelledby="rec-links" className="grid gap-3 border-b border-line py-6 md:grid-cols-[10rem_1fr]">
        <h2 id="rec-links" className="label pt-1">{t("recruiter.links")}</h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          {socialLinks.map((s) => <li key={s.id}><a className="link" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}: {s.url.replace("https://", "")}</a></li>)}
          <li className="text-fg-2">{profile.email ? profile.email : t("contact.emailMissing")}</li>
        </ul>
      </section>

      <section aria-labelledby="rec-projects" className="py-8">
        <h2 id="rec-projects" className="label mb-4">{t("recruiter.projects")}</h2>
        <ol className="divide-y divide-line border-y border-line">
          {featuredProjects.map((p) => {
            const push = latestPush(githubSnapshot.repos, p.repos.map((r) => r.split("/")[1]!));
            return (
              <li key={p.slug} className="grid gap-2 py-5 md:grid-cols-[14rem_1fr]">
                <div>
                  <h3 className="font-display text-2xl tracking-tight">{p.name}</h3>
                  <p className="label mt-1">{p.kinds.map((k) => t(`projects.kinds.${k}`)).join(" · ")}</p>
                  {push && <p className="label mt-1">{t("projects.lastPush", { date: formatDate(push, locale, "short") })}</p>}
                </div>
                <div>
                  <p className="text-fg-2"><LText value={p.summary} locale={locale} /></p>
                  <p className="mt-2 font-mono text-[0.78rem] text-fg-3">{[...new Set(p.stack.map((s) => s.name))].join(" · ")}</p>
                  <p className="mt-1 font-mono text-[0.78rem]">
                    {p.repos.map((r) => <a key={r} className="link mr-4" href={`https://github.com/${r}`} target="_blank" rel="noopener noreferrer">{r}</a>)}
                    {p.demo && <a className="link" href={p.demo.url} target="_blank" rel="noopener noreferrer">{t("common.demo")}</a>}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="rec-skills" className="pb-8">
        <h2 id="rec-skills" className="label mb-1">{t("recruiter.skills")}</h2>
        <p className="mb-4 text-sm text-fg-2">{t("recruiter.verifiedNote")}</p>
        <dl className="divide-y divide-line border-y border-line">
          {skillCategories.map((c) => (
            <div key={c} className="grid gap-1 py-3 md:grid-cols-[10rem_1fr]">
              <dt className="label pt-0.5">{t(`profile.categories.${c}`)}</dt>
              <dd>{skills.filter((s) => s.category === c).map((s) => s.name).join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="rec-career" className="pb-8">
        <h2 id="rec-career" className="label mb-4">{t("recruiter.career")}</h2>
        {careerEntries.length === 0 ? (
          <Placeholder locale={locale} compact>{t("profile.careerEmpty")}</Placeholder>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {careerEntries.map((e) => (
              <li key={e.id} className="py-3">{t(`profile.careerKinds.${e.kind}`)} — {textOf(e.title, locale)}{e.org ? `, ${e.org}` : ""} ({e.start ?? "—"} – {e.end === "present" ? t("profile.present") : e.end ?? "—"})</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
