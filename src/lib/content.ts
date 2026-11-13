import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import type { Visibility } from "@/lib/knowledge/types";
import type { TranslationStatus } from "@/lib/localized";
import { readingMinutes, extractToc, type TocItem } from "@/lib/text";

export type Collection = "garden" | "journal";
const ROOT = path.join(process.cwd(), "content");

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD");
export const frontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  date: isoDate,
  updated: isoDate.optional(),
  tags: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
  category: z.string().optional(),
  /** Digital-garden maturity (row 16 "trạng thái"). */
  maturity: z.enum(["seedling", "budding", "evergreen"]).optional(),
  related: z.array(z.string()).default([]),
  /** public = listed everywhere; unlisted = reachable by URL only; private = not built at all. */
  visibility: z.enum(["public", "unlisted", "private"]).default("public"),
  /** Review state of THIS locale file. English source files are always "translated". */
  translation: z.enum(["translated", "draft"]).default("translated"),
});
export type Frontmatter = z.infer<typeof frontmatterSchema>;

export interface ContentEntry {
  collection: Collection;
  id: string;
  /** Locale the visitor asked for. */
  locale: Locale;
  /** Locale of the text actually returned (differs on fallback). */
  lang: Locale;
  status: TranslationStatus;
  title: string;
  summary: string;
  date: string;
  updated?: string;
  tags: string[];
  category?: string;
  maturity?: Frontmatter["maturity"];
  related: string[];
  visibility: Visibility;
  body: string;
  readingMinutes: number;
  toc: TocItem[];
  /** Locales that have a file for this id. */
  available: Locale[];
}

const dirOf = (collection: Collection, id: string) => path.join(ROOT, collection, id);
const fileOf = (collection: Collection, id: string, locale: Locale) => path.join(dirOf(collection, id), `${locale}.mdx`);

export function listIds(collection: Collection): string[] {
  const dir = path.join(ROOT, collection);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
}

function parseFile(file: string): { data: Frontmatter; body: string } {
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  // YAML parses a bare 2026-11-13 into a Date (UTC midnight); keep the calendar day as a plain string.
  for (const key of ["date", "updated"] as const) {
    if (data[key] instanceof Date) data[key] = (data[key] as Date).toISOString().slice(0, 10);
  }
  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid frontmatter in ${path.relative(process.cwd(), file)}:\n${z.prettifyError(parsed.error)}`);
  }
  return { data: parsed.data, body: content.trim() };
}

export function getEntry(collection: Collection, id: string, locale: Locale): ContentEntry | null {
  const source = fileOf(collection, id, defaultLocale);
  if (!fs.existsSync(source)) return null;
  const available = locales.filter((l) => fs.existsSync(fileOf(collection, id, l)));
  const base = parseFile(source);
  if (base.data.visibility === "private") return null; // private entries are not built, linked or fetchable

  const hasLocale = available.includes(locale);
  const chosen = hasLocale ? parseFile(fileOf(collection, id, locale)) : base;
  const lang: Locale = hasLocale ? locale : defaultLocale;
  const status: TranslationStatus = !hasLocale ? "untranslated" : locale === defaultLocale ? "translated" : chosen.data.translation;

  return {
    collection,
    id,
    locale,
    lang,
    status,
    title: chosen.data.title,
    summary: chosen.data.summary,
    // Shared metadata always comes from the English source so dates/tags/relations never drift between locales.
    date: base.data.date,
    updated: base.data.updated,
    tags: base.data.tags,
    category: base.data.category,
    maturity: base.data.maturity,
    related: base.data.related,
    visibility: base.data.visibility,
    body: chosen.body,
    readingMinutes: readingMinutes(chosen.body, lang),
    toc: extractToc(chosen.body),
    available,
  };
}

export function getEntries(collection: Collection, locale: Locale): ContentEntry[] {
  return listIds(collection)
    .map((id) => getEntry(collection, id, locale))
    .filter((e): e is ContentEntry => e !== null && e.visibility === "public")
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function allTags(entries: ContentEntry[]): string[] {
  return [...new Set(entries.flatMap((e) => e.tags))].sort();
}

