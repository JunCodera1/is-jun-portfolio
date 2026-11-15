import { normalizeAnime, normalizeBook, normalizeTrack, type LibEntry } from "@/lib/library";
import { defineIntegration } from "../sdk";

const pick = (raw: unknown, ...path: string[]): unknown[] => {
  let v: unknown = raw;
  for (const k of path) v = v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined;
  return Array.isArray(v) ? v : [];
};
const keep = (xs: (LibEntry | null)[]) => xs.filter((e): e is LibEntry => e !== null);
const FIELDS = "id title{romaji english native} seasonYear averageScore genres siteUrl coverImage{medium}";
const SIX_HOURS = 21_600_000;

export type AnilistArgs = { op: "trending"; n: number } | { op: "lookup"; search: string };
export const anilist = defineIntegration<AnilistArgs, LibEntry[]>({
  id: "anilist", name: "AniList", kind: "media", auth: { type: "none" }, scopes: ["public:read"],
  allowedHosts: ["graphql.anilist.co"],
  // AniList documents 90 requests/minute and has been temporarily degraded to 30; stay under the lower figure.
  rateLimit: { max: 30, perMs: 60_000 }, ttlMs: SIX_HOURS,
  attribution: { label: "AniList API", url: "https://docs.anilist.co/" }, privacy: "public-data", probe: { op: "trending", n: 1 },
  async fetch(ctx, a) {
    const body = a.op === "trending"
      ? { query: `query($n:Int){Page(perPage:$n){media(type:ANIME,sort:TRENDING_DESC){${FIELDS}}}}`, variables: { n: a.n } }
      : { query: `query($s:String){Page(perPage:1){media(search:$s,type:ANIME,sort:SEARCH_MATCH){${FIELDS}}}}`, variables: { s: a.search } };
    const raw = await ctx.getJson("https://graphql.anilist.co", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const out = keep(pick(raw, "data", "Page", "media").map(normalizeAnime));
    if (out.length === 0) throw new Error("no results");
    return out;
  },
});

export type OpenLibraryArgs = { op: "trending" | "tech"; n: number };
export const openlibrary = defineIntegration<OpenLibraryArgs, LibEntry[]>({
  id: "openlibrary", name: "Open Library", kind: "media", auth: { type: "none" }, scopes: ["public:read"],
  allowedHosts: ["openlibrary.org"], rateLimit: { max: 20, perMs: 60_000 }, ttlMs: SIX_HOURS,
  attribution: { label: "Open Library API", url: "https://openlibrary.org/developers/api" }, privacy: "public-data", probe: { op: "trending", n: 1 },
  async fetch(ctx, a) {
    const url = a.op === "trending"
      ? `https://openlibrary.org/trending/weekly.json?limit=${a.n}`
      : `https://openlibrary.org/search.json?q=${encodeURIComponent('subject:"computer programming" language:eng')}&sort=rating&limit=${a.n}&fields=key,title,author_name,first_publish_year,cover_i`;
    const out = keep(pick(await ctx.getJson(url), a.op === "trending" ? "works" : "docs").map(normalizeBook));
    if (out.length === 0) throw new Error("no results");
    return out;
  },
});

export type DeezerArgs = { op: "chart"; n: number };
export const deezer = defineIntegration<DeezerArgs, LibEntry[]>({
  id: "deezer", name: "Deezer", kind: "media", auth: { type: "none" }, scopes: ["public:read"],
  allowedHosts: ["api.deezer.com"], rateLimit: { max: 40, perMs: 5_000 }, ttlMs: SIX_HOURS,
  attribution: { label: "Deezer API", url: "https://developers.deezer.com/api" }, privacy: "public-data", probe: { op: "chart", n: 1 },
  async fetch(ctx, a) {
    const out = keep(pick(await ctx.getJson(`https://api.deezer.com/chart/0/tracks?limit=${a.n}`), "data").map(normalizeTrack));
    if (out.length === 0) throw new Error("no results");
    return out;
  },
});
