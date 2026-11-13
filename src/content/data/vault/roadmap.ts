import { L } from "./types";
import type { LocalizedText } from "@/lib/localized";

/**
 * Learning Roadmap: tracks with milestones. Status is what the owner has stated; dates only when given.
 * Add a track: { id, title, steps: [{ id, status: "planned", title: L("…") }] }.
 */
export interface Step { id: string; status: "done" | "doing" | "planned"; title: LocalizedText; date?: string; note?: LocalizedText }
export interface Track { id: string; title: LocalizedText; steps: Step[] }

export const roadmap: Track[] = [
  {
    id: "jlpt",
    title: L("JLPT", "JLPT", "JLPT"),
    steps: [
      { id: "n3", status: "done", title: L("Pass N3", "N3 に合格", "Đỗ N3"), note: L("Stated by the owner; no date given.", "持ち主の申告。日付は未提供。", "Do chủ trang cho biết; chưa có ngày.") },
      { id: "n2", status: "doing", title: L("Pass N2", "N2 に合格", "Đỗ N2"), note: L("The current goal.", "現在の目標。", "Mục tiêu hiện tại.") },
      { id: "n1", status: "planned", title: L("Reach N1", "N1 に到達", "Đạt N1"), note: L("A long-term goal.", "長期的な目標。", "Mục tiêu dài hạn.") },
    ],
  },
];
