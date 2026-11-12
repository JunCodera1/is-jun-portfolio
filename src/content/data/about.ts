import type { LocalizedText } from "@/lib/localized";

export interface AboutSection {
  id: "story" | "background" | "journey" | "interests" | "values" | "goals";
  /** Owner-written text. Paragraphs are separated by a blank line. Undefined → placeholder slot. */
  body?: LocalizedText;
}

export const aboutSections: AboutSection[] = [
  { id: "story" },
  { id: "background" },
  { id: "journey" },
  { id: "interests" },
  { id: "values" },
  { id: "goals" },
];
