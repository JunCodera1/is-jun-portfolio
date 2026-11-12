import { getTranslations } from "next-intl/server";
import { fieldNotes, GITHUB_USER_URL } from "@/content/data/lab";
import { githubSnapshot } from "@/content/data/github";
import { projects } from "@/content/data/projects";
import { latestPush } from "@/lib/derived";
import { formatDate } from "@/lib/format";
import { resolveText } from "@/lib/localized";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { CaseBoard, type CaseFile } from "@/components/world/CaseBoard";
import { Visit } from "@/components/world/Visit";
import { WorldTitle } from "@/components/world/WorldTitle";
import { ArrowUpRight } from "@/components/ui/Icons";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "lab", "/lab");

export default async function LabPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale });
  const cases: CaseFile[] = projects.map((p) => {
    const s = resolveText(p.summary, locale);
    const push = latestPush(githubSnapshot.repos, p.repos.map((r) => r.split("/")[1]!));
    return {
      slug: p.slug, name: p.name, kinds: p.kinds.map((k) => t(`projects.kinds.${k}`)).join(" · "), summary: s.text, lang: s.lang !== locale ? s.lang : undefined,
      highlights: p.highlights.map((h) => resolveText(h, locale).text), stack: p.stack, repos: p.repos, demo: p.demo?.url, lastPush: push ? formatDate(push, locale) : undefined,
      status: p.status ? t(`projects.status.${p.status}`) : undefined,
    };
  });
  return (
    <div className="pb-16">
      <Visit id="place-lab" />
      <WorldTitle title={t("places.lab.name")} lead={t("lab.lead")} />
      <CaseBoard cases={cases} />
      <section aria-labelledby="field" className="page mt-16">
        <h2 id="field" className="plate !text-xl">{t("lab.fieldTitle")}</h2>
        <p className="mt-3 max-w-[60ch] text-fg-2">{t("lab.fieldLead")}</p>
        <ul className="mt-6 grid gap-5 md:grid-cols-3">
          {fieldNotes.map((f) => (
            <li key={f.id} className="border-2 border-outline bg-surface p-5 shadow-[5px_5px_0_var(--accent)]">
              <h3 className="stage-title text-3xl">{t(`lab.notes.${f.id}.title`)}</h3>
              <p className="mt-2 text-sm text-fg-2">{t(`lab.notes.${f.id}.desc`)}</p>
              <ul className="mt-4 space-y-2">
                {f.repos.map((r) => (
                  <li key={r.name}><a href={`${GITHUB_USER_URL}/${r.name}`} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-2 font-mono text-sm">{r.name}<span className="chip !py-0 !text-[0.65rem]">{t(`lab.${r.kind}`)}</span><ArrowUpRight width={12} height={12} /><span className="sr-only"> ({t("lab.newTab")})</span></a></li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
