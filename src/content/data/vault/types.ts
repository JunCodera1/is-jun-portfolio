import type { LocalizedText } from "@/lib/localized";

/**
 * The Knowledge Vault. Every module is a typed data file in this folder: edit it, rebuild, done.
 * English is the source. ja/vi are optional drafts: when one is missing the page shows the English text with a "not translated yet" banner.
 * Entries seeded here come from what really happened while building this site (decisions, mistakes, research) — nothing about the owner's life is invented.
 */
export const L = (en: string, ja?: string, vi?: string): LocalizedText => ({
  en,
  ...(ja ? { ja: { text: ja, status: "draft" as const } } : {}),
  ...(vi ? { vi: { text: vi, status: "draft" as const } } : {}),
});

import type { Visibility } from "@/lib/knowledge/types";
export type { Visibility };
/** Optional on every vault entry; omitted = public. "private" never leaves the data file, "unlisted" is reachable but not listed. */
export interface Visible { visibility?: Visibility }

export type VaultTopic = "web" | "ai" | "linux" | "japanese" | "tooling" | "design" | "general";
export const TOPICS: VaultTopic[] = ["web", "ai", "linux", "japanese", "tooling", "design", "general"];

export type ModuleId = "concepts" | "research" | "mistakes" | "decisions" | "ideas" | "glossary" | "reading" | "learning" | "roadmap";
export const MODULES: { id: ModuleId; href: string; glyph: string }[] = [
  { id: "concepts", href: "/vault/concepts", glyph: "理" },
  { id: "research", href: "/vault/research", glyph: "調" },
  { id: "mistakes", href: "/vault/mistakes", glyph: "失" },
  { id: "decisions", href: "/vault/decisions", glyph: "決" },
  { id: "ideas", href: "/vault/ideas", glyph: "案" },
  { id: "glossary", href: "/vault/glossary", glyph: "語" },
  { id: "reading", href: "/vault/reading", glyph: "読" },
  { id: "learning", href: "/vault/learning", glyph: "学" },
  { id: "roadmap", href: "/vault/roadmap", glyph: "道" },
];

export interface Source { label: string; url: string }
