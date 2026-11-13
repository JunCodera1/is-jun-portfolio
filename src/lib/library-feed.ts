import "server-only";
import { normalizeAnime, normalizeBook, normalizeTrack, type LibEntry } from "@/lib/library";

const get = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, { ...init, next: { revalidate: 21600 }, signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()) as unknown;
};
const anilist = async (query: string, variables: Record<string, unknown>) =>
  get("https://graphql.anilist.co", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, variables }) });

const FIELDS = "id title{romaji english native} seasonYear averageScore genres siteUrl";
const safe = async (f: () => Promise<LibEntry[]>): Promise<LibEntry[]> => { try { return await f(); } catch { return []; } };
const pick = (raw: unknown, ...path: string[]): unknown[] => {
  let v: unknown = raw;
  for (const k of path) v = v && typeof v === "object" ? (v as Record<string, unknown>)[k] : undefined;
  return Array.isArray(v) ? v : [];
};

export const trendingAnime = (n = 12) => safe(async () =>
  pick(await anilist(`query($n:Int){Page(perPage:$n){media(type:ANIME,sort:TRENDING_DESC){${FIELDS}}}}`, { n }), "data", "Page", "media").map(normalizeAnime).filter((e): e is LibEntry => e !== null));

/** Look up one title the owner named, so its card carries real public data (year, score, link). */
export const lookupAnime = (search: string) => safe(async () =>
  pick(await anilist(`query($s:String){Page(perPage:1){media(search:$s,type:ANIME,sort:SEARCH_MATCH){${FIELDS}}}}`, { s: search }), "data", "Page", "media").map(normalizeAnime).filter((e): e is LibEntry => e !== null));

export const trendingBooks = (n = 12) => safe(async () =>
  pick(await get(`https://openlibrary.org/trending/weekly.json?limit=${n}`), "works").map(normalizeBook).filter((e): e is LibEntry => e !== null));

export const techBooks = (n = 12) => safe(async () =>
  pick(await get(`https://openlibrary.org/search.json?q=${encodeURIComponent('subject:"computer programming" language:eng')}&sort=rating&limit=${n}&fields=key,title,author_name,first_publish_year`), "docs").map(normalizeBook).filter((e): e is LibEntry => e !== null));

export const musicChart = (n = 12) => safe(async () =>
  pick(await get(`https://api.deezer.com/chart/0/tracks?limit=${n}`), "data").map(normalizeTrack).filter((e): e is LibEntry => e !== null));
