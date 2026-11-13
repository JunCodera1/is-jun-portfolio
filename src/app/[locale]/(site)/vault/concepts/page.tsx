import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { concepts, TOPICS } from "@/content/data/vault";
import { initLocale, type LocaleParams } from "@/lib/page";
import { vaultMetadata } from "@/lib/vault-meta";
import { PageHeader } from "@/components/ui/PageHeader";
import { LText } from "@/components/ui/LText";
import { Stagger } from "@/components/motion/Stagger";
import { TopicFilter } from "@/components/vault/TopicFilter";
import { VaultTabs } from "@/components/vault/VaultTabs";

export const generateMetadata = ({ params }: { params: LocaleParams }) => vaultMetadata(params, "concepts", "/vault/concepts");

export default async function ConceptsPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "vault" });
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="VAULT" title={t("modules.concepts.name")} lead={t("modules.concepts.lead")} />
      <VaultTabs locale={locale} current="concepts" />
      <div className="mt-6">
        <TopicFilter topics={TOPICS.map((x) => ({ id: x, label: t(`topics.${x}`) }))} allLabel={t("allTopics")} label={t("filterTopic")}>
          <Stagger as="ul" className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2">
            {concepts.map((c) => (
              <li key={c.id} data-topic={c.topic} data-stagger className="min-w-0">
                <Link href={`/vault/concepts/${c.id}`} className="card-ink block h-full p-6">
                  <span className="label">{t(`topics.${c.topic}`)}</span>
                  <span className="stage-title mt-1 block text-3xl [overflow-wrap:anywhere]"><LText value={c.title} locale={locale} /></span>
                  <span className="mt-3 block text-fg-2"><LText value={c.summary} locale={locale} /></span>
                  <span className="label mt-4 block">{t("readConcept")}</span>
                </Link>
              </li>
            ))}
          </Stagger>
        </TopicFilter>
      </div>
    </div>
  );
}
