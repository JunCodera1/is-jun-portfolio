import type { LocalizedText } from "@/lib/localized";

export interface InterestCategory {
  id: "anime-manga" | "music" | "books" | "games" | "tools" | "other";
  /** Confirmed items only. */
  items: { title: LocalizedText; note?: LocalizedText; url?: string }[];
}

export const interests: InterestCategory[] = [
  { id: "anime-manga", items: [] },
  { id: "music", items: [] },
  { id: "books", items: [] },
  { id: "games", items: [] },
  { id: "tools", items: [] },
  { id: "other", items: [] },
];
