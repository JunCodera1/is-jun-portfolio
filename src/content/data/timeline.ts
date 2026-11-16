import type { LocalizedText } from "@/lib/localized";

export interface TimelineEntry {
  id: string;
  /** ISO date (YYYY-MM-DD). Never guess one. */
  date: string;
  kind: "learning" | "project" | "experience" | "personal";
  title: LocalizedText;
  detail?: LocalizedText;
  url?: string;
}

/**
 * Milestones the OWNER confirms (row 21). Empty on purpose.
 * The page also shows entries derived from the verified GitHub snapshot; those are labelled "From GitHub".
 */
export const ownerTimeline: TimelineEntry[] = [
  { id: "jlpt-n3", date: "2026-08-27", kind: "learning", title: { en: "Passed JLPT N3", ja: { text: "JLPT N3 に合格", status: "draft" }, vi: { text: "Đỗ JLPT N3", status: "draft" } } },
];
