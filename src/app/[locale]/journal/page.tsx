import { getTranslations } from "next-intl/server";
import { getEntries } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { tagLabel } from "@/lib/tags";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContentExplorer, type ExplorerItem } from "@/components/interactive/ContentExplorer";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "journal", "/journal");

export default async function JournalPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale });
  const items: ExplorerItem[] = getEntries("journal", locale).map((e) => ({
    id: e.id,
    href: `/journal/${e.id}`,
    title: e.title,
    summary: e.summary,
    dateLabel: formatDate(e.date, locale, "short"),
    tags: e.tags.map((id) => ({ id, label: tagLabel(t, id) })),
    badge: e.status === "translated" ? undefined : t(`translation.${e.status}`),
    lang: e.lang !== locale ? e.lang : undefined,
    meta: t("common.minRead", { minutes: e.readingMinutes }),
  }));
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="04" title={t("journal.title")} lead={t("journal.lead")}>
        <p className="mt-6"><a href={`/${locale}/feed.xml`} className="link label">{t("journal.feed")} ↗</a></p>
      </PageHeader>
      <ContentExplorer ns="journal" items={items} />
    </div>
  );
}
