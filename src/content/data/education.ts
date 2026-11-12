import type { LocalizedText } from "@/lib/localized";

export interface CareerEntry {
  id: string;
  kind: "education" | "experience" | "training" | "activity";
  title: LocalizedText;
  org?: string;
  /** ISO dates. Never guess these. */
  start?: string;
  end?: string | "present";
}

/** Empty until the owner supplies verified entries (row 22 asks for "có căn cứ" content). */
export const careerEntries: CareerEntry[] = [];
