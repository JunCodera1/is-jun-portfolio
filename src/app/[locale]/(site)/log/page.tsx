import { getTranslations } from "next-intl/server";
import { log } from "@/content/data/log";
import { formatDate } from "@/lib/format";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { LText } from "@/components/ui/LText";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "log", "/log");

export default async function LogPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "log" });
  const entries = [...log].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <div className="page pb-8">
      <PageHeader navId="log" title={t("title")} lead={t("lead")} />
      <ol className="mt-10 max-w-3xl border-t-2 border-outline">
        {entries.map((e) => (
          <li key={e.id} className="grid gap-x-6 border-b border-line py-5 sm:grid-cols-[9rem_1fr]">
            <p className="label !normal-case !tracking-normal"><time dateTime={e.date}>{formatDate(e.date, locale, "short")}</time> · {t(`tags.${e.tag}`)}</p>
            <p className="font-display text-xl leading-snug tracking-tight"><LText value={e.text} locale={locale} /></p>
          </li>
        ))}
      </ol>
      <p className="label mt-8 !normal-case !tracking-normal">{t("how")}</p>
    </div>
  );
}
