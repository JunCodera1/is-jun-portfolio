import { getTranslations } from "next-intl/server";
import { buildSearchIndex } from "@/lib/search-index";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchPanel } from "@/components/interactive/SearchPanel";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "search", "/search");

export default async function SearchPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "search" });
  const entries = await buildSearchIndex(locale);
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="⌕" title={t("title")} lead={t("lead")} />
      <div className="mt-10 max-w-4xl"><SearchPanel entries={entries} /></div>
    </div>
  );
}
