import { getTranslations } from "next-intl/server";
import { mistakes, TOPICS } from "@/content/data/vault";
import { formatDate } from "@/lib/format";
import { initLocale, type LocaleParams } from "@/lib/page";
import { vaultMetadata } from "@/lib/vault-meta";
import { PageHeader } from "@/components/ui/PageHeader";
import { LText } from "@/components/ui/LText";
import { Stagger } from "@/components/motion/Stagger";
import { TopicFilter } from "@/components/vault/TopicFilter";
import { VaultTabs } from "@/components/vault/VaultTabs";

export const generateMetadata = ({ params }: { params: LocaleParams }) => vaultMetadata(params, "mistakes", "/vault/mistakes");

export default async function MistakesPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "vault" });
  const rows = [...mistakes].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="VAULT" title={t("modules.mistakes.name")} lead={t("modules.mistakes.lead")} />
      <VaultTabs locale={locale} current="mistakes" />
      <p className="label mt-4 !normal-case !tracking-normal">{t("mistakesNote")}</p>
      <div className="mt-6">
        <TopicFilter topics={TOPICS.map((x) => ({ id: x, label: t(`topics.${x}`) }))} allLabel={t("allTopics")} label={t("filterTopic")}>
          <Stagger as="div" className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6">
            {rows.map((m) => (
              <article key={m.id} id={m.id} data-topic={m.topic} data-stagger className="card-ink scroll-mt-24 p-5 md:p-7">
                <p className="label">{formatDate(m.date, locale)} · {t(`topics.${m.topic}`)}</p>
                <h2 className="stage-title mt-1 text-3xl [overflow-wrap:anywhere]"><LText value={m.title} locale={locale} /></h2>
                <dl className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
                  {(["happened", "cause", "fix"] as const).map((k) => (<div key={k}><dt className="label">{t(`fields.${k}`)}</dt><dd className="mt-1 text-fg-2"><LText value={m[k]} locale={locale} /></dd></div>))}
                  <div className="border-l-4 border-accent pl-3"><dt className="label">{t("fields.lesson")}</dt><dd className="mt-1 font-display text-xl leading-snug"><LText value={m.lesson} locale={locale} /></dd></div>
                </dl>
              </article>
            ))}
          </Stagger>
        </TopicFilter>
      </div>
    </div>
  );
}
