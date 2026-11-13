import type { SearchEntry } from "@/lib/search";

/** "Surprise me": a random page, project or note from the site's own search index, never the page you are already on. */
export function pickSurprise(entries: readonly SearchEntry[], currentPath: string, rng: () => number = Math.random): SearchEntry | null {
  const here = currentPath.replace(/^\/(en|ja|vi)(?=\/|$)/, "") || "/";
  const pool = entries.filter((e) => e.href.replace(/^\/(en|ja|vi)(?=\/|$)/, "") !== here);
  if (pool.length === 0) return null;
  return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))]!;
}
