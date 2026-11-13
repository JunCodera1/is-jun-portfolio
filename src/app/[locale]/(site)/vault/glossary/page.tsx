import { getTranslations } from "next-intl/server";
import { glossary } from "@/content/data/vault";
import { resolveText } from "@/lib/localized";
import { initLocale, type LocaleParams } from "@/lib/page";
import { vaultMetadata } from "@/lib/vault-meta";
import { PageHeader } from "@/components/ui/PageHeader";
import { Glossary, type GTerm } from "@/components/vault/Glossary";
import { VaultTabs } from "@/components/vault/VaultTabs";

export const generateMetadata = ({ params }: { params: LocaleParams }) => vaultMetadata(params, "glossary", "/vault/glossary");

export default async function GlossaryPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "vault" });
  const terms: GTerm[] = [...glossary]
    .sort((a, b) => a.term.en.localeCompare(b.term.en))
    .map((g) => { const d = resolveText(g.def, locale); return { id: g.id, topic: g.topic, topicLabel: t(`topics.${g.topic}`), ...g.term, def: d.text, defLang: d.lang !== locale ? d.lang : undefined }; });
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="VAULT" title={t("modules.glossary.name")} lead={t("modules.glossary.lead")} />
      <VaultTabs locale={locale} current="glossary" />
      <div className="mt-8"><Glossary terms={terms} label={t("glossarySearch")} placeholder={t("glossaryPlaceholder")} count={t("glossaryCount", { n: "{n}" })} none={t("glossaryNone")} /></div>
    </div>
  );
}
