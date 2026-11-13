import { getFormatter, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { glossary } from "@/content/data/vault";
import { getRecentRepos } from "@/lib/github-feed";
import { getKnowledge } from "@/lib/knowledge/build";
import { degree, suggestConnections, type Kind, type Status } from "@/lib/knowledge/types";
import { trendingAnime, trendingBooks, musicChart } from "@/lib/library-feed";
import { resolveText } from "@/lib/localized";
import { getNews } from "@/lib/news-feed";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";

export const revalidate = 1800;
export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "observatory", "/observatory");

const ORPHAN_KINDS: Kind[] = ["note", "post", "concept", "research", "mistake", "decision", "idea"];

/**
 * The Observatory: how the site's own data is doing. Which connected sources answer, how complete each language is,
 * and where the knowledge graph has gaps. It reads the same data layer as everything else and shows nothing private.
 */
export default async function ObservatoryPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "observatory" });
  const tk = await getTranslations({ locale, namespace: "timeline" });
  const f = await getFormatter({ locale });

  // 1. source health (each call degrades to an empty result on failure)
  const [news, gh, anime, books, music] = await Promise.all([getNews(1), getRecentRepos(1), trendingAnime(1), trendingBooks(1), musicChart(1)]);
  const sources = [
    { id: "github", name: "GitHub", ok: gh.source === "live", note: gh.source === "live" ? t("live") : t("snapshot", { date: f.dateTime(new Date(gh.asOf), { dateStyle: "medium" }) }) },
    ...news.sources.map((s) => ({ id: s.id, name: s.name, ok: s.ok, note: t("cache", { n: 30 }) })),
    { id: "anilist", name: "AniList", ok: anime.length > 0, note: t("cache", { n: 360 }) },
    { id: "openlibrary", name: "Open Library", ok: books.length > 0, note: t("cache", { n: 360 }) },
    { id: "deezer", name: "Deezer", ok: music.length > 0, note: t("cache", { n: 360 }) },
  ];
  const up = sources.filter((s) => s.ok).length;

  // 2. content overview and language coverage, from the unified data layer
  const perLocale = await Promise.all(locales.map(async (l) => ({ l, k: await getKnowledge(l) })));
  const here = perLocale.find((x) => x.l === locale)!.k;
  const real = here.items.filter((i) => !["topic", "tech"].includes(i.kind));
  const kinds = [...new Set(real.map((i) => i.kind))];
  const coverage = perLocale.map(({ l, k }) => {
    const c: Record<Status, number> = { translated: 0, draft: 0, untranslated: 0 };
    for (const i of k.items.filter((x) => !["topic", "tech"].includes(x.kind))) c[i.status]++;
    for (const g of glossary) c[resolveText(g.def, l as Locale).status]++;
    return { l, c, total: c.translated + c.draft + c.untranslated };
  });
  const todo = real.filter((i) => i.status !== "translated").slice(0, 6);

  // 3. graph health
  const hubs = [...here.items].filter((i) => i.kind !== "topic").map((i) => ({ i, d: degree(i.id, here.edges) })).sort((a, b) => b.d - a.d || a.i.id.localeCompare(b.i.id)).slice(0, 5);
  const orphans = here.items.filter((i) => ORPHAN_KINDS.includes(i.kind) && degree(i.id, here.edges) === 0);
  const suggestions = suggestConnections(here, 2, 6);

  const bar = (c: Record<Status, number>, total: number) => (
    <div className="flex h-3 w-full border border-outline" role="img" aria-label={t("coverageAria", { a: c.translated, b: c.draft, c: c.untranslated })}>
      <span className="bg-accent" style={{ width: `${(c.translated / total) * 100}%` }} /><span className="bg-[#ffd23f]" style={{ width: `${(c.draft / total) * 100}%` }} /><span className="bg-surface-2" style={{ width: `${(c.untranslated / total) * 100}%` }} />
    </div>
  );

  return (
    <div className="page pb-8">
      <PageHeader eyebrow="OBSERVATORY" title={t("title")} lead={t("lead")} />

      <section aria-labelledby="obs-sources" className="mt-12">
        <h2 id="obs-sources" className="text-3xl md:text-4xl">{t("sources")}</h2>
        <p className="label mt-1 !normal-case !tracking-normal">{t("sourcesSummary", { up, total: sources.length })} {t("sourcesNote")}</p>
        <ul className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((s) => (
            <li key={s.id} className="flex items-baseline gap-3 border-b border-line py-2">
              <span aria-hidden className={`inline-block h-3 w-3 shrink-0 border-2 border-outline ${s.ok ? "bg-accent" : "bg-surface-2"}`} />
              <span className="min-w-0"><span className="font-display text-lg">{s.name}</span> <span className="sr-only">{s.ok ? t("ok") : t("down")}.</span><span className="label block !normal-case !tracking-normal">{s.ok ? s.note : t("down")}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="obs-content" className="mt-14">
        <h2 id="obs-content" className="text-3xl md:text-4xl">{t("content")}</h2>
        <p className="label mt-1 !normal-case !tracking-normal">{t("contentNote", { n: real.length })}</p>
        <ul className="mt-4 flex flex-wrap gap-2">{kinds.map((kd) => (<li key={kd} className="chip">{tk(`kinds.${kd}`)} · {real.filter((i) => i.kind === kd).length}</li>))}</ul>
      </section>

      <section aria-labelledby="obs-lang" className="mt-14">
        <h2 id="obs-lang" className="text-3xl md:text-4xl">{t("languages")}</h2>
        <p className="label mt-1 !normal-case !tracking-normal">{t("languagesNote")}</p>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {coverage.map(({ l, c, total }) => (
            <li key={l} className="card-ink p-4">
              <p className="font-display text-2xl">{t(`lang.${l}`)}</p>
              <div className="mt-3">{bar(c, total)}</div>
              <p className="label mt-2 !normal-case !tracking-normal">{t("coverage", { a: c.translated, b: c.draft, c: c.untranslated })}</p>
            </li>
          ))}
        </ul>
        {todo.length > 0 && (
          <div className="mt-6">
            <h3 className="label !text-fg-2">{t("todoTitle")}</h3>
            <ul className="mt-2 space-y-1">{todo.map((i) => (<li key={i.id}><Link href={i.href} className="link">{i.title}</Link> <span className="label !normal-case !tracking-normal">· {t(`status.${i.status}`)}</span></li>))}</ul>
          </div>
        )}
      </section>

      <section aria-labelledby="obs-graph" className="mt-14">
        <h2 id="obs-graph" className="text-3xl md:text-4xl">{t("graph")}</h2>
        <div className="mt-4 grid gap-10 lg:grid-cols-3">
          <div><h3 className="label !text-fg-2">{t("hubs")}</h3><ol className="mt-2 space-y-1">{hubs.map(({ i, d }) => (<li key={i.id}><Link href={i.href} className="link">{i.title}</Link> <span className="label">· {d}</span></li>))}</ol></div>
          <div><h3 className="label !text-fg-2">{t("orphans")}</h3>{orphans.length === 0 ? <p className="mt-2 text-fg-2">{t("noOrphans")}</p> : <ul className="mt-2 space-y-1">{orphans.slice(0, 8).map((i) => (<li key={i.id}><Link href={i.href} className="link">{i.title}</Link></li>))}</ul>}</div>
          <div><h3 className="label !text-fg-2">{t("suggestions")}</h3>{suggestions.length === 0 ? <p className="mt-2 text-fg-2">{t("noSuggestions")}</p> : <ul className="mt-2 space-y-2">{suggestions.map((s) => (<li key={`${s.a.id}${s.b.id}`}><Link href={s.a.href} className="link">{s.a.title}</Link> ↔ <Link href={s.b.href} className="link">{s.b.title}</Link><span className="label block !normal-case !tracking-normal">{t("shared")}: {s.shared.join(", ")}</span></li>))}</ul>}<p className="label mt-3 !normal-case !tracking-normal">{t("suggestNote")}</p></div>
        </div>
      </section>

      <section aria-labelledby="obs-open" className="mt-14">
        <h2 id="obs-open" className="text-3xl md:text-4xl">{t("open")}</h2>
        <p className="label mt-1 !normal-case !tracking-normal">{t("openNote")}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          <li><a className="chip !normal-case" href={`/${locale}/feed.json`}>feed.json</a></li>
          <li><a className="chip !normal-case" href={`/${locale}/feed.xml`}>feed.xml</a></li>
          <li><a className="chip !normal-case" href="/profile.json">profile.json</a></li>
          <li><a className="chip !normal-case" href={`/${locale}/search-index.json`}>search-index.json</a></li>
        </ul>
      </section>
    </div>
  );
}
