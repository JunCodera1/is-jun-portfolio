/**
 * Tech-news parsing. Third-party text is untrusted: titles are rendered as plain text by React, links must be
 * http(s), counts must be finite numbers, and everything is length-bounded. No headline ever enters the search index or sitemap.
 */
export interface NewsItem { id: string; title: string; url: string; meta?: string; points?: number; comments?: number; time?: string; lang: "en" | "ja" }

const MAX_TITLE = 160;

export function safeHttpUrl(input: unknown): string | null {
  if (typeof input !== "string") return null;
  try {
    const u = new URL(input);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim().slice(0, MAX_TITLE);

export function normalizeHnItem(raw: unknown): NewsItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.type !== "story" || typeof r.id !== "number" || typeof r.title !== "string" || r.dead === true || r.deleted === true) return null;
  const discussion = `https://news.ycombinator.com/item?id=${r.id}`;
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : undefined);
  const t = typeof r.time === "number" && Number.isFinite(r.time) ? new Date(r.time * 1000).toISOString() : undefined;
  return {
    id: `hn-${r.id}`, title: clean(r.title), url: safeHttpUrl(r.url) ?? discussion,
    points: num(r.score), comments: num(r.descendants), time: t, lang: "en",
    meta: discussion,
  };
}

const cdata = (s: string) => s.replace(/^<!\[CDATA\[|\]\]>$/g, "");

/** Minimal RSS 2.0 item extraction (no XML parser dependency). Ignores anything that doesn't have a title and a safe link. */
export function parseRssItems(xml: string, limit = 12, lang: "en" | "ja" = "ja"): NewsItem[] {
  const out: NewsItem[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const body = m[1]!;
    const title = /<title>([\s\S]*?)<\/title>/.exec(body)?.[1];
    const link = /<link>([\s\S]*?)<\/link>/.exec(body)?.[1];
    const date = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(body)?.[1];
    const url = link ? safeHttpUrl(cdata(link.trim())) : null;
    if (!title || !url) continue;
    const t = date ? new Date(cdata(date.trim())) : null;
    out.push({ id: `rss-${out.length}-${url}`, title: clean(cdata(title.trim())), url, time: t && !Number.isNaN(t.getTime()) ? t.toISOString() : undefined, lang });
    if (out.length >= limit) break;
  }
  return out;
}
