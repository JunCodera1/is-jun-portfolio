import { getFormatter, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getKnowledge } from "@/lib/knowledge/build";
import type { Item, Kind } from "@/lib/knowledge/types";
import { formatDate } from "@/lib/format";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { Placeholder } from "@/components/ui/Placeholder";
import { KindFilter } from "@/components/vault/KindFilter";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "timeline", "/timeline");

type Group = "writing" | "vault" | "site" | "milestones";
const GROUP: Partial<Record<Kind, Group>> = { note: "writing", post: "writing", decision: "vault", mistake: "vault", research: "vault", idea: "vault", log: "site", event: "milestones" };

/** One timeline for everything that has a real date, drawn from the unified data layer. Items without a date are not on it. */
export default async function TimelinePage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "timeline" });
  const f = await getFormatter({ locale });
  const k = await getKnowledge(locale);
  const rows = k.items
    .filter((i): i is Item & { date: string } => !!i.date && !!GROUP[i.kind])
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id.localeCompare(b.id)));
  const months = [...new Set(rows.map((r) => r.date.slice(0, 7)))];
  const anchor = (i: Item) => (i.kind === "log" ? `log-${i.id.replace("log:", "")}` : i.id.replace(/[^a-z0-9]+/gi, "-"));
  const external = (h: string) => h.startsWith("https://");

  return (
    <div className="page pb-8">
      <PageHeader navId="timeline" title={t("title")} lead={t("lead")} />
      <div className="max-w-3xl py-8">
        <Placeholder locale={locale} title={t("ownerSlotTitle")}>{t("ownerSlot")}</Placeholder>
      </div>
      <KindFilter allLabel={t("all")} label={t("filter")} groups={(["writing", "vault", "site", "milestones"] as Group[]).map((g) => ({ id: g, label: t(`groups.${g}`) }))}>
        <ol className="mt-6 max-w-4xl">
          {months.map((m) => (
            <li key={m} className="mb-8" data-group-block>
              <h2 className="label border-b-2 border-outline pb-1 !text-fg-2">{f.dateTime(new Date(`${m}-01T12:00:00`), { year: "numeric", month: "long" })}</h2>
              <ul>
                {rows.filter((r) => r.date.startsWith(m)).map((r) => (
                  <li key={r.id} id={anchor(r)} data-group={GROUP[r.kind]} className="grid scroll-mt-24 gap-x-5 border-b border-line py-3 sm:grid-cols-[6.5rem_9rem_minmax(0,1fr)]">
                    <time dateTime={r.date} className="label">{formatDate(r.date, locale, "short")}</time>
                    <span className="label">{t(`kinds.${r.kind}`)}</span>
                    <span className="min-w-0">
                      {external(r.href)
                        ? <a href={r.href} target="_blank" rel="noopener noreferrer" lang={r.lang !== locale ? r.lang : undefined} className="link font-display text-xl leading-snug [overflow-wrap:anywhere]">{r.title}<span className="sr-only"> ({t("newTab")})</span></a>
                        : r.kind === "log" ? <span lang={r.lang !== locale ? r.lang : undefined} className="font-display text-xl leading-snug">{r.title}</span>
                        : <Link href={r.href} lang={r.lang !== locale ? r.lang : undefined} className="link font-display text-xl leading-snug [overflow-wrap:anywhere]">{r.title}</Link>}
                      <span className="label mt-0.5 block !normal-case !tracking-normal">{t(`source.${r.source}`)}{r.provenance.evidence && r.source === "github" ? ` · ${r.provenance.evidence}` : ""}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </KindFilter>
      <p className="label border-t border-line py-4 !normal-case !tracking-normal">{t("derivedNote2")}</p>
    </div>
  );
}
