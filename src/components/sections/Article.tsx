import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getEntry, type ContentEntry } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { tagLabel } from "@/lib/tags";
import { siteUrl, SITE_NAME } from "@/lib/site";
import { profile } from "@/content/data/profile";
import { MdxContent } from "@/components/mdx/MdxContent";
import { TranslationBanner } from "@/components/ui/TranslationBanner";
import { JsonLd } from "@/components/ui/JsonLd";
import { ArrowRight } from "@/components/ui/Icons";

/** Shared long-form layout for Journal posts and Digital Garden notes. */
export async function Article({ entry, locale }: { entry: ContentEntry; locale: Locale }) {
  const t = await getTranslations({ locale });
  const kind = entry.collection;
  const listHref = `/${kind}`;
  const related = entry.related.map((id) => getEntry(kind, id, locale)).filter((e): e is ContentEntry => !!e);
  const showToc = entry.toc.length >= 3;

  const toc = showToc && (
    <nav aria-label={t("journal.toc")}>
      <p className="label mb-3">{t("journal.toc")}</p>
      <ol className="space-y-2 border-l border-line text-sm">
        {entry.toc.map((h) => (
          <li key={h.id} className={h.depth === 3 ? "pl-7" : "pl-4"}>
            <a href={`#${h.id}`} className="text-fg-2 transition-colors hover:text-accent-fg">{h.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );

  return (
    <article className="page pb-8">
      {kind === "journal" && (
        <JsonLd
          data={{
            "@context": "https://schema.org", "@type": "BlogPosting",
            headline: entry.title, description: entry.summary, inLanguage: entry.lang,
            datePublished: entry.date, dateModified: entry.updated ?? entry.date,
            author: { "@type": "Person", name: profile.displayName },
            publisher: { "@type": "Organization", name: SITE_NAME },
            mainEntityOfPage: `${siteUrl()}/${locale}/journal/${entry.id}`,
          }}
        />
      )}
      <header className="border-b border-line pb-10 pt-14 md:pb-14 md:pt-20">
        <Link href={listHref} className="link label mb-8 inline-block">← {t(`nav.${kind}`)}</Link>
        <h1 lang={entry.lang !== locale ? entry.lang : undefined} className="max-w-[18ch] text-[clamp(2.5rem,7vw,6rem)] font-medium leading-[0.98] tracking-[-0.035em]">
          {entry.title}
        </h1>
        <p lang={entry.lang !== locale ? entry.lang : undefined} className="mt-6 max-w-[52ch] text-lg text-fg-2 md:text-xl">{entry.summary}</p>
        <dl className="label mt-8 flex flex-wrap gap-x-8 gap-y-2">
          <div className="flex gap-2"><dt>{t("common.published")}</dt><dd className="text-fg-2"><time dateTime={entry.date}>{formatDate(entry.date, locale)}</time></dd></div>
          {entry.updated && entry.updated !== entry.date && (
            <div className="flex gap-2"><dt>{t("common.updated")}</dt><dd className="text-fg-2"><time dateTime={entry.updated}>{formatDate(entry.updated, locale)}</time></dd></div>
          )}
          <div className="flex gap-2"><dd className="text-fg-2">{t("common.minRead", { minutes: entry.readingMinutes })}</dd></div>
          {entry.maturity && (
            <div className="flex gap-2"><dt>{t("garden.maturityHint")}</dt><dd className="text-accent-fg">{t(`garden.maturity.${entry.maturity}`)}</dd></div>
          )}
        </dl>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <TranslationBanner status={entry.status} locale={locale} englishHref={`/${kind}/${entry.id}`} />
          {showToc && <details className="mb-10 border border-line p-4 lg:hidden"><summary className="label cursor-pointer">{t("journal.toc")}</summary><div className="mt-4">{toc}</div></details>}
          <MdxContent source={entry.body} lang={entry.lang} />

          {entry.tags.length > 0 && (
            <ul className="mt-14 flex flex-wrap gap-2 border-t border-line pt-6" aria-label={t("common.tags")}>
              {entry.tags.map((tag) => <li key={tag} className="chip">#{tagLabel(t, tag)}</li>)}
            </ul>
          )}

          {related.length > 0 && (
            <section aria-labelledby="related-title" className="mt-14">
              <h2 id="related-title" className="label mb-4 !text-fg-2">{t(`${kind}.related`)}</h2>
              <ul className="border-t border-line">
                {related.map((r) => (
                  <li key={r.id} className="border-b border-line">
                    <Link href={`/${kind}/${r.id}`} className="group flex items-center justify-between gap-4 py-4">
                      <span lang={r.lang !== locale ? r.lang : undefined} className="font-display text-xl tracking-tight transition-colors group-hover:text-accent-fg">{r.title}</span>
                      <ArrowRight width={16} height={16} className="shrink-0 text-fg-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        {showToc && <aside className="hidden lg:col-span-3 lg:col-start-10 lg:block"><div className="sticky top-24">{toc}</div></aside>}
      </div>
    </article>
  );
}
