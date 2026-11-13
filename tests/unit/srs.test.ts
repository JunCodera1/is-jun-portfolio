import { describe, expect, it } from "vitest";
import { buildSession, counts, heatmap, INTERVALS, review, streak, type Deck } from "@/lib/srs";

describe("review (Leitner boxes)", () => {
  it("a new card answered right goes to box 2 and waits that box's interval", () => {
    expect(review(undefined, true, 100)).toEqual({ box: 2, due: 100 + INTERVALS[2], seen: 1 });
  });
  it("a miss always sends the card back to box 1, due tomorrow", () => {
    expect(review({ box: 4, due: 90, seen: 5 }, false, 100)).toEqual({ box: 1, due: 101, seen: 6 });
  });
  it("box never exceeds 5", () => {
    expect(review({ box: 5, due: 0, seen: 9 }, true, 10).box).toBe(5);
  });
});

describe("buildSession", () => {
  const deck: Deck = { a: { box: 2, due: 95, seen: 1 }, b: { box: 3, due: 120, seen: 2 }, c: { box: 1, due: 100, seen: 1 } };
  it("puts due cards first (oldest due first), then new ones, and skips cards not yet due", () => {
    expect(buildSession(["a", "b", "c", "x", "y"], deck, 100)).toEqual(["a", "c", "x", "y"]);
  });
  it("respects the limit", () => {
    expect(buildSession(["a", "c", "x", "y"], deck, 100, 2)).toEqual(["a", "c"]);
  });
  it("counts fresh, due and learned", () => {
    expect(counts(["a", "b", "c", "x"], { ...deck, b: { box: 5, due: 200, seen: 3 } }, 100)).toEqual({ fresh: 1, due: 2, learned: 1, total: 4 });
  });
});

describe("streak and heatmap", () => {
  it("counts consecutive days ending today; yesterday still keeps it alive", () => {
    expect(streak([8, 9, 10], 10)).toEqual({ current: 3, best: 3 });
    expect(streak([8, 9], 10)).toEqual({ current: 2, best: 2 });
    expect(streak([5, 6, 7], 10)).toEqual({ current: 0, best: 3 });
    expect(streak([], 10)).toEqual({ current: 0, best: 0 });
  });
  it("heatmap is weeks × 7 and marks the right cells", () => {
    const g = heatmap([100], 100, 12);
    expect(g).toHaveLength(12);
    expect(g.every((w) => w.length === 7)).toBe(true);
    expect(g[11]![6]).toBe(true);
    expect(g.flat().filter(Boolean)).toHaveLength(1);
  });
});
