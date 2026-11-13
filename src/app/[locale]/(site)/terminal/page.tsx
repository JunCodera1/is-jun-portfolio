import { getTranslations } from "next-intl/server";
import { getTerminalData } from "@/lib/terminal-data";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { Terminal } from "@/components/interactive/Terminal";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "terminal", "/terminal");

export default async function TerminalPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale });
  const data = await getTerminalData(locale);
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="//" title={t("terminal.title")} lead={t("terminal.lead")} />
      <p className="label mt-4 !normal-case !tracking-normal">{t("terminal.shortcut")}</p>
      <div className="mt-6 max-w-4xl">
        <Terminal data={data} />
      </div>
    </div>
  );
}
