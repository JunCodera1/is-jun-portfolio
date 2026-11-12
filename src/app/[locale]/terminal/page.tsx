import { getTranslations } from "next-intl/server";
import { aboutSections } from "@/content/data/about";
import { interests } from "@/content/data/interests";
import { nowSections, nowUpdated } from "@/content/data/now";
import { profile, socialLinks } from "@/content/data/profile";
import { projects } from "@/content/data/projects";
import { skillCategories, skills } from "@/content/data/skills";
import { getEntries } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { textOf } from "@/lib/localized";
import { COMMAND_NAMES, type TerminalData, type TLine } from "@/lib/terminal";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { Terminal } from "@/components/interactive/Terminal";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "terminal", "/terminal");

export default async function TerminalPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale });
  const none: TLine[] = [{ text: t("terminal.none") }];

  const garden = getEntries("garden", locale);
  const journal = getEntries("journal", locale);
  void aboutSections;

  const outputs: TerminalData["outputs"] = {
    about: [
      { text: t("terminal.aboutIntro", { name: profile.displayName }) },
      { text: t("terminal.aboutGithub", { url: socialLinks[0]!.url }), href: socialLinks[0]!.url },
      { text: t("terminal.aboutBody", { path: "/about" }), href: "/about" },
    ],
    projects: projects.map((p) => ({ text: `${p.name} — ${p.kinds.map((k) => t(`projects.kinds.${k}`)).join(" · ")}`, href: `/projects/${p.slug}` })),
    skills: skillCategories.map((c) => ({
      text: `${t(`profile.categories.${c}`)}: ${skills.filter((s) => s.category === c).map((s) => s.name).join(", ")}`,
    })),
    interests: interests.some((c) => c.items.length)
      ? interests.filter((c) => c.items.length).map((c) => ({ text: `${t(`interests.categories.${c.id}`)}: ${c.items.map((i) => textOf(i.title, locale)).join(", ")}` }))
      : [{ text: t("interests.empty") }],
    journal: journal.length ? journal.map((e) => ({ text: `${formatDate(e.date, locale, "short")}  ${e.title}`, href: `/journal/${e.id}` })) : none,
    garden: garden.length ? garden.map((e) => ({ text: `${formatDate(e.date, locale, "short")}  ${e.title}`, href: `/garden/${e.id}` })) : none,
    now: [
      { text: t("now.updated", { date: formatDate(nowUpdated, locale) }) },
      ...nowSections.flatMap((s) => (s.items.length ? [{ text: `${t(`now.sections.${s.id}`)}: ${s.items.map((i) => textOf(i, locale)).join("; ")}` }] : [])),
      ...(nowSections.every((s) => s.items.length === 0) ? none : []),
    ],
    contact: [
      { text: profile.email ? t("terminal.emailLabel", { email: profile.email }) : t("terminal.emailMissing") },
      ...socialLinks.map((s) => ({ text: `${s.label}: ${s.url}`, href: s.url })),
    ],
  };

  const data: TerminalData = {
    commands: COMMAND_NAMES.map((name) => ({ name, description: name === "help" ? t("terminal.help") : t(`terminal.descriptions.${name}`) })),
    outputs,
    labels: { unknown: t("terminal.unknown", { cmd: "{cmd}" }), helpTitle: t("terminal.helpTitle"), help: t("terminal.help") },
  };

  return (
    <div className="page pb-8">
      <PageHeader eyebrow="//" title={t("terminal.title")} lead={t("terminal.lead")} />
      <div className="mt-10 max-w-4xl">
        <Terminal data={data} />
      </div>
    </div>
  );
}
