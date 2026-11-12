/** Pure, dependency-free search used by the /search page and the command palette. */

export interface SearchEntry {
  id: string;
  type: "page" | "project" | "garden" | "journal";
  title: string;
  summary: string;
  tags: string[];
  href: string;
  /** Language of title/summary (for the `lang` attribute when it differs from the UI language). */
  lang: string;
  /** "draft" | "untranslated" are surfaced next to results. */
  status: "translated" | "draft" | "untranslated";
}

/**
 * Case-, width- and diacritic-insensitive: "viet" finds "Việt", "ｔｅｓｔ" finds "test".
 * Japanese is matched by substring (there are no word boundaries to tokenise on).
 */
export function normalize(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function search(entries: SearchEntry[], query: string, limit = 30): SearchEntry[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const scored: { entry: SearchEntry; score: number }[] = [];
  for (const entry of entries) {
    const title = normalize(entry.title);
    const summary = normalize(entry.summary);
    const tags = normalize(entry.tags.join(" "));
    let score = 0;
    let ok = true;
    for (const t of tokens) {
      let s = 0;
      if (title.startsWith(t)) s += 8;
      else if (title.includes(t)) s += 5;
      if (tags.includes(t)) s += 3;
      if (summary.includes(t)) s += 1;
      if (s === 0) { ok = false; break; }
      score += s;
    }
    if (ok) scored.push({ entry, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title)).slice(0, limit).map((s) => s.entry);
}
