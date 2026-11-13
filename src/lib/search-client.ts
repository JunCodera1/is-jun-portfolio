"use client";
import type { SearchEntry } from "@/lib/search";

const indexCache = new Map<string, Promise<SearchEntry[]>>();
/** Per-locale static search index, fetched once per session and shared by the command palette and "Surprise me". */
export function loadSearchIndex(locale: string): Promise<SearchEntry[]> {
  let p = indexCache.get(locale);
  if (!p) {
    p = fetch(`/${locale}/search-index.json`).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<SearchEntry[]>;
    });
    p.catch(() => indexCache.delete(locale)); // allow a retry
    indexCache.set(locale, p);
  }
  return p;
}
