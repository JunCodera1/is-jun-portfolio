import { safeHttpUrl } from "@/lib/news";

/** Public-API library entries. All fields are third-party and untrusted: bounded, plain text, http(s) links only. */
export interface LibEntry { id: string; title: string; sub?: string; meta?: string; url: string }

const cut = (s: unknown, n = 120) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, n) : "");
const fin = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

export function normalizeAnime(raw: unknown): LibEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const t = (r.title ?? {}) as Record<string, unknown>;
  const title = cut(t.english) || cut(t.romaji);
  const url = safeHttpUrl(r.siteUrl);
  if (typeof r.id !== "number" || !title || !url) return null;
  const genres = Array.isArray(r.genres) ? r.genres.filter((g): g is string => typeof g === "string").slice(0, 3).map((g) => cut(g, 24)) : [];
  const score = fin(r.averageScore);
  const meta = [fin(r.seasonYear) ?? fin(r.startYear), score !== undefined ? `${score}/100` : "", genres.join(", ")].filter(Boolean).join(" · ");
  return { id: `anime-${r.id}`, title, sub: cut(t.native) || undefined, meta, url };
}

export function normalizeBook(raw: unknown): LibEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const title = cut(r.title);
  const key = typeof r.key === "string" && /^\/works\/OL\d+W$/.test(r.key) ? r.key : null;
  if (!title || !key) return null;
  const authors = Array.isArray(r.author_name) ? r.author_name.filter((a): a is string => typeof a === "string").slice(0, 2).map((a) => cut(a, 60)) : [];
  const year = fin(r.first_publish_year);
  return { id: `book-${key}`, title, sub: authors.join(", ") || undefined, meta: year ? String(year) : undefined, url: `https://openlibrary.org${key}` };
}

export function normalizeTrack(raw: unknown): LibEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const title = cut(r.title_short) || cut(r.title);
  const url = safeHttpUrl(r.link);
  const artist = cut(((r.artist ?? {}) as Record<string, unknown>).name, 80);
  if (typeof r.id !== "number" || !title || !url) return null;
  return { id: `track-${r.id}`, title, sub: artist || undefined, url };
}
