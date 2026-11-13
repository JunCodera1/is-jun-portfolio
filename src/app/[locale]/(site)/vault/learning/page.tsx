import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { learning } from "@/content/data/vault";
import { formatDate } from "@/lib/format";
import { initLocale, type LocaleParams } from "@/lib/page";
import { vaultMetadata } from "@/lib/vault-meta";
import { PageHeader } from "@/components/ui/PageHeader";
import { LText } from "@/components/ui/LText";
import { Placeholder } from "@/components/ui/Placeholder";
import { LearningStats } from "@/components/vault/LearningStats";
import { VaultTabs } from "@/components/vault/VaultTabs";

export const generateMetadata = ({ params }: { params: LocaleParams }) => vaultMetadata(params, "learning", "/vault/learning");

export default async function LearningPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "vault" });
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="VAULT" title={t("modules.learning.name")} lead={t("modules.learning.lead")} />
      <VaultTabs locale={locale} current="learning" />
      <div className="mt-8 grid gap-8">
        {learning.map((l) => (
          <article key={l.id} id={l.id} className="card-ink scroll-mt-24 p-5 md:p-7">
            <p className="label">{t(`status.${l.status}`)}{l.started ? ` · ${t("startedOn", { date: formatDate(l.started, locale) })}` : ""}</p>
            <h2 className="stage-title mt-1 text-4xl"><LText value={l.title} locale={locale} /></h2>
            <p className="mt-2 text-fg-2"><span className="label mr-2">{t("fields.goal")}</span><LText value={l.goal} locale={locale} /></p>
            {l.id === "japanese" && <LearningStats />}
            <h3 className="label mb-2 mt-6">{t("fields.log")}</h3>
            {l.log.length === 0 ? <Placeholder locale={locale} compact>{t("logEmpty")}</Placeholder> : (
              <ol className="divide-y divide-line border-y border-line">{l.log.map((e) => (<li key={e.date + e.note.en} className="py-3"><time className="label" dateTime={e.date}>{formatDate(e.date, locale)}{e.minutes ? ` · ${e.minutes} min` : ""}</time><p><LText value={e.note} locale={locale} /></p></li>))}</ol>
            )}
            <ul className="mt-5 flex flex-wrap gap-2">{l.links.map((k) => (<li key={k.href}><Link href={k.href} className="chip"><LText value={k.label} locale={locale} /></Link></li>))}</ul>
          </article>
        ))}
      </div>
      <p className="label mt-8 !normal-case !tracking-normal">{t("learningAdd")}</p>
    </div>
  );
}
