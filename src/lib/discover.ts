import type { SearchEntry } from "@/lib/search";

const stripLocale = (p: string) => p.replace(/^\/(en|ja|vi)(?=\/|$)/, "").split("#")[0] || "/";

/**
 * Discovery Engine. From where you are it goes to something genuinely connected (`related`, from the unified data layer):
 * a direct edge, a page that points back at this one, or an item sharing its topic. Only when the current page has no recorded
 * connection at all does it fall back to any public page, because stopping would be worse. It never returns the page you are on.
 * `follow` is the probability of following a connection when one exists (1 = always; lower it only for an explicit "jump anywhere" mode).
 */
export function pickDiscovery(entries: readonly SearchEntry[], currentPath: string, rng: () => number = Math.random, follow = 1): SearchEntry | null {
  const here = stripLocale(currentPath);
  const pool = entries.filter((e) => stripLocale(e.href) !== here);
  if (pool.length === 0) return null;
  const me = entries.find((e) => stripLocale(e.href) === here);
  const near = new Set((me?.related ?? []).map(stripLocale));
  // also entries that point at the current page
  for (const e of pool) if ((e.related ?? []).some((r) => stripLocale(r) === here)) near.add(stripLocale(e.href));
  const linked = pool.filter((e) => near.has(stripLocale(e.href)));
  const from = linked.length > 0 && rng() < follow ? linked : pool;
  return from[Math.min(from.length - 1, Math.floor(rng() * from.length))]!;
}
