import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BASIC_ROWS, VOICED_ROWS } from "@/content/data/kana";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "kana", "/japanese/kana");

function Table({ caption, rows, script, empty }: { caption: string; rows: typeof BASIC_ROWS; script: "h" | "k"; empty: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[22rem] border-collapse text-center">
        <caption className="label mb-3 text-left">{caption}</caption>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              {r.cells.map((c, i) =>
                c ? (
                  <td key={i} className="border border-line p-0">
                    <div lang="ja" className="py-3 font-display text-3xl md:text-4xl">{script === "h" ? c.h : c.k}</div>
                    <div className="label border-t border-line py-1 !text-fg-2">{c.r}</div>
                  </td>
                ) : (
                  <td key={i} className="border border-line bg-surface-2/40 p-0" aria-label={empty}><div className="py-3">&nbsp;</div><div className="border-t border-line py-1">&nbsp;</div></td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function KanaPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "kana" });
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="かな" title={t("title")} lead={t("lead")} />
      <p className="mt-6"><Link href="/play" className="btn btn-primary">{t("play")}</Link></p>
      <div className="mt-12 grid gap-14 lg:grid-cols-2">
        <Table caption={`${t("hiragana")} · ${t("basic")}`} rows={BASIC_ROWS} script="h" empty={t("empty")} />
        <Table caption={`${t("katakana")} · ${t("basic")}`} rows={BASIC_ROWS} script="k" empty={t("empty")} />
        <Table caption={`${t("hiragana")} · ${t("voiced")}`} rows={VOICED_ROWS} script="h" empty={t("empty")} />
        <Table caption={`${t("katakana")} · ${t("voiced")}`} rows={VOICED_ROWS} script="k" empty={t("empty")} />
      </div>
      <p className="label mt-10 !normal-case !tracking-normal">{t("note")}</p>
    </div>
  );
}
