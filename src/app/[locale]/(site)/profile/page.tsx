import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { careerEntries } from "@/content/data/education";
import { projects } from "@/content/data/projects";
import { skillCategories, skills } from "@/content/data/skills";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { textOf } from "@/lib/localized";
import { PageHeader } from "@/components/ui/PageHeader";
import { Placeholder } from "@/components/ui/Placeholder";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "profile", "/profile");

export default async function ProfilePage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "profile" });
  const nameOf = (slug: string) => projects.find((p) => p.slug === slug)?.name ?? slug;

  const education = careerEntries.filter((e) => e.kind === "education");
  const experience = careerEntries.filter((e) => e.kind !== "education");

  return (
    <div className="page pb-8">
      <PageHeader navId="profile" title={t("title")} lead={t("lead")}>
        <p className="mt-6"><Link href="/recruiter" className="link label">{t("recruiterLink")} →</Link></p>
      </PageHeader>

      <section aria-labelledby="skills-title" className="py-12 md:py-16">
        <h2 id="skills-title" className="text-3xl md:text-5xl">{t("skillsTitle")}</h2>
        <p className="mt-3 max-w-[58ch] text-fg-2">{t("skillsNote")}</p>

        <div className="mt-10 space-y-12">
          {skillCategories.map((cat) => (
            <div key={cat} className="reveal grid gap-4 md:grid-cols-12 md:gap-8">
              <h3 className="label pt-2 !text-fg-2 md:col-span-3">{t(`categories.${cat}`)}</h3>
              <ul className="divide-y divide-line border-y border-line md:col-span-9">
                {skills.filter((s) => s.category === cat).map((s) => (
                  <li key={s.name} className="grid gap-2 py-3 md:grid-cols-[14rem_1fr] md:items-baseline md:gap-6">
                    <span className="font-display text-xl tracking-tight">{s.name}</span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="label mr-1">{t("usedIn")}</span>
                      {s.usedIn.map((u) => (
                        <Link key={u.slug} href={`/projects/${u.slug}`} title={u.evidence} className="chip">{nameOf(u.slug)}</Link>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-12 border-t border-line-strong py-12 md:grid-cols-2">
        {([["educationTitle", education], ["experienceTitle", experience]] as const).map(([key, list]) => (
          <section key={key} aria-labelledby={`career-${key}`}>
            <h2 id={`career-${key}`} className="mb-5 text-2xl md:text-3xl">{t(key)}</h2>
            {list.length === 0 ? (
              <Placeholder locale={locale} compact>{t("careerEmpty")}</Placeholder>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {list.map((e) => (
                  <li key={e.id} className="py-4">
                    <p className="label">{t(`careerKinds.${e.kind}`)} · {e.start ?? "—"} – {e.end === "present" ? t("present") : e.end ?? "—"}</p>
                    <p className="font-display text-xl">{textOf(e.title, locale)}{e.org ? ` — ${e.org}` : ""}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
