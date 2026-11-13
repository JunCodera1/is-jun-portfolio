import "server-only";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { interests } from "@/content/data/interests";
import { listedPages } from "@/content/data/navigation";
import { nowSections, nowUpdated } from "@/content/data/now";
import { profile, socialLinks } from "@/content/data/profile";
import { projects } from "@/content/data/projects";
import { skillCategories, skills } from "@/content/data/skills";
import { getEntries } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { textOf } from "@/lib/localized";
import { COMMAND_NAMES, type TerminalData, type TLine } from "@/lib/terminal";

const CARD = [
  "  .-------.",
  "  | ♠     |",
  "  |   ♠   |",
  "  |     ♠ |",
  "  '-------'",
];

/** All terminal output is built here from the site's own data; the terminal itself only looks commands up in this table. */
export async function getTerminalData(locale: Locale): Promise<TerminalData> {
  const t = await getTranslations({ locale });
  const none: TLine[] = [{ text: t("terminal.none") }];
  const garden = getEntries("garden", locale);
  const journal = getEntries("journal", locale);

  const outputs: TerminalData["outputs"] = {
    about: [
      { text: t("terminal.aboutIntro", { name: profile.displayName }) },
      { text: t("terminal.aboutGithub", { url: socialLinks[0]!.url }), href: socialLinks[0]!.url },
      { text: t("terminal.aboutBody", { path: "/about" }), href: "/about" },
    ],
    projects: projects.map((p) => ({ text: `${p.name} — ${p.kinds.map((k) => t(`projects.kinds.${k}`)).join(" · ")}`, href: `/projects/${p.slug}` })),
    skills: skillCategories.map((c) => ({ text: `${t(`profile.categories.${c}`)}: ${skills.filter((s) => s.category === c).map((s) => s.name).join(", ")}` })),
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

    // hidden commands (not listed in help)
    whoami: [{ text: t("terminal.whoami") }],
    neofetch: [
      { text: "my-digital-world" },
      { text: "-----------------" },
      { text: `pages      ${listedPages.length}` },
      { text: `languages  3 (en, ja, vi)` },
      { text: `projects   ${projects.length}` },
      { text: `technologies ${skills.length}` },
      { text: `notes      ${garden.length + journal.length}` },
      { text: `motion     anime.js` },
    ],
    sudo: [{ text: t("terminal.sudo") }],
    hisoka: [...CARD.map((text) => ({ text })), { text: t("terminal.hisoka") }],
    konami: [{ text: "↑ ↑ ↓ ↓ ← → ← → B A" }, { text: t("terminal.konami") }],
    "42": [{ text: t("terminal.fortyTwo") }],
  };

  return {
    commands: COMMAND_NAMES.map((name) => ({ name, description: name === "help" ? t("terminal.help") : t(`terminal.descriptions.${name}`) })),
    outputs,
    labels: {
      unknown: t("terminal.unknown", { cmd: "{cmd}" }), helpTitle: t("terminal.helpTitle"), help: t("terminal.help"), hiddenHint: t("terminal.hiddenHint"),
      usage: { theme: t("terminal.usage.theme"), lang: t("terminal.usage.lang"), go: t("terminal.usage.go") },
    },
  };
}
