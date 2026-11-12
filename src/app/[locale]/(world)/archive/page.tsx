import { getTranslations } from "next-intl/server";
import { archiveShelves } from "@/content/data/archive";
import { resolveText } from "@/lib/localized";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { ArchiveShelves, type ShelfView } from "@/components/world/ArchiveShelves";
import { Visit } from "@/components/world/Visit";
import { WorldTitle } from "@/components/world/WorldTitle";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "archive", "/archive");

export default async function ArchivePage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale });
  const shelves: ShelfView[] = archiveShelves.map((s) => ({
    id: s.id, title: t(`archive.shelves.${s.id}`),
    items: s.items.map((it) => { const ti = resolveText(it.title, locale); const n = resolveText(it.note, locale); return { id: it.id, title: ti.text, note: n.text, lang: ti.lang !== locale ? ti.lang : undefined, source: it.source, url: it.url, color: it.color }; }),
  }));
  return (
    <div className="pb-16">
      <Visit id="place-archive" />
      <WorldTitle title={t("places.archive.name")} lead={t("archive.lead")} />
      <ArchiveShelves shelves={shelves} />
    </div>
  );
}
