import { getTranslations } from "next-intl/server";
import { githubSnapshot } from "@/content/data/github";
import { archiveShelves } from "@/content/data/archive";
import { japanese } from "@/content/data/japanese";
import { projects } from "@/content/data/projects";
import { getEntries } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { textOf } from "@/lib/localized";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { Hideout, type HideoutData } from "@/components/world/Hideout";
import { Visit } from "@/components/world/Visit";
import { WorldTitle } from "@/components/world/WorldTitle";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "hideout", "/hideout");

export default async function HideoutPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale });
  const notes = [...getEntries("journal", locale).map((e) => ({ ...e, kind: t("nav.journal") })), ...getEntries("garden", locale).map((e) => ({ ...e, kind: t("nav.garden") }))]
    .sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 4)
    .map((e) => ({ href: `/${e.collection}/${e.id}`, title: e.title, date: formatDate(e.date, locale, "short"), kind: e.kind }));

  const data: HideoutData = {
    projects: projects.filter((p) => p.featured).map((p) => ({ slug: p.slug, name: p.name, kinds: p.kinds.map((k) => t(`projects.kinds.${k}`)).join(" · ") })),
    notes,
    milestones: [
      ...japanese.milestones.map((m) => ({ label: textOf(m.title, locale), source: "owner" as const, date: m.date ? formatDate(m.date, locale) : undefined })),
      { label: t("hideout.accountCreated"), source: "github" as const, date: formatDate(githubSnapshot.user.createdAt, locale) },
    ],
    board: (["n2", "n1", "linux", "ai", "ue"] as const).map((k) => ({ label: t(`hideout.board.${k}.label`), note: t(`hideout.board.${k}.note`) })),
    shelves: archiveShelves.map((s) => ({ id: s.id, title: t(`archive.shelves.${s.id}`) })),
  };
  return (
    <div className="pb-16">
      <Visit id="place-hideout" />
      <WorldTitle title={t("places.hideout.name")} lead={t("hideout.lead")} />
      <div className="mt-6"><Hideout data={data} /></div>
    </div>
  );
}
