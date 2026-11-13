import { getTranslations } from "next-intl/server";
import { projects } from "@/content/data/projects";
import { githubSnapshot } from "@/content/data/github";
import { latestPush } from "@/lib/derived";
import { formatDate } from "@/lib/format";
import { resolveText } from "@/lib/localized";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { HorizontalGallery } from "@/components/motion/HorizontalGallery";
import { Link } from "@/i18n/navigation";
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
      <PageHeader navId="projects" title={t("projects.title")} lead={t("projects.lead")} />
      <div className="mt-12">
        <h2 className="text-3xl md:text-5xl">{t("projects.exhibition")}</h2>
        <p className="label mt-1 !normal-case !tracking-normal">{t("projects.exhibitionHint")}</p>
        <div className="mt-8">
          <HorizontalGallery label={t("projects.exhibition")} prev={t("gallery.prev")} next={t("gallery.next")}>
            {items.map((p, i) => (
              <article key={p.slug} data-card className="card-ink flex w-[min(82vw,26rem)] shrink-0 snap-center flex-col p-6 lg:w-[30rem]">
                <p className="label">{String(i + 1).padStart(2, "0")} · {p.kinds.map((k) => k.label).join(" · ")}</p>
                <h3 className="stage-title mt-2 text-4xl">{p.name}</h3>
                <p lang={p.lang} className="mt-3 line-clamp-5 text-fg-2">{p.summary}</p>
                <p className="label mt-4 !normal-case !tracking-normal">{p.stack.join(" · ")}</p>
                <p className="mt-auto pt-6"><Link href={`/projects/${p.slug}`} className="btn btn-primary">{t("gallery.open")}</Link></p>
              </article>
            ))}
          </HorizontalGallery>
        </div>
      </div>
      <h2 className="mt-16 text-3xl md:text-5xl">{t("projects.allProjects")}</h2>
      <ProjectsExplorer items={items} />
    </div>
  );
}
