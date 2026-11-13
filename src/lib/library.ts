import { safeHttpUrl } from "@/lib/news";

/** Public-API library entries. All fields are third-party and untrusted: bounded, plain text, http(s) links only. */
export interface LibEntry { id: string; title: string; sub?: string; meta?: string; url: string; image?: string }

/** Cover images may only come from these hosts (they are also the only ones the CSP allows). */
const IMAGE_HOSTS = new Set(["s4.anilist.co", "covers.openlibrary.org", "cdn-images.dzcdn.net"]);
export function safeImageUrl(input: unknown): string | undefined {
  const u = safeHttpUrl(input);
  if (!u) return undefined;
  const p = new URL(u);
  return p.protocol === "https:" && IMAGE_HOSTS.has(p.hostname) ? u : undefined;
}

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
  return { id: `anime-${r.id}`, title, sub: cut(t.native) || undefined, meta, url, image: safeImageUrl(((r.coverImage ?? {}) as Record<string, unknown>).medium) };
}

export function normalizeBook(raw: unknown): LibEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const title = cut(r.title);
  const key = typeof r.key === "string" && /^\/works\/OL\d+W$/.test(r.key) ? r.key : null;
  if (!title || !key) return null;
  const authors = Array.isArray(r.author_name) ? r.author_name.filter((a): a is string => typeof a === "string").slice(0, 2).map((a) => cut(a, 60)) : [];
  const year = fin(r.first_publish_year);
  const cover = typeof r.cover_i === "number" && Number.isInteger(r.cover_i) && r.cover_i > 0 ? `https://covers.openlibrary.org/b/id/${r.cover_i}-M.jpg` : undefined;
  return { id: `book-${key}`, title, sub: authors.join(", ") || undefined, meta: year ? String(year) : undefined, url: `https://openlibrary.org${key}`, image: safeImageUrl(cover) };
}

export function normalizeTrack(raw: unknown): LibEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const title = cut(r.title_short) || cut(r.title);
  const url = safeHttpUrl(r.link);
  const artist = cut(((r.artist ?? {}) as Record<string, unknown>).name, 80);
  if (typeof r.id !== "number" || !title || !url) return null;
  return { id: `track-${r.id}`, title, sub: artist || undefined, url, image: safeImageUrl(((r.album ?? {}) as Record<string, unknown>).cover_small) };
}
