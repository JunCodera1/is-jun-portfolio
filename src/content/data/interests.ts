import type { LocalizedText } from "@/lib/localized";

export interface InterestCategory {
  id: "anime-manga" | "music" | "books" | "games" | "tools" | "other";
  /** Confirmed items only. */
  items: { title: LocalizedText; note?: LocalizedText; url?: string }[];
}

export const interests: InterestCategory[] = [
  {
    id: "anime-manga",
    items: [
      { title: { en: "Hunter × Hunter", ja: { text: "HUNTER×HUNTER", status: "draft" }, vi: { text: "Hunter × Hunter", status: "draft" } } },
      { title: { en: "Hisoka — favourite character", ja: { text: "ヒソカ — お気に入りのキャラクター", status: "draft" }, vi: { text: "Hisoka — nhân vật yêu thích", status: "draft" } } },
    ],
  },
  { id: "music", items: [] },
  { id: "books", items: [] },
  { id: "games", items: [] },
  { id: "tools", items: [] },
  { id: "other", items: [] },
];
