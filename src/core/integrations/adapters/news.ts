import { normalizeDevTo, normalizeHnItem, normalizeLobsters, parseAtomItems, parseRssItems, type NewsItem } from "@/lib/news";
import { defineIntegration, type Ctx } from "../sdk";

type Args = { limit: number };
type Group = "world" | "dev" | "ja" | "vi";
type Lang = "en" | "ja" | "vi";
const list = (raw: unknown) => (Array.isArray(raw) ? raw : []);
const compact = (xs: (NewsItem | null)[]) => xs.filter((i): i is NewsItem => i !== null);

function source(id: string, name: string, group: Group, lang: Lang, hosts: string[], url: string, parse: (ctx: Ctx, url: string, n: number) => Promise<NewsItem[]>, rate = { max: 20, perMs: 10_000 }) {
  return defineIntegration<Args, NewsItem[]>({
    id: `news.${id}`, name, kind: "news", auth: { type: "none" }, scopes: ["public:read"], allowedHosts: hosts, rateLimit: rate, ttlMs: 1_800_000,
    attribution: { label: name, url: `https://${hosts[0]!.replace(/^\./, "")}` }, privacy: "public-data", meta: { group, lang }, probe: { limit: 1 },
    fetch: async (ctx, { limit }) => { const items = await parse(ctx, url, limit); if (items.length === 0) throw new Error("no items parsed"); return items; },
  });
}
const rss = (lang: Lang) => async (c: Ctx, u: string, n: number) => parseRssItems(await c.getText(u), n, lang);

export const newsAdapters = [
  source("verge", "The Verge", "world", "en", ["www.theverge.com"], "https://www.theverge.com/rss/index.xml", async (c, u, n) => parseAtomItems(await c.getText(u), n, "en")),
  source("ars", "Ars Technica", "world", "en", ["feeds.arstechnica.com"], "https://feeds.arstechnica.com/arstechnica/index", rss("en")),
  source("bbc", "BBC Technology", "world", "en", ["feeds.bbci.co.uk"], "https://feeds.bbci.co.uk/news/technology/rss.xml", rss("en")),
  source("hn", "Hacker News", "dev", "en", ["hacker-news.firebaseio.com"], "https://hacker-news.firebaseio.com/v0/topstories.json", async (c, u, n) => {
    const ids = list(await c.getJson(u)).filter((i): i is number => typeof i === "number").slice(0, n);
    return compact(await Promise.all(ids.map(async (id) => { try { return normalizeHnItem(await c.getJson(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)); } catch { return null; } })));
  }, { max: 40, perMs: 10_000 }),
  source("lobsters", "Lobsters", "dev", "en", ["lobste.rs"], "https://lobste.rs/hottest.json", async (c, u, n) => compact(list(await c.getJson(u)).slice(0, n).map(normalizeLobsters))),
  source("devto", "DEV", "dev", "en", ["dev.to"], "https://dev.to/api/articles?top=1&per_page=30", async (c, u, n) => compact(list(await c.getJson(u)).slice(0, n).map(normalizeDevTo))),
  source("zenn", "Zenn", "ja", "ja", ["zenn.dev"], "https://zenn.dev/feed", rss("ja")),
  source("gigazine", "GIGAZINE", "ja", "ja", ["gigazine.net"], "https://gigazine.net/news/rss_2.0/", rss("ja")),
  source("vnexpress", "VnExpress Số hóa", "vi", "vi", ["vnexpress.net", ".vnexpress.net"], "https://vnexpress.net/rss/so-hoa.rss", rss("vi")),
];
