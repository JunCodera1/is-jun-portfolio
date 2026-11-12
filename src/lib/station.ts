import { grammar, kaiwa, kanjiReadings, vocab, type MissionId } from "@/content/data/station";
import { resolveText } from "@/lib/localized";
import { shuffle, type Rng } from "@/lib/kana-games";
import type { Locale } from "@/i18n/routing";

export interface MissionQuestion {
  prompt: string;
  /** language of the prompt text (for the lang attribute) */
  promptLang: "ja" | Locale;
  /** small line above the prompt (e.g. the clerk's meaning) */
  context?: string;
  options: string[];
  answer: number;
  explain?: string;
}

export const QUESTIONS_PER_MISSION = 5;

/** Build distinct options: the correct one + 3 distinct distractors from `pool`, shuffled. Pure and deterministic for a given rng. */
export function choices(correct: string, pool: readonly string[], rng: Rng, n = 4): { options: string[]; answer: number } {
  const distractors = shuffle([...new Set(pool)].filter((p) => p !== correct), rng).slice(0, n - 1);
  const options = shuffle([correct, ...distractors], rng);
  return { options, answer: options.indexOf(correct) };
}

/** Questions for one mission. Vocabulary shows meanings in en/vi and readings in ja (so the Japanese UI stays monolingual). */
export function buildMission(id: MissionId, locale: Locale, rng: Rng = Math.random): MissionQuestion[] {
  const level = id.endsWith("n2") ? "n2" : "n3";
  if (id.startsWith("vocab")) {
    const pool = vocab.filter((v) => v.level === level);
    const all = vocab;
    return shuffle(pool, rng).slice(0, QUESTIONS_PER_MISSION).map((v) => {
      const correct = locale === "ja" ? v.reading : resolveText(v.meaning, locale).text;
      const distract = all.map((x) => (locale === "ja" ? x.reading : resolveText(x.meaning, locale).text));
      const c = choices(correct, distract, rng);
      return { prompt: v.word, promptLang: "ja", ...c };
    });
  }
  if (id.startsWith("kanji")) {
    const pool = kanjiReadings.filter((k) => k.level === level);
    return shuffle(pool, rng).slice(0, QUESTIONS_PER_MISSION).map((k) => ({ prompt: k.word, promptLang: "ja", ...choices(k.reading, kanjiReadings.map((x) => x.reading), rng) }));
  }
  if (id.startsWith("grammar")) {
    return shuffle(grammar.filter((g) => g.level === level), rng).slice(0, QUESTIONS_PER_MISSION).map((g) => {
      const correct = g.options[g.answer]!;
      const c = choices(correct, g.options, rng);
      return { prompt: g.sentence, promptLang: "ja", ...c, explain: resolveText(g.note, locale).text };
    });
  }
  // kaiwa: every scene, in order
  return kaiwa.map((s) => {
    const options = shuffle(s.options, rng);
    return { prompt: s.npc, promptLang: "ja", context: resolveText(s.npcMeaning, locale).text, options: options.map((o) => o.ja), answer: options.findIndex((o) => o.ok), explain: resolveText(s.explain, locale).text };
  });
}

/** A mission is "stamped" when at least 80% is right. */
export const passes = (score: number, total: number) => total > 0 && score / total >= 0.8;

/* ── Typing sprint helpers ── */
export interface TypingWord { kana: string; romaji: string[]; meaning: string }
export function normalizeTyping(input: string): string {
  return input.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
}
export const typingMatches = (input: string, word: TypingWord) => word.romaji.some((r) => normalizeTyping(r) === normalizeTyping(input));
