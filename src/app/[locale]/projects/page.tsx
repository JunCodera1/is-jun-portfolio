import { getTranslations } from "next-intl/server";
import { projects } from "@/content/data/projects";
import { githubSnapshot } from "@/content/data/github";
import { latestPush } from "@/lib/derived";
import { formatDate } from "@/lib/format";
import { resolveText } from "@/lib/localized";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProjectsExplorer, type ProjectItem } from "@/components/interactive/ProjectsExplorer";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "projects", "/projects");

export default async function ProjectsPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale });

  const items: ProjectItem[] = projects.map((p) => {
    const s = resolveText(p.summary, locale);
    const push = latestPush(githubSnapshot.repos, p.repos.map((r) => r.split("/")[1]!));
    return {
      slug: p.slug,
      name: p.name,
      kinds: p.kinds.map((k) => ({ id: k, label: t(`projects.kinds.${k}`) })),
      summary: s.text,
      lang: s.lang !== locale ? s.lang : undefined,
      badge: s.status === "translated" ? undefined : t(`translation.${s.status}`),
      stack: [...new Set(p.stack.map((x) => x.name))].slice(0, 6),
      meta: push ? t("projects.lastPush", { date: formatDate(push, locale, "short") }) : undefined,
    };
  });

  return (
    <div className="page pb-8">
      <PageHeader eyebrow="07" title={t("projects.title")} lead={t("projects.lead")} />
      <ProjectsExplorer items={items} />
    </div>
  );
}
