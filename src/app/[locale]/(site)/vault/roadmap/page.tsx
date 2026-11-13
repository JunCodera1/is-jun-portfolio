import { getTranslations } from "next-intl/server";
import { roadmap } from "@/content/data/vault";
import { formatDate } from "@/lib/format";
import { initLocale, type LocaleParams } from "@/lib/page";
import { vaultMetadata } from "@/lib/vault-meta";
import { PageHeader } from "@/components/ui/PageHeader";
import { LText } from "@/components/ui/LText";
import { Stagger } from "@/components/motion/Stagger";
import { VaultTabs } from "@/components/vault/VaultTabs";

export const generateMetadata = ({ params }: { params: LocaleParams }) => vaultMetadata(params, "roadmap", "/vault/roadmap");

export default async function RoadmapPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "vault" });
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="VAULT" title={t("modules.roadmap.name")} lead={t("modules.roadmap.lead")} />
      <VaultTabs locale={locale} current="roadmap" />
      <div className="mt-10 grid gap-12">
        {roadmap.map((tr) => (
          <section key={tr.id} aria-labelledby={`tr-${tr.id}`}>
            <h2 id={`tr-${tr.id}`} className="text-4xl"><LText value={tr.title} locale={locale} /></h2>
            <Stagger as="ol" className="relative mt-6 flex flex-col gap-6 md:flex-row md:gap-0">
              <li aria-hidden className="absolute left-[1.05rem] top-4 bottom-4 w-1 bg-line-strong md:inset-x-6 md:bottom-auto md:top-[1.05rem] md:h-1 md:w-auto" />
              {tr.steps.map((s) => (
                <li key={s.id} data-stagger className="relative flex gap-4 md:flex-1 md:flex-col md:gap-3">
                  <span aria-hidden className={`z-10 grid h-9 w-9 shrink-0 place-items-center border-[3px] border-outline font-mono text-sm font-bold ${s.status === "done" ? "bg-accent text-accent-ink" : s.status === "doing" ? "bg-[#ffd23f] text-[#1a1c24]" : "bg-surface text-fg-2"}`}>{s.status === "done" ? "✓" : s.status === "doing" ? "▶" : "·"}</span>
                  <div className="min-w-0 pr-4">
                    <p className="label">{t(`status.${s.status}`)}{s.date ? ` · ${formatDate(s.date, locale, "short")}` : ""}</p>
                    <p className="font-display text-2xl leading-tight"><LText value={s.title} locale={locale} /></p>
                    {s.note && <p className="mt-1 text-sm text-fg-2"><LText value={s.note} locale={locale} /></p>}
                  </div>
                </li>
              ))}
            </Stagger>
          </section>
        ))}
      </div>
      <p className="label mt-10 !normal-case !tracking-normal">{t("roadmapAdd")}</p>
    </div>
  );
}
