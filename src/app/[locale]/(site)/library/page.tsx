import { getTranslations } from "next-intl/server";
import { music, shelf } from "@/content/data/library";
import { lookupAnime, musicChart, techBooks, trendingAnime, trendingBooks } from "@/lib/library-feed";
import type { LibEntry } from "@/lib/library";
import { safeHttpUrl } from "@/lib/news";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArrowUpRight } from "@/components/ui/Icons";

export const revalidate = 21600;
export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "library", "/library");

function List({ id, title, desc, items, empty, newTab }: { id: string; title: string; desc: string; items: LibEntry[]; empty: string; newTab: string }) {
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className="text-3xl">{title}</h3>
      <p className="label mt-1 !normal-case !tracking-normal">{desc}</p>
      {items.length === 0 ? (
        <p className="slot mt-6">{empty}</p>
      ) : (
        <ul className="mt-6 border-t-2 border-outline">
          {items.map((e) => (
            <li key={e.id} className="border-b border-line">
              <a href={e.url} target="_blank" rel="noopener noreferrer nofollow" className="index-row grid grid-cols-[1fr_auto] items-baseline gap-x-3 px-2 py-3">
                <span>
                  <span className="block font-display text-lg leading-snug tracking-tight">{e.title}</span>
                  {(e.sub || e.meta) && <span className="label mt-1 block !normal-case !tracking-normal">{[e.sub, e.meta].filter(Boolean).join(" · ")}</span>}
                </span>
                <ArrowUpRight width={16} height={16} className="arrow text-fg-3" />
                <span className="sr-only">({newTab})</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function LibraryPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "library" });
  const [mine, anime, books, tech, chart] = await Promise.all([
    Promise.all(shelf.map(async (s) => (await lookupAnime(s.lookup))[0])),
    trendingAnime(10), trendingBooks(10), techBooks(10), musicChart(10),
  ]);
  const myMusic: LibEntry[] = music.flatMap((m) => {
    const url = safeHttpUrl(m.url);
    return url ? [{ id: m.id, title: m.title, sub: m.artist, meta: new URL(url).hostname.replace(/^www\./, ""), url }] : [];
  });
  const common = { empty: t("empty"), newTab: t("opensNewTab") };
  return (
    <div className="page pb-8">
      <PageHeader navId="library" title={t("title")} lead={t("lead")} />
      <p className="label mt-6 !normal-case !tracking-normal">{t("note")}</p>

      <h2 className="mt-12 text-4xl">{t("mine")}</h2>
      <div className="mt-6 grid gap-14 lg:grid-cols-2">
        <List id="mine-shelf" title={t("shelf.title")} desc={t("shelf.desc")} items={mine.filter((e): e is LibEntry => !!e)} {...common} />
        <List id="mine-music" title={t("myMusic.title")} desc={t("myMusic.desc")} items={myMusic} empty={t("myMusic.empty")} newTab={t("opensNewTab")} />
      </div>

      <h2 className="mt-16 text-4xl">{t("discover")}</h2>
      <div className="mt-6 grid gap-14 lg:grid-cols-2">
        <List id="d-anime" title={t("anime.title")} desc={t("anime.desc")} items={anime} {...common} />
        <List id="d-music" title={t("chart.title")} desc={t("chart.desc")} items={chart} {...common} />
        <List id="d-books" title={t("books.title")} desc={t("books.desc")} items={books} {...common} />
        <List id="d-tech" title={t("tech.title")} desc={t("tech.desc")} items={tech} {...common} />
      </div>
    </div>
  );
}
