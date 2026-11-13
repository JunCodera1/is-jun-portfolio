/**
 * Tech-news parsing. Third-party text is untrusted: titles are rendered as plain text by React, links must be
 * http(s), counts must be finite numbers, and everything is length-bounded. No headline ever enters the search index or sitemap.
 */
export interface NewsItem { id: string; title: string; url: string; meta?: string; points?: number; comments?: number; time?: string; lang: "en" | "ja" | "vi"; source?: string }

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
export function parseRssItems(xml: string, limit = 12, lang: "en" | "ja" | "vi" = "ja"): NewsItem[] {
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

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : undefined);
const iso = (v: unknown) => {
  if (typeof v !== "string") return undefined;
  const t = new Date(v);
  return Number.isNaN(t.getTime()) ? undefined : t.toISOString();
};

/** Atom feeds (e.g. The Verge): <entry> with <title> and <link href="..."/>. */
export function parseAtomItems(xml: string, limit = 12, lang: "en" | "ja" | "vi" = "en"): NewsItem[] {
  const out: NewsItem[] = [];
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const body = m[1]!;
    const title = /<title[^>]*>([\s\S]*?)<\/title>/.exec(body)?.[1];
    const href = /<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/.exec(body)?.[1] ?? /<link[^>]*href=["']([^"']+)["']/.exec(body)?.[1];
    const date = /<(?:published|updated)>([\s\S]*?)<\/(?:published|updated)>/.exec(body)?.[1];
    const url = href ? safeHttpUrl(href.replace(/&amp;/g, "&")) : null;
    if (!title || !url) continue;
    out.push({ id: `atom-${out.length}-${url}`, title: clean(cdata(title.trim()).replace(/&amp;/g, "&").replace(/&#8217;|&#039;/g, "’").replace(/&quot;/g, '"')), url, time: iso(date?.trim()), lang });
    if (out.length >= limit) break;
  }
  return out;
}

/** dev.to /api/articles item. */
export function normalizeDevTo(raw: unknown): NewsItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const url = safeHttpUrl(r.url);
  if (typeof r.id !== "number" || typeof r.title !== "string" || !url) return null;
  return { id: `devto-${r.id}`, title: clean(r.title), url, points: num(r.public_reactions_count), comments: num(r.comments_count), time: iso(r.published_at), lang: "en" };
}

/** Lobsters /hottest.json item. */
export function normalizeLobsters(raw: unknown): NewsItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.short_id !== "string" || typeof r.title !== "string") return null;
  const url = safeHttpUrl(r.url) ?? safeHttpUrl(r.comments_url);
  if (!url) return null;
  return { id: `lobsters-${r.short_id}`, title: clean(r.title), url, points: num(r.score), comments: num(r.comment_count), time: iso(r.created_at), lang: "en" };
}
