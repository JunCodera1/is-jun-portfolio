import { dayNumber } from "@/lib/daily";

/**
 * Spaced repetition, Leitner style: 5 boxes. A correct answer moves a card up one box (longer wait), a miss sends it back to box 1.
 * Pure functions only — storage lives in world-store.ts, so all of this is unit-tested without a browser.
 */
export type Box = 1 | 2 | 3 | 4 | 5;
export interface CardState { box: Box; due: number; seen: number }
export type Deck = Record<string, CardState>;

/** Days to wait after answering from each box (index = box). */
export const INTERVALS: Record<Box, number> = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };

export const today = (d = new Date()) => dayNumber(d);

export function review(prev: CardState | undefined, correct: boolean, day: number): CardState {
  const from = prev?.box ?? 1;
  const box = (correct ? Math.min(5, from + 1) : 1) as Box;
  return { box, due: day + INTERVALS[box], seen: (prev?.seen ?? 0) + 1 };
}

/** A session: cards that are due first (oldest due first), then new ones, up to `limit`. Cards not yet due are skipped. */
export function buildSession(ids: readonly string[], deck: Deck, day: number, limit = 10): string[] {
  const due = ids.filter((id) => deck[id] && deck[id]!.due <= day).sort((a, b) => deck[a]!.due - deck[b]!.due);
  const fresh = ids.filter((id) => !deck[id]);
  return [...due, ...fresh].slice(0, limit);
}

export function counts(ids: readonly string[], deck: Deck, day: number) {
  let fresh = 0, due = 0, learned = 0;
  for (const id of ids) {
    const c = deck[id];
    if (!c) fresh++;
    else if (c.due <= day) due++;
    if (c && c.box >= 4) learned++;
  }
  return { fresh, due, learned, total: ids.length };
}

/** Consecutive study days ending today (or yesterday, so the streak is not lost before you study today), and the best run. */
export function streak(days: readonly number[], day: number): { current: number; best: number } {
  const set = new Set(days);
  let current = 0;
  let d = set.has(day) ? day : day - 1;
  while (set.has(d)) { current++; d--; }
  let best = 0, run = 0, prev = Number.NEGATIVE_INFINITY;
  for (const x of [...set].sort((a, b) => a - b)) { run = x === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = x; }
  return { current, best };
}

/** A weeks × 7 grid ending today: true where a study day exists. Column = week (oldest first), row = day within the week. */
export function heatmap(days: readonly number[], day: number, weeks = 12): boolean[][] {
  const set = new Set(days);
  const start = day - weeks * 7 + 1;
  return Array.from({ length: weeks }, (_, w) => Array.from({ length: 7 }, (_, r) => set.has(start + w * 7 + r)));
}
