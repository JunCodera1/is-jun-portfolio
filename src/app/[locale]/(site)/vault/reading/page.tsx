import { getTranslations } from "next-intl/server";
import { reading } from "@/content/data/vault";
import { linkGroups } from "@/content/data/links";
import { ArrowUpRight } from "@/components/ui/Icons";
import { formatDate } from "@/lib/format";
import { initLocale, type LocaleParams } from "@/lib/page";
import { vaultMetadata } from "@/lib/vault-meta";
import { PageHeader } from "@/components/ui/PageHeader";
import { Placeholder } from "@/components/ui/Placeholder";
import { LText } from "@/components/ui/LText";
import { VaultTabs } from "@/components/vault/VaultTabs";

export const generateMetadata = ({ params }: { params: LocaleParams }) => vaultMetadata(params, "reading", "/vault/reading");

export default async function ReadingPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "vault" });
  const tl = await getTranslations({ locale, namespace: "links" });
  const groups = (["reading", "queued", "done"] as const).map((s) => ({ s, items: reading.filter((r) => r.status === s) }));
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="VAULT" title={t("modules.reading.name")} lead={t("modules.reading.lead")} />
      <VaultTabs locale={locale} current="reading" />
      {reading.length === 0 ? (
        <div className="mt-10 max-w-3xl"><Placeholder locale={locale} title={t("readingEmptyTitle")}>{t("readingEmpty")}</Placeholder></div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          {groups.map(({ s, items }) => (
            <section key={s} aria-labelledby={`rd-${s}`}>
              <h2 id={`rd-${s}`} className="plate !text-base">{t(`readingStatus.${s}`)} <span className="opacity-70">{items.length}</span></h2>
              <ul className="mt-3 space-y-3">
                {items.map((r) => {
                  const pct = r.progress ? Math.min(100, Math.round((r.progress.current / Math.max(1, r.progress.total)) * 100)) : s === "done" ? 100 : 0;
                  return (
                    <li key={r.id} className="card-ink p-4">
                      <p className="label">{t(`readingKind.${r.kind}`)}{r.author ? ` · ${r.author}` : ""}</p>
                      <h3 className="mt-1 font-display text-xl leading-snug">{r.url ? <a className="link" href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a> : r.title}</h3>
                      <div className="mt-3 h-2 border border-outline bg-surface-2" role="progressbar" aria-label={r.title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><div className="h-full bg-accent" style={{ width: `${pct}%` }} /></div>
                      <p className="label mt-1 !normal-case !tracking-normal">{r.progress ? `${r.progress.current}/${r.progress.total} ${t(`unit.${r.progress.unit}`)}` : `${pct}%`}{r.finished ? ` · ${formatDate(r.finished, locale, "short")}` : ""}</p>
                      {r.note && <p className="mt-2 text-sm text-fg-2"><LText value={r.note} locale={locale} /></p>}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
      <section aria-labelledby="refs-title" className="mt-16">
        <h2 id="refs-title" className="text-3xl md:text-5xl">{t("referencesTitle")}</h2>
        <p className="label mt-1 !normal-case !tracking-normal">{tl("note")}</p>
        <div className="mt-8 grid gap-x-10 gap-y-10 md:grid-cols-2">
          {linkGroups.map((g) => (
            <div key={g.id}>
              <h3 className="label mb-2 !text-fg-2">{tl(`groups.${g.id}`)}</h3>
              <ul className="border-t-2 border-outline">
                {g.items.map((l) => (
                  <li key={l.id} className="border-b border-line">
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="index-row grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 px-2 py-3">
                      <span><span className="block font-display text-lg leading-snug [overflow-wrap:anywhere]">{l.title}</span>{l.note && <span className="label mt-1 block !normal-case !tracking-normal"><LText value={l.note} locale={locale} /></span>}</span>
                      <ArrowUpRight width={16} height={16} className="arrow text-fg-3" /><span className="sr-only">({tl("opensNewTab")})</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
