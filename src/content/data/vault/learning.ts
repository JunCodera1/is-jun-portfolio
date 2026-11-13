import { L } from "./types";
import type { LocalizedText } from "@/lib/localized";

/**
 * Learning Tracker: one entry per technology or skill being learned. Seeded only with what the owner has stated (Japanese, JLPT N3 passed, N2 next).
 * Add `log` lines as you study: { date: "2026-11-20", minutes: 40, note: L("…") }. Dates are never invented.
 */
export interface LearningTopic { id: string; status: "doing" | "paused" | "done"; title: LocalizedText; goal: LocalizedText; started?: string; log: { date: string; minutes?: number; note: LocalizedText }[]; links: { href: string; label: LocalizedText }[] }

export const learning: LearningTopic[] = [
  {
    id: "japanese", status: "doing",
    title: L("Japanese", "日本語", "Tiếng Nhật"),
    goal: L("Pass JLPT N2 (N3 is passed). N1 is a long-term goal.", "JLPT N2 に合格する（N3 は合格済み）。N1 は長期目標。", "Đỗ JLPT N2 (đã đỗ N3). N1 là mục tiêu dài hạn."),
    log: [],
    links: [
      { href: "/japanese/review", label: L("Review cards", "復習カード", "Thẻ ôn tập") },
      { href: "/station", label: L("Station missions", "駅のミッション", "Nhiệm vụ ở Nhà ga") },
      { href: "/japanese", label: L("Japanese hub", "日本語ハブ", "Trang tiếng Nhật") },
    ],
  },
];
