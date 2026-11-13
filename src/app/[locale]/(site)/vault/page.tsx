import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MODULES, moduleCounts } from "@/content/data/vault";
import { getKnowledge } from "@/lib/knowledge/build";
import { formatDate } from "@/lib/format";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stagger } from "@/components/motion/Stagger";
import { VaultTabs } from "@/components/vault/VaultTabs";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "vault", "/vault");

export default async function VaultPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "vault" });
  const k = await getKnowledge(locale);
  const latest = k.items
    .filter((i) => i.date && ["decision", "mistake", "research", "idea"].includes(i.kind))
    .sort((a, b) => (a.date! < b.date! ? 1 : a.date! > b.date! ? -1 : a.id.localeCompare(b.id)))
    .slice(0, 8)
    .map((i) => ({ key: i.id, date: i.date!, kind: ({ decision: "decisions", mistake: "mistakes", research: "research", idea: "ideas" } as Record<string, string>)[i.kind]!, title: i.title, href: i.href }));
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="VAULT" title={t("title")} lead={t("lead")} />
      <VaultTabs locale={locale} />
      <p className="label mt-4 !normal-case !tracking-normal">{t("note")}</p>
      <Stagger as="ul" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <li key={m.id} data-stagger className="min-w-0">
            <Link href={m.href} className="card-ink group relative block h-full overflow-hidden p-5">
              <span aria-hidden lang="ja" className="pointer-events-none absolute -right-2 -top-4 select-none font-display text-[6rem] leading-none text-accent/15 transition-transform duration-300 group-hover:scale-110">{m.glyph}</span>
              <span className="relative block font-display text-2xl leading-tight tracking-tight">{t(`modules.${m.id}.name`)}</span>
              <span className="relative mt-2 block text-sm text-fg-2">{t(`modules.${m.id}.desc`)}</span>
              <span className="label relative mt-3 block">{moduleCounts[m.id] === 0 ? t("empty") : t("count", { n: moduleCounts[m.id] })}</span>
            </Link>
          </li>
        ))}
      </Stagger>
      <section aria-labelledby="latest-title" className="mt-14">
        <h2 id="latest-title" className="text-3xl">{t("latest")}</h2>
        <ol className="mt-4 border-t-2 border-outline">
          {latest.map((e) => (
            <li key={e.key} className="border-b border-line">
              <Link href={e.href} className="index-row grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-4 px-2 py-3 sm:grid-cols-[6.5rem_8rem_minmax(0,1fr)]">
                <time dateTime={e.date} className="label">{formatDate(e.date, locale, "short")}</time>
                <span className="label hidden sm:block">{t(`modules.${e.kind}.name`)}</span>
                <span className="font-display text-lg leading-snug [overflow-wrap:anywhere]">{e.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
