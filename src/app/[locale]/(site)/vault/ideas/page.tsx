import { getTranslations } from "next-intl/server";
import { ideas, STAGES } from "@/content/data/vault";
import { formatDate } from "@/lib/format";
import { initLocale, type LocaleParams } from "@/lib/page";
import { vaultMetadata } from "@/lib/vault-meta";
import { PageHeader } from "@/components/ui/PageHeader";
import { LText } from "@/components/ui/LText";
import { VaultTabs } from "@/components/vault/VaultTabs";

export const generateMetadata = ({ params }: { params: LocaleParams }) => vaultMetadata(params, "ideas", "/vault/ideas");

export default async function IdeasPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "vault" });
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="VAULT" title={t("modules.ideas.name")} lead={t("modules.ideas.lead")} />
      <VaultTabs locale={locale} current="ideas" />
      <p className="label mt-4 !normal-case !tracking-normal">{t("ideasNote")}</p>
      <div className="mt-8 overflow-x-auto pb-4">
        <div className="grid min-w-[62rem] grid-cols-5 gap-4">
          {STAGES.map((st) => {
            const col = ideas.filter((i) => i.stage === st);
            return (
              <section key={st} aria-labelledby={`stage-${st}`} className="min-w-0">
                <h2 id={`stage-${st}`} className="plate !text-base">{t(`stages.${st}`)} <span className="opacity-70">{col.length}</span></h2>
                <ul className="mt-3 space-y-3">
                  {col.length === 0 && <li className="slot !p-3 text-sm">{t("noIdeas")}</li>}
                  {col.map((i) => (
                    <li key={i.id} id={i.id} className="card-ink scroll-mt-24 p-4">
                      <p className="label">{formatDate(i.since, locale, "short")} · {t(`topics.${i.topic}`)}</p>
                      <h3 className="mt-1 font-display text-xl leading-snug"><LText value={i.title} locale={locale} /></h3>
                      <p className="mt-2 text-sm text-fg-2"><LText value={i.pitch} locale={locale} /></p>
                      <p className="mt-3 border-t border-line pt-2 text-sm"><span className="label mr-1">{t("fields.next")}</span><LText value={i.next} locale={locale} /></p>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
