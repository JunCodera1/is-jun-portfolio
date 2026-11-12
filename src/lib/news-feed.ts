import "server-only";
import { normalizeHnItem, parseRssItems, type NewsItem } from "@/lib/news";

const REVALIDATE = 1800;
const opts = (ms: number) => ({ next: { revalidate: REVALIDATE }, signal: AbortSignal.timeout(ms) });

/** Top Hacker News stories. Every per-item fetch is bounded; any failure yields an empty list, never an exception. */
export async function getHackerNews(limit = 12): Promise<NewsItem[]> {
  try {
    const ids = (await (await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", opts(5000))).json()) as unknown;
    if (!Array.isArray(ids)) return [];
    const items = await Promise.all(
      ids.filter((i): i is number => typeof i === "number").slice(0, limit).map(async (id) => {
        try {
          const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, opts(4000));
          return res.ok ? normalizeHnItem(await res.json()) : null;
        } catch {
          return null;
        }
      }),
    );
    return items.filter((i): i is NewsItem => i !== null);
  } catch {
    return [];
  }
}

/** Zenn trending (Japanese) via its public RSS feed. */
export async function getZennTrending(limit = 12): Promise<NewsItem[]> {
  try {
    const res = await fetch("https://zenn.dev/feed", opts(5000));
    return res.ok ? parseRssItems(await res.text(), limit, "ja") : [];
  } catch {
    return [];
  }
}
