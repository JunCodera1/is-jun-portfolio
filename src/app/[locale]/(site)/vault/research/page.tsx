import { getTranslations } from "next-intl/server";
import { research, TOPICS } from "@/content/data/vault";
import { formatDate } from "@/lib/format";
import { initLocale, type LocaleParams } from "@/lib/page";
import { vaultMetadata } from "@/lib/vault-meta";
import { PageHeader } from "@/components/ui/PageHeader";
import { LText } from "@/components/ui/LText";
import { Stagger } from "@/components/motion/Stagger";
import { TopicFilter } from "@/components/vault/TopicFilter";
import { VaultTabs } from "@/components/vault/VaultTabs";
import { ArrowUpRight } from "@/components/ui/Icons";

export const generateMetadata = ({ params }: { params: LocaleParams }) => vaultMetadata(params, "research", "/vault/research");

export default async function ResearchPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "vault" });
  const rows = [...research].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="VAULT" title={t("modules.research.name")} lead={t("modules.research.lead")} />
      <VaultTabs locale={locale} current="research" />
      <p className="label mt-4 !normal-case !tracking-normal">{t("researchNote")}</p>
      <div className="mt-6">
        <TopicFilter topics={TOPICS.map((x) => ({ id: x, label: t(`topics.${x}`) }))} allLabel={t("allTopics")} label={t("filterTopic")}>
          <Stagger as="div" className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6">
            {rows.map((r) => (
              <article key={r.id} id={r.id} data-topic={r.topic} data-stagger className="card-ink scroll-mt-24 p-5 md:p-7">
                <p className="label">{t("checked", { date: formatDate(r.date, locale) })} · {t(`topics.${r.topic}`)}</p>
                <h2 className="stage-title mt-1 text-3xl [overflow-wrap:anywhere]"><LText value={r.title} locale={locale} /></h2>
                <p className="mt-3 text-fg-2"><span className="label mr-2">{t("fields.question")}</span><LText value={r.question} locale={locale} /></p>
                <h3 className="label mb-2 mt-5">{t("fields.findings")}</h3>
                <ul className="list-disc space-y-1.5 pl-5 text-fg-2">{r.findings.map((f, i) => (<li key={i}><LText value={f} locale={locale} /></li>))}</ul>
                <p className="mt-5 border-l-4 border-accent pl-3 font-display text-xl leading-snug"><LText value={r.conclusion} locale={locale} /></p>
                <h3 className="label mb-2 mt-5">{t("fields.sources")}</h3>
                <ul className="flex flex-wrap gap-2">{r.sources.map((s) => (<li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="chip !normal-case">{s.label}<ArrowUpRight width={12} height={12} /><span className="sr-only"> ({t("newTab")})</span></a></li>))}</ul>
              </article>
            ))}
          </Stagger>
        </TopicFilter>
      </div>
    </div>
  );
}
