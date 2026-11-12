import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { indexEntries } from "@/content/data/navigation";
import { nowUpdated } from "@/content/data/now";
import { projects } from "@/content/data/projects";
import { getEntries } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { ArrowUpRight } from "@/components/ui/Icons";

/** The signature element: the home page is a table of contents of the whole space. */
export async function IndexList({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });

  const meta: Record<string, string | undefined> = {
    projects: t("home.entries", { count: projects.length }),
    garden: t("home.entries", { count: getEntries("garden", locale).length }),
    journal: t("home.entries", { count: getEntries("journal", locale).length }),
    now: t("now.updated", { date: formatDate(nowUpdated, locale, "short") }),
  };

  const personal = indexEntries.filter((e) => e.group === "personal").length;

  return (
    <section id="index" aria-labelledby="index-title" className="page pt-20 md:pt-28">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
        <h2 id="index-title" className="text-4xl tracking-tight md:text-6xl">{t("home.indexTitle")}</h2>
        <p className="max-w-[40ch] text-fg-2">{t("home.indexHint")}</p>
      </div>
      <ol className="border-t border-line-strong">
        {indexEntries.map((entry, i) => (
          <li key={entry.id} className="reveal border-b border-line">
            <Link
              href={entry.href}
              className="index-row grid grid-cols-[5.25rem_1fr_auto] items-baseline gap-x-3 px-2 py-5 md:grid-cols-[7.5rem_minmax(0,1.1fr)_minmax(0,1.3fr)_9rem_1.5rem] md:gap-x-6 md:px-4 md:py-7"
            >
              <span className="self-center"><span className="chapter">{t("home.chapter", { n: String(i + 1).padStart(2, "0") })}</span></span>
              <span className="idx-title font-display text-[clamp(1.9rem,5vw,4rem)] font-bold leading-none tracking-[-0.03em]">{t(`nav.${entry.labelKey}`)}</span>
              <span className="col-span-2 col-start-2 mt-2 text-sm text-fg-2 md:col-span-1 md:col-start-auto md:mt-0 md:text-base">
                {t(`nav.desc.${entry.id}`)}
              </span>
              <span className="label hidden text-right md:block">{meta[entry.id] ?? ""}</span>
              <ArrowUpRight width={20} height={20} className="arrow col-start-3 row-start-1 self-center justify-self-end text-fg-3 md:col-start-auto md:row-start-auto" />
            </Link>
          </li>
        ))}
      </ol>
      <p className="label mt-3">
        {personal} / {indexEntries.length} · {t("nav.about")}, {t("nav.now")}, {t("nav.garden")}…
      </p>
    </section>
  );
}
