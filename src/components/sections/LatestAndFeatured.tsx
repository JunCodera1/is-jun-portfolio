import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { featuredProjects } from "@/content/data/projects";
import { getEntries } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { LText } from "@/components/ui/LText";
import { ArrowRight } from "@/components/ui/Icons";

export async function LatestAndFeatured({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  const latest = [...getEntries("garden", locale), ...getEntries("journal", locale)]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 4);
  const featured = featuredProjects.slice(0, 3);

  return (
    <div className="page mt-28 grid gap-16 md:mt-40 md:grid-cols-12 md:gap-8">
      <section aria-labelledby="latest-title" className="md:col-span-4">
        <h2 id="latest-title" className="label mb-6 !text-fg-2">{t("home.latestTitle")}</h2>
        {latest.length === 0 ? (
          <p className="slot">{t("home.latestEmpty")}</p>
        ) : (
          <ul className="border-t border-line">
            {latest.map((e) => (
              <li key={`${e.collection}-${e.id}`} className="reveal border-b border-line">
                <Link href={`/${e.collection}/${e.id}`} className="group block py-4">
                  <span className="label">{t(`nav.${e.collection}`)} · {formatDate(e.date, locale, "short")}</span>
                  <span lang={e.lang !== locale ? e.lang : undefined} className="mt-1 block font-display text-xl leading-snug tracking-tight transition-colors group-hover:text-accent-fg">
                    {e.title}
                  </span>
                  {e.status !== "translated" && <span className="label mt-1 inline-block border border-line px-1.5 py-px text-[0.62rem]">{t(`translation.${e.status}`)}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="featured-title" className="md:col-span-8">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="featured-title" className="label !text-fg-2">{t("home.featuredTitle")}</h2>
          <Link href="/projects" className="link inline-flex items-center gap-1.5 text-sm">{t("home.allProjects")}<ArrowRight width={14} height={14} /></Link>
        </div>
        <p className="mb-6 max-w-[56ch] text-fg-2">{t("home.featuredHint")}</p>
        <ul className="border-t border-line-strong">
          {featured.map((p, i) => (
            <li key={p.slug} className="reveal border-b border-line">
              <Link href={`/projects/${p.slug}`} className="index-row grid gap-x-6 gap-y-2 px-2 py-6 md:grid-cols-[3rem_1fr_auto] md:px-4">
                <span className="label pt-2">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block font-display text-3xl tracking-tight md:text-4xl">{p.name}</span>
                  <span className="mt-2 block max-w-[60ch] text-fg-2"><LText value={p.summary} locale={locale} /></span>
                  <span className="mt-3 flex flex-wrap gap-1.5">
                    {[...new Set(p.stack.map((s) => s.name))].slice(0, 5).map((name) => <span key={name} className="chip">{name}</span>)}
                  </span>
                </span>
                <span className="label hidden self-start pt-2 md:block">{p.kinds.map((k) => t(`projects.kinds.${k}`)).join(" · ")}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
