import type { LocalizedText } from "@/lib/localized";

export interface NowSection {
  id: "learning" | "building" | "reading" | "interested" | "goals";
  items: LocalizedText[];
}

/**
 * ISO date the OWNER last updated this page. Unset until the owner writes an entry: a date nobody chose would be an invented fact.
 * (Row 19 of the original spec asks for a visible update date; it appears as soon as this is set.)
 */
export const nowUpdated: string | undefined = undefined;

/** Empty on purpose: nothing may be invented. The owner adds items here; an empty section shows a labelled slot. */
export const nowSections: NowSection[] = [
  { id: "learning", items: [] },
  { id: "building", items: [] },
  { id: "reading", items: [] },
  { id: "interested", items: [] },
  { id: "goals", items: [] },
];
