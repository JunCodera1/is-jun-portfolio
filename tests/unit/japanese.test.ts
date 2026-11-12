import { describe, expect, it } from "vitest";
import { ALL_KANA, BASIC_KANA, BASIC_ROWS, VOICED_ROWS } from "@/content/data/kana";
import { isMatch, makeDeck, makeQuestion, shuffle } from "@/lib/kana-games";
import { normalizeHnItem, parseRssItems, safeHttpUrl } from "@/lib/news";

const seq = (...n: number[]) => { let i = 0; return () => n[i++ % n.length]!; };

describe("kana data", () => {
  it("has the standard 46 basic kana and 25 voiced/semi-voiced", () => {
    expect(BASIC_KANA).toHaveLength(46);
    expect(VOICED_ROWS.flatMap((r) => r.cells).filter(Boolean)).toHaveLength(25);
    expect(ALL_KANA).toHaveLength(71);
  });
  it("every row has 5 cells; hiragana/katakana glyphs are unique and in the right Unicode blocks", () => {
    for (const r of [...BASIC_ROWS, ...VOICED_ROWS]) expect(r.cells).toHaveLength(5);
    expect(new Set(ALL_KANA.map((k) => k.h)).size).toBe(71);
    expect(new Set(ALL_KANA.map((k) => k.k)).size).toBe(71);
    for (const k of ALL_KANA) {
      expect(k.h).toMatch(/^[ぁ-ゖ]$/);
      expect(k.k).toMatch(/^[ァ-ヺ]$/);
    }
  });
  it("uses Hepburn for the irregular rows", () => {
    const r = Object.fromEntries(ALL_KANA.map((k) => [k.h, k.r]));
    expect(r).toMatchObject({ し: "shi", ち: "chi", つ: "tsu", ふ: "fu", じ: "ji", を: "wo", ん: "n" });
  });
});

describe("kana quiz", () => {
  it("builds a question whose answer is correct, options are distinct and include the answer", () => {
    for (let i = 0; i < 200; i++) {
      const q = makeQuestion(ALL_KANA, "both");
      const truth = ALL_KANA.filter((k) => k.h === q.prompt || k.k === q.prompt).map((k) => k.r);
      expect(truth).toContain(q.answer);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options).toContain(q.answer);
      expect(q.options).toHaveLength(4);
    }
  });
  it("respects the chosen script", () => {
    for (let i = 0; i < 50; i++) {
      expect(makeQuestion(BASIC_KANA, "hiragana").prompt).toMatch(/^[ぁ-ゖ]$/);
      expect(makeQuestion(BASIC_KANA, "katakana").prompt).toMatch(/^[ァ-ヺ]$/);
    }
  });
  it("is deterministic for a given RNG and shuffle keeps all items", () => {
    expect(makeQuestion(BASIC_KANA, "hiragana", seq(0.1, 0.9, 0.3))).toEqual(makeQuestion(BASIC_KANA, "hiragana", seq(0.1, 0.9, 0.3)));
    expect(shuffle([1, 2, 3, 4, 5]).sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("memory match", () => {
  it("deals N pairs: each pair has one kana and one romaji card, ids unique, romaji unique", () => {
    const deck = makeDeck(ALL_KANA, "both", 6);
    expect(deck).toHaveLength(12);
    expect(new Set(deck.map((c) => c.id)).size).toBe(12);
    for (let p = 0; p < 6; p++) expect(deck.filter((c) => c.pair === p).map((c) => c.kind).sort()).toEqual(["kana", "romaji"]);
    expect(new Set(deck.filter((c) => c.kind === "romaji").map((c) => c.face)).size).toBe(6);
  });
  it("matches only a kana with its own romaji", () => {
    const deck = makeDeck(BASIC_KANA, "hiragana", 4);
    const a = deck.find((c) => c.kind === "kana")!;
    const b = deck.find((c) => c.pair === a.pair && c.kind === "romaji")!;
    const other = deck.find((c) => c.pair !== a.pair && c.kind === "romaji")!;
    expect(isMatch(a, b)).toBe(true);
    expect(isMatch(a, other)).toBe(false);
    expect(isMatch(a, a)).toBe(false);
  });
});

describe("news parsing treats third-party data as hostile", () => {
  it("only http(s) links are allowed", () => {
    expect(safeHttpUrl("https://example.com/x")).toBe("https://example.com/x");
    for (const bad of ["javascript:alert(1)", "data:text/html,<script>", "ftp://x", "//evil", "not a url", 5, null, undefined]) expect(safeHttpUrl(bad)).toBeNull();
  });
  it("normalises an HN story; Ask-HN style items link to the discussion; bad shapes are dropped", () => {
    const ok = normalizeHnItem({ id: 1, type: "story", title: "  Hello   world ", url: "https://x.test/a", score: 10, descendants: 3, time: 1700000000 });
    expect(ok).toMatchObject({ title: "Hello world", url: "https://x.test/a", points: 10, comments: 3, lang: "en" });
    expect(normalizeHnItem({ id: 2, type: "story", title: "Ask HN: x" })!.url).toBe("https://news.ycombinator.com/item?id=2");
    expect(normalizeHnItem({ id: 3, type: "story", title: "x", url: "javascript:alert(1)" })!.url).toBe("https://news.ycombinator.com/item?id=3");
    for (const bad of [null, "x", 5, { id: "1", type: "story", title: "t" }, { id: 1, type: "comment", title: "t" }, { id: 1, type: "story" }, { id: 1, type: "story", title: "t", dead: true }])
      expect(normalizeHnItem(bad)).toBeNull();
    expect(normalizeHnItem({ id: 1, type: "story", title: "x".repeat(1000) })!.title.length).toBeLessThanOrEqual(160);
    expect(normalizeHnItem({ id: 1, type: "story", title: "t", score: -5, descendants: Infinity })).toMatchObject({ points: undefined, comments: undefined });
  });
  it("extracts RSS items (CDATA, dates), skips items with unsafe or missing links", () => {
    const xml = `<rss><channel><item><title><![CDATA[日本語のタイトル]]></title><link>https://zenn.dev/a/b</link><pubDate>Thu, 12 Nov 2026 17:09:43 GMT</pubDate></item>
      <item><title>evil</title><link>javascript:alert(1)</link></item><item><title>no link</title></item>
      <item><title><![CDATA[<img src=x onerror=alert(1)>]]></title><link>https://ok.test/</link></item></channel></rss>`;
    const items = parseRssItems(xml);
    expect(items.map((i) => i.url)).toEqual(["https://zenn.dev/a/b", "https://ok.test/"]);
    expect(items[0]).toMatchObject({ title: "日本語のタイトル", lang: "ja", time: "2026-11-12T17:09:43.000Z" });
    expect(items[1]!.title).toBe("<img src=x onerror=alert(1)>"); // kept as TEXT; React escapes it on render
  });
  it("garbage in → empty out", () => {
    expect(parseRssItems("")).toEqual([]);
    expect(parseRssItems("<html>not rss</html>")).toEqual([]);
  });
});
