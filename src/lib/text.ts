import GithubSlugger from "github-slugger";
import type { Locale } from "@/i18n/routing";

export interface TocItem {
  depth: 2 | 3;
  id: string;
  text: string;
}

/** Strip the markdown that would not appear in a rendered heading's text. */
function plain(md: string): string {
  return md
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim();
}

/** h2/h3 headings (outside code fences) with the same ids rehype-slug generates. */
export function extractToc(body: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let fenced = false;
  for (const line of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = plain(m[2]!);
    items.push({ depth: m[1]!.length as 2 | 3, id: slugger.slug(text), text });
  }
  return items;
}

/** Reading time in whole minutes (min 1). Japanese has no spaces, so it is counted in characters. */
export function readingMinutes(body: string, lang: Locale): number {
  const text = body.replace(/```[\s\S]*?```/g, " ").replace(/[#>*_`|[\]()-]/g, " ");
  if (lang === "ja") {
    const chars = text.replace(/\s+/g, "").length;
    return Math.max(1, Math.round(chars / 500));
  }
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
