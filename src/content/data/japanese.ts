import type { LocalizedText } from "@/lib/localized";

/** The owner's own Japanese journey. Level, dates, milestones and study log are PERSONAL FACTS: empty until the owner fills them. */
export interface JourneyEntry { id: string; /** ISO date; leave undefined when the owner has not given one. */ date?: string; title: LocalizedText; detail?: LocalizedText }
export interface StudyLogEntry { date: string; minutes?: number; note: LocalizedText }

export const japanese = {
  /** e.g. "N4" — only if the owner states it. */
  level: "N3" as string | undefined,
  /** ISO date the owner started learning. */
  startedOn: undefined as string | undefined,
  goal: {
    en: "Pass JLPT N2. N1 is a longer-term goal.",
    ja: { text: "JLPT N2 に合格すること。N1 は長期的な目標です。", status: "draft" },
    vi: { text: "Đỗ JLPT N2. N1 là mục tiêu dài hạn.", status: "draft" },
  } as LocalizedText | undefined,
  /** Milestones stated by the owner. Dates are shown only when given. */
  milestones: [
    { id: "n3", title: { en: "Passed JLPT N3", ja: { text: "JLPT N3 に合格", status: "draft" }, vi: { text: "Đỗ JLPT N3", status: "draft" } } },
  ] as JourneyEntry[],
  studyLog: [] as StudyLogEntry[],
};

/** General public references (not a statement about what the owner uses). URLs were checked to respond. */
export const references = [
  { id: "jisho", url: "https://jisho.org/" },
  { id: "nhk", url: "https://www3.nhk.or.jp/news/easy/" },
  { id: "taekim", url: "https://guidetojapanese.org/learn/" },
  { id: "jlpt", url: "https://www.jlpt.jp/e/" },
] as const;

/** Verified code-level connections to Japanese (from the repositories, not claims about the owner). */
export const codeLinks = [
  { id: "deepsea", href: "/projects/deepsea" },
  { id: "voiceai", href: "/projects/voiceai" },
] as const;
export const kanjiForkUrl = "https://github.com/JunCodera1/KanjiDictVN";
