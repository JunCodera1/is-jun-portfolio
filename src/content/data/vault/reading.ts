import type { LocalizedText } from "@/lib/localized";

/**
 * Reading Progress: books, articles and documents. EMPTY until the owner adds what they actually read; nothing is invented.
 * Example entry:
 * { id: "sicp", kind: "book", title: "Structure and Interpretation of Computer Programs", author: "Abelson & Sussman", status: "reading", progress: { current: 120, total: 580, unit: "pages" }, url: "https://…", note: L("…") }
 */
export type ReadingKind = "book" | "article" | "doc" | "paper";
export interface ReadingItem {
  id: string; kind: ReadingKind; title: string; author?: string; status: "queued" | "reading" | "done";
  progress?: { current: number; total: number; unit: "pages" | "chapters" | "minutes" };
  url?: string; note?: LocalizedText; finished?: string;
}
export const reading: ReadingItem[] = [];
