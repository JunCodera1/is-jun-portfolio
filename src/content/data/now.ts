import type { LocalizedText } from "@/lib/localized";

export interface NowSection {
  id: "learning" | "building" | "reading" | "interested" | "goals";
  items: LocalizedText[];
}

/**
 * ISO date the OWNER last updated this page. Unset until the owner writes an entry: a date nobody chose would be an invented fact.
 * (Row 19 of the original spec asks for a visible update date; it appears as soon as this is set.)
 */
export const nowUpdated: string | undefined = "2026-11-16";

/** Empty on purpose: nothing may be invented. The owner adds items here; an empty section shows a labelled slot. */
export const nowSections: NowSection[] = [
  { id: "learning", items: [
    { en: "Working toward JLPT N2", ja: { text: "JLPT N2 を目指して勉強中", status: "draft" }, vi: { text: "Đang ôn thi JLPT N2", status: "draft" } },
    { en: "AI-assisted development", ja: { text: "AI を活用した開発", status: "draft" }, vi: { text: "Phát triển phần mềm có hỗ trợ AI", status: "draft" } },
    { en: "Unreal Engine and 3D modeling", ja: { text: "Unreal Engine と 3D モデリング", status: "draft" }, vi: { text: "Unreal Engine và mô hình hóa 3D", status: "draft" } },
  ] },
  { id: "building", items: [] },
  { id: "reading", items: [] },
  { id: "interested", items: [
    { en: "Web development", ja: { text: "Web 開発", status: "draft" }, vi: { text: "Phát triển web", status: "draft" } },
    { en: "Using technology to improve everyday workflows", ja: { text: "テクノロジーで日々のワークフローを改善すること", status: "draft" }, vi: { text: "Dùng công nghệ để cải thiện quy trình hằng ngày", status: "draft" } },
  ] },
  { id: "goals", items: [] },
];
