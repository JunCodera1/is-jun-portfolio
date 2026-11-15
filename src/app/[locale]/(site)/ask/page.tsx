import { getTranslations } from "next-intl/server";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { AskForm } from "@/components/ask/AskForm";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "ask", "/ask");

export default async function AskPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "ask" });
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="ASK" title={t("title")} lead={t("lead")} />
      <p className="label mt-6 max-w-3xl !normal-case !tracking-normal">{t("how")}</p>
      <div className="mt-8"><AskForm /></div>
    </div>
  );
}
