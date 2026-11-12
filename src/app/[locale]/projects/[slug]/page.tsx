import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getProject, projects } from "@/content/data/projects";
import type { CaseStudySection } from "@/content/data/types";
import { githubSnapshot } from "@/content/data/github";
import { earliestCreated, latestPush } from "@/lib/derived";
import { formatDate } from "@/lib/format";
import { resolveText, worstStatus } from "@/lib/localized";
import { buildMetadata } from "@/lib/seo";
import { initLocale } from "@/lib/page";
import { LText } from "@/components/ui/LText";
import { Placeholder } from "@/components/ui/Placeholder";
import { TranslationBanner } from "@/components/ui/TranslationBanner";
import { ArrowUpRight } from "@/components/ui/Icons";

type Props = { params: Promise<{ locale: string; slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const p = getProject(slug);
  if (!p) return {};
  return buildMetadata({ locale, path: `/projects/${slug}`, title: p.name, description: resolveText(p.summary, locale).text });
}

const ORDER: CaseStudySection[] = ["overview", "problem", "goals", "role", "stack", "architecture", "implementation", "challenges", "results", "lessons"];

export default async function ProjectPage({ params }: Props) {
  const locale = await initLocale(params);
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const t = await getTranslations({ locale });
  const names = p.repos.map((r) => r.split("/")[1]!);
  const push = latestPush(githubSnapshot.repos, names);
  const created = earliestCreated(githubSnapshot.repos, names);

  const status = worstStatus([
    resolveText(p.summary, locale).status,
    ...p.highlights.map((h) => resolveText(h, locale).status),
    ...Object.values(p.caseStudy).map((v) => resolveText(v, locale).status),
  ]);

  return (
    <article className="page pb-8">
      <header className="border-b border-line pb-12 pt-14 md:pb-16 md:pt-20">
        <Link href="/projects" className="link label mb-8 inline-block">← {t("projects.detail.back")}</Link>
        <p className="mb-4 flex flex-wrap gap-1.5">{p.kinds.map((k) => <span key={k} className="chip">{t(`projects.kinds.${k}`)}</span>)}</p>
        <h1 className="text-[clamp(3rem,10vw,9rem)] font-medium leading-[0.9] tracking-[-0.045em]">{p.name}</h1>
        <p className="mt-8 max-w-[62ch] text-lg text-fg-2 md:text-xl"><LText value={p.summary} locale={locale} /></p>
      </header>

      <div className="grid gap-12 pt-10 lg:grid-cols-12">
        <aside className="lg:col-span-3 lg:row-start-1">
          <div className="space-y-8 lg:sticky lg:top-24">
            <div>
              <h2 className="label mb-3">{t("projects.detail.repos")}</h2>
              <ul className="space-y-2">
                {p.repos.map((r) => (
                  <li key={r}>
                    <a href={`https://github.com/${r}`} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5 break-all font-mono text-sm">
                      {r.split("/")[1]}<ArrowUpRight width={13} height={13} /><span className="sr-only"> ({t("common.opensNewTab")})</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {p.demo && (
              <div>
                <h2 className="label mb-3">{t("common.demo")}</h2>
                <a href={p.demo.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  {t("common.demo")}<ArrowUpRight width={15} height={15} /><span className="sr-only"> ({t("common.opensNewTab")})</span>
                </a>
              </div>
            )}
            <dl className="space-y-3 text-sm">
              {push && <div><dt className="label">{t("projects.detail.lastPushLabel")}</dt><dd className="font-mono">{formatDate(push, locale)}</dd></div>}
              {created && <div><dt className="label">{t("projects.detail.createdLabel")}</dt><dd className="font-mono">{formatDate(created, locale)}</dd></div>}
              <div>
                <dt className="label">{t("projects.statusLabel")}</dt>
                <dd className="font-mono">{p.status ? t(`projects.status.${p.status}`) : <span className="text-fg-3">{t("projects.statusUnset")}</span>}</dd>
              </div>
            </dl>
          </div>
        </aside>

        <div className="min-w-0 lg:col-span-9 lg:col-start-4">
          <TranslationBanner status={status === "untranslated" ? "untranslated" : status} locale={locale} />

          <section aria-labelledby="highlights" className="mb-14">
            <h2 id="highlights" className="label mb-4 !text-fg-2">{t("projects.detail.highlights")}</h2>
            <ul className="divide-y divide-line border-y border-line">
              {p.highlights.map((h, i) => (
                <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-3 py-5 text-lg">
                  <span className="label pt-1.5">{String(i + 1).padStart(2, "0")}</span>
                  <span><LText value={h} locale={locale} /></span>
                </li>
              ))}
            </ul>
          </section>

          <div className="divide-y divide-line border-t border-line">
            {ORDER.map((key, i) => {
              const text = p.caseStudy[key];
              return (
                <section key={key} aria-labelledby={`cs-${key}`} className="grid gap-4 py-8 md:grid-cols-[10rem_1fr] md:gap-8">
                  <h2 id={`cs-${key}`} className="flex items-baseline gap-3 text-xl md:block">
                    <span className="label mr-3 md:mb-1 md:mr-0 md:block">{String(i + 1).padStart(2, "0")}</span>
                    {t(`projects.detail.sections.${key}`)}
                  </h2>
                  <div className="min-w-0 max-w-[68ch]">
                    {key === "stack" ? (
                      <>
                        <p className="mb-4 text-sm text-fg-2">{t("projects.detail.stackNote")}</p>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[34rem] border-collapse text-sm">
                            <thead>
                              <tr className="label text-left">
                                <th scope="col" className="border-b border-line-strong py-2 pr-4 font-normal">{t("projects.detail.stackColumn")}</th>
                                <th scope="col" className="border-b border-line-strong py-2 pr-4 font-normal">{t("projects.detail.evidenceColumn")}</th>
                                <th scope="col" className="border-b border-line-strong py-2 font-normal">{t("projects.detail.repoColumn")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {p.stack.map((s) => (
                                <tr key={`${s.repo}-${s.name}`} className="align-top">
                                  <th scope="row" className="border-b border-line py-2.5 pr-4 text-left font-medium">{s.name}</th>
                                  <td className="border-b border-line py-2.5 pr-4 font-mono text-[0.8rem] text-fg-2">{s.evidence}</td>
                                  <td className="border-b border-line py-2.5 font-mono text-[0.8rem] text-fg-2">{s.repo}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : text ? (
                      <>
                        <p className="text-lg"><LText value={text} locale={locale} /></p>
                        <p className="label mt-2 !normal-case !tracking-normal">{t("projects.detail.verifiedFrom")}</p>
                      </>
                    ) : (
                      <Placeholder locale={locale} compact>{t("projects.detail.ownerNeeded")}</Placeholder>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
