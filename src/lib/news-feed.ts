import "server-only";
import { normalizeDevTo, normalizeHnItem, normalizeLobsters, parseAtomItems, parseRssItems, type NewsItem } from "@/lib/news";

const REVALIDATE = 1800;
const opts = (ms: number) => ({ next: { revalidate: REVALIDATE }, signal: AbortSignal.timeout(ms), headers: { "User-Agent": "my-digital-world/1.0 (+news reader)", Accept: "*/*" } });

export type NewsGroup = "world" | "dev" | "ja" | "vi";
export interface NewsSource { id: string; name: string; group: NewsGroup; lang: "en" | "ja" | "vi"; load: (limit: number) => Promise<NewsItem[]> }

const json = async (url: string, ms = 5000): Promise<unknown> => {
  const res = await fetch(url, opts(ms));
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
};
const text = async (url: string, ms = 6000): Promise<string> => {
  const res = await fetch(url, opts(ms));
  if (!res.ok) throw new Error(String(res.status));
  return res.text();
};

async function hackerNews(limit: number): Promise<NewsItem[]> {
  const ids = await json("https://hacker-news.firebaseio.com/v0/topstories.json");
  if (!Array.isArray(ids)) return [];
  const items = await Promise.all(
    ids.filter((i): i is number => typeof i === "number").slice(0, limit).map(async (id) => {
      try { return normalizeHnItem(await json(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, 4000)); } catch { return null; }
    }),
  );
  return items.filter((i): i is NewsItem => i !== null);
}

const list = (raw: unknown) => (Array.isArray(raw) ? raw : []);

export const NEWS_SOURCES: NewsSource[] = [
  { id: "verge", name: "The Verge", group: "world", lang: "en", load: async (n) => parseAtomItems(await text("https://www.theverge.com/rss/index.xml"), n, "en") },
  { id: "ars", name: "Ars Technica", group: "world", lang: "en", load: async (n) => parseRssItems(await text("https://feeds.arstechnica.com/arstechnica/index"), n, "en") },
  { id: "bbc", name: "BBC Technology", group: "world", lang: "en", load: async (n) => parseRssItems(await text("https://feeds.bbci.co.uk/news/technology/rss.xml"), n, "en") },
  { id: "hn", name: "Hacker News", group: "dev", lang: "en", load: hackerNews },
  { id: "lobsters", name: "Lobsters", group: "dev", lang: "en", load: async (n) => list(await json("https://lobste.rs/hottest.json")).slice(0, n).map(normalizeLobsters).filter((i): i is NewsItem => i !== null) },
  { id: "devto", name: "DEV", group: "dev", lang: "en", load: async (n) => list(await json(`https://dev.to/api/articles?top=1&per_page=${n}`)).map(normalizeDevTo).filter((i): i is NewsItem => i !== null) },
  { id: "zenn", name: "Zenn", group: "ja", lang: "ja", load: async (n) => parseRssItems(await text("https://zenn.dev/feed"), n, "ja") },
  { id: "gigazine", name: "GIGAZINE", group: "ja", lang: "ja", load: async (n) => parseRssItems(await text("https://gigazine.net/news/rss_2.0/"), n, "ja") },
  { id: "vnexpress", name: "VnExpress Số hóa", group: "vi", lang: "vi", load: async (n) => parseRssItems(await text("https://vnexpress.net/rss/so-hoa.rss"), n, "vi") },
];

export interface NewsResult { items: (NewsItem & { group: NewsGroup })[]; sources: { id: string; name: string; group: NewsGroup; ok: boolean }[] }

/** Every source is fetched in parallel with its own timeout; one failing never affects the others. Items are de-duplicated by URL and sorted newest-first. */
export async function getNews(perSource = 10): Promise<NewsResult> {
  const settled = await Promise.all(
    NEWS_SOURCES.map(async (s) => {
      try {
        const items = await s.load(perSource);
        return { s, items: items.map((i) => ({ ...i, source: s.name, group: s.group })), ok: items.length > 0 };
      } catch {
        return { s, items: [], ok: false };
      }
    }),
  );
  const seen = new Set<string>();
  const items = settled
    .flatMap((r) => r.items)
    .filter((i) => (seen.has(i.url) ? false : (seen.add(i.url), true)))
    .sort((a, b) => (b.time ?? "").localeCompare(a.time ?? ""));
  return { items, sources: settled.map((r) => ({ id: r.s.id, name: r.s.name, group: r.s.group, ok: r.ok })) };
}
