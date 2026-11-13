import type { LocalizedText } from "@/lib/localized";

/**
 * The Log: short dated notes, newest first. Add a line whenever something happens — a thought, a thing learned, a small win.
 * Seeded only with what verifiably happened to this site; nothing about the owner's life is invented.
 */
const L = (en: string, ja: string, vi: string): LocalizedText => ({ en, ja: { text: ja, status: "draft" }, vi: { text: vi, status: "draft" } });

export interface LogEntry { visibility?: "public" | "unlisted" | "private"; id: string; date: string; tag: "site" | "japanese" | "code" | "life" | "anime"; text: LocalizedText }

export const log: LogEntry[] = [
  { id: "2026-11-13-news-library", date: "2026-11-13", tag: "site", text: L("Added a nine-source tech news blog and a Library for anime, books and music.", "9つの情報源のテックニュースと、アニメ・本・音楽のライブラリを追加しました。", "Thêm blog tin công nghệ chín nguồn và Thư viện anime, sách, nhạc.") },
  { id: "2026-11-13-world", date: "2026-11-13", tag: "site", text: L("The site became a world: a city, a hideout, a lab, a station, an arcade and an archive.", "サイトが「世界」になりました：街、アジト、ラボ、駅、ゲームセンター、アーカイブ。", "Trang web trở thành một thế giới: thành phố, hideout, lab, nhà ga, arcade và kho lưu trữ.") },
  { id: "2026-11-13-launch", date: "2026-11-13", tag: "site", text: L("First version of this space, in English, Japanese and Vietnamese.", "このスペースの最初のバージョン（英語・日本語・ベトナム語）。", "Phiên bản đầu tiên của không gian này, bằng tiếng Anh, Nhật và Việt.") },
];
