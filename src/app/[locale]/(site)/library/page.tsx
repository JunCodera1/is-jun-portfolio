/* Plain <img>: covers come from a few allow-listed hosts (see the CSP), are tiny, fixed-size and lazy; next/image would add a proxy for no gain. */
/* eslint-disable @next/next/no-img-element */
import { getTranslations } from "next-intl/server";
import { playlists, shelf } from "@/content/data/library";
import { embedFor } from "@/lib/music";
import { Playlist, type PTrack } from "@/components/library/Playlist";
import { textOf } from "@/lib/localized";
import { lookupAnime, musicChart, techBooks, trendingAnime, trendingBooks } from "@/lib/library-feed";
import type { LibEntry } from "@/lib/library";
import { safeHttpUrl } from "@/lib/news";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stagger } from "@/components/motion/Stagger";
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
        <Stagger as="ul" className="mt-6 border-t-2 border-outline">
          {items.map((e) => (
            <li key={e.id} data-stagger className="border-b border-line">
              <a href={e.url} target="_blank" rel="noopener noreferrer nofollow" className="index-row grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-3 px-2 py-3">
                <span aria-hidden className="relative block h-16 w-12 overflow-hidden border-2 border-outline bg-surface-2">
                  {e.image && <img src={e.image} alt="" width={48} height={64} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-cover" />}
                </span>
                <span>
                  <span className="block [overflow-wrap:anywhere] font-display text-lg leading-snug tracking-tight">{e.title}</span>
                  {(e.sub || e.meta) && <span className="label mt-1 block !normal-case !tracking-normal">{[e.sub, e.meta].filter(Boolean).join(" · ")}</span>}
                </span>
                <ArrowUpRight width={16} height={16} className="arrow text-fg-3" />
                <span className="sr-only">({newTab})</span>
              </a>
            </li>
          ))}
        </Stagger>
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
  const mine_pl = playlists.map((p) => ({
    id: p.id, title: textOf(p.title, locale),
    tracks: p.tracks.flatMap((m): PTrack[] => { const url = safeHttpUrl(m.url); return url ? [{ id: m.id, title: m.title, artist: m.artist, url, embed: embedFor(url) ?? undefined }] : []; }),
  }));
  const chartTracks: PTrack[] = chart.map((e) => ({ id: e.id, title: e.title, artist: e.sub, url: e.url, image: e.image, deezerId: e.id.replace("track-", "") }));
  const common = { empty: t("empty"), newTab: t("opensNewTab") };
  return (
    <div className="page pb-8">
      <PageHeader navId="library" title={t("title")} lead={t("lead")} />
      <p className="label mt-6 !normal-case !tracking-normal">{t("note")}</p>

      <h2 className="mt-12 text-4xl">{t("mine")}</h2>
      <div className="mt-6 grid gap-14 lg:grid-cols-2">
        <List id="mine-shelf" title={t("shelf.title")} desc={t("shelf.desc")} items={mine.filter((e): e is LibEntry => !!e)} {...common} />
        <section aria-labelledby="mine-music">
          <h3 id="mine-music" className="text-3xl">{t("myMusic.title")}</h3>
          <p className="label mt-1 !normal-case !tracking-normal">{t("myMusic.desc")}</p>
          <div className="mt-6">
            {mine_pl.every((p) => p.tracks.length === 0) ? <p className="slot">{t("myMusic.empty")}</p> : mine_pl.map((p) => <Playlist key={p.id} title={p.title} tracks={p.tracks} />)}
          </div>
        </section>
      </div>

      <h2 className="mt-16 text-4xl">{t("discover")}</h2>
      <div className="mt-6 grid gap-14 lg:grid-cols-2">
        <List id="d-anime" title={t("anime.title")} desc={t("anime.desc")} items={anime} {...common} />
        <section aria-labelledby="d-music">
          <h3 id="d-music" className="text-3xl">{t("chart.title")}</h3>
          <p className="label mt-1 !normal-case !tracking-normal">{t("chart.desc")}</p>
          <div className="mt-6">{chartTracks.length === 0 ? <p className="slot">{t("empty")}</p> : <Playlist title={t("chart.title")} tracks={chartTracks} note={t("chart.note")} />}</div>
        </section>
        <List id="d-books" title={t("books.title")} desc={t("books.desc")} items={books} {...common} />
        <List id="d-tech" title={t("tech.title")} desc={t("tech.desc")} items={tech} {...common} />
      </div>
    </div>
  );
}
