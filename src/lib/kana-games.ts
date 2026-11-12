import type { KanaEntry, Script } from "@/content/data/kana";

/** Both games are pure functions over data with an injectable RNG, so they are fully unit-testable. */
export type Rng = () => number;

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const glyph = (k: KanaEntry, script: Script, rng: Rng): string =>
  script === "hiragana" ? k.h : script === "katakana" ? k.k : rng() < 0.5 ? k.h : k.k;

export interface Question { prompt: string; answer: string; options: string[] }

/** One multiple-choice question: a kana glyph → its romaji. Options are distinct romaji (ambiguous duplicates like じ/ぢ never both appear). */
export function makeQuestion(pool: readonly KanaEntry[], script: Script, rng: Rng = Math.random, optionCount = 4): Question {
  const target = pool[Math.floor(rng() * pool.length)]!;
  const distractors = shuffle([...new Set(pool.map((p) => p.r))].filter((r) => r !== target.r), rng).slice(0, optionCount - 1);
  return { prompt: glyph(target, script, rng), answer: target.r, options: shuffle([target.r, ...distractors], rng) };
}

export interface Card { id: number; pair: number; face: string; kind: "kana" | "romaji" }

/** Memory match: `pairs` kana glyph↔romaji pairs, shuffled. Pairs use distinct romaji so a match is unambiguous. */
export function makeDeck(pool: readonly KanaEntry[], script: Script, pairs = 6, rng: Rng = Math.random): Card[] {
  const seen = new Set<string>();
  const unique = shuffle(pool, rng).filter((k) => (seen.has(k.r) ? false : (seen.add(k.r), true))).slice(0, pairs);
  const cards = unique.flatMap((k, i): Omit<Card, "id">[] => [
    { pair: i, face: glyph(k, script, rng), kind: "kana" },
    { pair: i, face: k.r, kind: "romaji" },
  ]);
  return shuffle(cards, rng).map((c, id) => ({ ...c, id }));
}

export const isMatch = (a: Card, b: Card) => a.id !== b.id && a.pair === b.pair && a.kind !== b.kind;
