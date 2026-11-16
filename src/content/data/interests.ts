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
      { title: { en: "Neon Genesis Evangelion", ja: { text: "新世紀エヴァンゲリオン", status: "draft" }, vi: { text: "Neon Genesis Evangelion", status: "draft" } } },
      { title: { en: "Monster", ja: { text: "MONSTER", status: "draft" }, vi: { text: "Monster", status: "draft" } } },
      { title: { en: "Steins;Gate", ja: { text: "STEINS;GATE", status: "draft" }, vi: { text: "Steins;Gate", status: "draft" } } },
      { title: { en: "Studio Ghibli films", ja: { text: "スタジオジブリ作品", status: "draft" }, vi: { text: "Phim của Studio Ghibli", status: "draft" } } },
      { title: { en: "Hisoka — favourite character", ja: { text: "ヒソカ — お気に入りのキャラクター", status: "draft" }, vi: { text: "Hisoka — nhân vật yêu thích", status: "draft" } } },
    ],
  },
  { id: "music", items: [
    { title: { en: "Lamp" } },
    { title: { en: "Aoko Ichiba" } },
    { title: { en: "Anime soundtracks", ja: { text: "アニメの音楽", status: "draft" }, vi: { text: "Nhạc anime", status: "draft" } } },
  ] },
  { id: "books", items: [
    { title: { en: "Norwegian Wood", ja: { text: "ノルウェイの森", status: "draft" }, vi: { text: "Rừng Na Uy", status: "draft" } } },
    { title: { en: "The Count of Monte Cristo", ja: { text: "モンテ・クリスト伯", status: "draft" }, vi: { text: "Bá tước Monte Cristo", status: "draft" } } },
    { title: { en: "Sherlock Holmes", ja: { text: "シャーロック・ホームズ", status: "draft" }, vi: { text: "Sherlock Holmes", status: "draft" } } },
  ] },
  { id: "games", items: [] },
  { id: "tools", items: [
    { title: { en: "Customising and decorating my own computer", ja: { text: "自分のパソコンのカスタマイズと装飾", status: "draft" }, vi: { text: "Custom và trang trí máy tính của mình", status: "draft" } } },
  ] },
  { id: "other", items: [
    { title: { en: "Fight Club" }, note: { en: "Film" } },
    { title: { en: "The Shawshank Redemption" }, note: { en: "Film" } },
    { title: { en: "The Godfather" }, note: { en: "Film" } },
    { title: { en: "Forrest Gump" }, note: { en: "Film" } },
  ] },
];
