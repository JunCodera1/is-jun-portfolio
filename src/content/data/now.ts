import type { LocalizedText } from "@/lib/localized";

export interface NowSection {
  id: "learning" | "building" | "reading" | "interested" | "goals";
  items: LocalizedText[];
}

/** ISO date the owner last reviewed this page (row 19: "có ngày cập nhật"). */
export const nowUpdated = "2026-11-13";

/** Empty on purpose: nothing may be invented. The owner adds items here; an empty section shows a labelled slot. */
export const nowSections: NowSection[] = [
  { id: "learning", items: [] },
  { id: "building", items: [] },
  { id: "reading", items: [] },
  { id: "interested", items: [] },
  { id: "goals", items: [] },
];
