import "server-only";
import { newsAdapters, runIntegration } from "@/core/integrations";
import type { NewsItem } from "@/lib/news";

export type NewsGroup = "world" | "dev" | "ja" | "vi";
export interface NewsResult { items: (NewsItem & { group: NewsGroup })[]; sources: { id: string; name: string; group: NewsGroup; ok: boolean }[] }

/** Every source is its own integration: one failing never affects the others. Items are de-duplicated by URL and sorted newest-first. */
export async function getNews(perSource = 10): Promise<NewsResult> {
  const settled = await Promise.all(newsAdapters.map(async (a) => {
    const r = await runIntegration(a, { limit: perSource });
    const group = a.meta!.group as NewsGroup;
    return { a, group, items: (r.data ?? []).map((i) => ({ ...i, source: a.name, group })), ok: (r.data?.length ?? 0) > 0 && r.health.status !== "failed" };
  }));
  const seen = new Set<string>();
  const items = settled.flatMap((r) => r.items).filter((i) => (seen.has(i.url) ? false : (seen.add(i.url), true))).sort((a, b) => (b.time ?? "").localeCompare(a.time ?? ""));
  return { items, sources: settled.map((r) => ({ id: r.a.id.replace(/^news\./, ""), name: r.a.name, group: r.group, ok: r.ok })) };
}
