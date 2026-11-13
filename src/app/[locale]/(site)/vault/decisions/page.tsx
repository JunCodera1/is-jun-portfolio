import { getTranslations } from "next-intl/server";
import { decisions, TOPICS } from "@/content/data/vault";
import { formatDate } from "@/lib/format";
import { initLocale, type LocaleParams } from "@/lib/page";
import { vaultMetadata } from "@/lib/vault-meta";
import { PageHeader } from "@/components/ui/PageHeader";
import { LText } from "@/components/ui/LText";
import { Stagger } from "@/components/motion/Stagger";
import { TopicFilter } from "@/components/vault/TopicFilter";
import { VaultTabs } from "@/components/vault/VaultTabs";

export const generateMetadata = ({ params }: { params: LocaleParams }) => vaultMetadata(params, "decisions", "/vault/decisions");

export default async function DecisionsPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "vault" });
  const rows = [...decisions].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="VAULT" title={t("modules.decisions.name")} lead={t("modules.decisions.lead")} />
      <VaultTabs locale={locale} current="decisions" />
      <div className="mt-6">
        <TopicFilter topics={TOPICS.map((x) => ({ id: x, label: t(`topics.${x}`) }))} allLabel={t("allTopics")} label={t("filterTopic")}>
          <Stagger as="div" className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6">
            {rows.map((d) => (
              <article key={d.id} id={d.id} data-topic={d.topic} data-stagger className="card-ink scroll-mt-24 p-5 md:p-7">
                <p className="label">{formatDate(d.date, locale)} · {t(`topics.${d.topic}`)} · <span className={d.status === "superseded" ? "text-fg-3" : "text-accent-fg"}>{t(`status.${d.status}`)}</span></p>
                <h2 className="stage-title mt-1 text-3xl [overflow-wrap:anywhere]"><LText value={d.title} locale={locale} /></h2>
                <dl className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
                  {(["context", "decision", "why", "cost"] as const).map((k) => (
                    <div key={k}><dt className="label">{t(`fields.${k}`)}</dt><dd className="mt-1 text-fg-2"><LText value={d[k]} locale={locale} /></dd></div>
                  ))}
                </dl>
                {d.supersededBy && <p className="label mt-4 !normal-case !tracking-normal">{t("supersededBy")} <a className="link" href={`#${d.supersededBy}`}>{decisions.find((x) => x.id === d.supersededBy)?.title.en}</a></p>}
              </article>
            ))}
          </Stagger>
        </TopicFilter>
      </div>
    </div>
  );
}
