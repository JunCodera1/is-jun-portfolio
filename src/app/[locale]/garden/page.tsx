import { getTranslations } from "next-intl/server";
import { getEntries } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { tagLabel } from "@/lib/tags";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContentExplorer, type ExplorerItem } from "@/components/interactive/ContentExplorer";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "garden", "/garden");

export default async function GardenPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale });
  const items: ExplorerItem[] = getEntries("garden", locale).map((e) => ({
    id: e.id,
    href: `/garden/${e.id}`,
    title: e.title,
    summary: e.summary,
    dateLabel: formatDate(e.date, locale, "short"),
    tags: e.tags.map((id) => ({ id, label: tagLabel(t, id) })),
    badge: e.status === "translated" ? undefined : t(`translation.${e.status}`),
    lang: e.lang !== locale ? e.lang : undefined,
    meta: t("common.minRead", { minutes: e.readingMinutes }),
    accent: e.maturity ? t(`garden.maturity.${e.maturity}`) : undefined,
  }));
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="02 / 03" title={t("garden.title")} lead={t("garden.lead")} />
      <ContentExplorer ns="garden" items={items} />
    </div>
  );
}
