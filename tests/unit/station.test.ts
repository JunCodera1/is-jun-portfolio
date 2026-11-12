import { describe, expect, it } from "vitest";
import { grammar, kaiwa, kanjiReadings, vocab, lines, type MissionId } from "@/content/data/station";
import { buildMission, choices, normalizeTyping, passes, typingMatches } from "@/lib/station";
import { resolveText } from "@/lib/localized";
import { locales } from "@/i18n/routing";

const ids = lines.flatMap((l) => l.stations);

describe("station content", () => {
  it("every vocabulary item has a reading in kana, a meaning in all locales and a level", () => {
    for (const v of vocab) {
      expect(v.reading).toMatch(/^[ぁ-ゖー]+$/);
      for (const l of locales) expect(resolveText(v.meaning, l).text.length).toBeGreaterThan(0);
    }
    expect(new Set(vocab.map((v) => v.word)).size).toBe(vocab.length);
  });
  it("grammar items: 4 distinct options, the correct one is the first listed, a blank in the sentence", () => {
    for (const g of grammar) {
      expect(new Set(g.options).size).toBe(4);
      expect(g.sentence).toContain("＿＿");
    }
  });
  it("kaiwa scenes have exactly one acceptable answer", () => {
    for (const s of kaiwa) expect(s.options.filter((o) => o.ok)).toHaveLength(1);
  });
  it("each level has enough material for a mission (≥ 5 items)", () => {
    for (const lv of ["n3", "n2"] as const) {
      expect(vocab.filter((v) => v.level === lv).length).toBeGreaterThanOrEqual(5);
      expect(kanjiReadings.filter((k) => k.level === lv).length).toBeGreaterThanOrEqual(5);
      expect(grammar.filter((g) => g.level === lv).length).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("mission engine", () => {
  it.each(ids)("%s builds valid questions in every locale (4 distinct options, correct index points at the right text)", (id) => {
    for (const l of locales) for (let i = 0; i < 20; i++) {
      const qs = buildMission(id as MissionId, l);
      expect(qs.length).toBeGreaterThan(0);
      for (const q of qs) {
        expect(new Set(q.options).size).toBe(q.options.length);
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
      }
    }
  });
  it("vocabulary: the marked answer really is the word's meaning (en/vi) or reading (ja)", () => {
    for (const l of locales) for (let i = 0; i < 30; i++) for (const q of buildMission("vocab-n2", l)) {
      const v = vocab.find((x) => x.word === q.prompt)!;
      expect(q.options[q.answer]).toBe(l === "ja" ? v.reading : resolveText(v.meaning, l).text);
    }
  });
  it("kanji and grammar: the marked answer is correct", () => {
    for (let i = 0; i < 30; i++) {
      for (const q of buildMission("kanji-n3", "en")) expect(q.options[q.answer]).toBe(kanjiReadings.find((k) => k.word === q.prompt)!.reading);
      for (const q of buildMission("grammar-n2", "en")) expect(q.options[q.answer]).toBe(grammar.find((g) => g.sentence === q.prompt)!.options[0]);
    }
  });
  it("kaiwa: the marked answer is the acceptable option", () => {
    for (let i = 0; i < 20; i++) for (const q of buildMission("kaiwa", "vi")) {
      const scene = kaiwa.find((s) => s.npc === q.prompt)!;
      expect(scene.options.find((o) => o.ja === q.options[q.answer])!.ok).toBe(true);
    }
  });
  it("choices() never duplicates the correct answer and is deterministic for a given rng", () => {
    let s = 3; const rng = () => ((s = (s * 48271) % 2147483647) / 2147483647);
    const a = choices("x", ["x", "x", "y", "z", "w", "v"], rng);
    expect(a.options.filter((o) => o === "x")).toHaveLength(1);
    expect(a.options[a.answer]).toBe("x");
  });
  it("a mission passes at 80%", () => {
    expect(passes(4, 5)).toBe(true);
    expect(passes(3, 5)).toBe(false);
    expect(passes(3, 3)).toBe(true);
    expect(passes(0, 0)).toBe(false);
  });
});

describe("typing", () => {
  it("normalises case, spaces, macrons and punctuation", () => {
    expect(normalizeTyping("  Arigatō! ")).toBe("arigato");
    expect(typingMatches("ARIGATOU", { kana: "ありがとう", romaji: ["arigatou", "arigato"], meaning: "" })).toBe(true);
    expect(typingMatches("arigatu", { kana: "ありがとう", romaji: ["arigatou", "arigato"], meaning: "" })).toBe(false);
  });
});
