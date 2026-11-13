"use client";

/** Tiny localStorage-backed external stores (try/catch everywhere: private mode / blocked storage must never break the world). */
type Listener = () => void;

function makeStore<T>(key: string, parse: (raw: string | null) => T, serialize: (v: T) => string, empty: T) {
  const listeners = new Set<Listener>();
  let cacheRaw: string | null | undefined;
  let cacheVal: T = empty;
  const readRaw = () => { try { return localStorage.getItem(key); } catch { return null; } };
  return {
    subscribe(cb: Listener) { listeners.add(cb); return () => { listeners.delete(cb); }; },
    get(): T {
      const raw = readRaw();
      if (raw !== cacheRaw) { cacheRaw = raw; cacheVal = parse(raw); }
      return cacheVal;
    },
    server: (): T => empty,
    set(v: T) {
      try { localStorage.setItem(key, serialize(v)); } catch { /* unavailable: keep working in memory for this view */ }
      cacheRaw = undefined;
      listeners.forEach((l) => l());
    },
  };
}

const EMPTY: string[] = [];
export const progressStore = makeStore<string[]>(
  "world-progress-v1",
  (raw) => { try { const v = raw ? JSON.parse(raw) : []; return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : EMPTY; } catch { return EMPTY; } },
  (v) => JSON.stringify(v),
  EMPTY,
);
export const soundStore = makeStore<boolean>("world-sound", (raw) => raw === "1", (v) => (v ? "1" : "0"), false);

/** Station stamps: which missions were cleared with ≥ 80%. Learning progress, stored only in this browser. */
export const stampStore = makeStore<string[]>(
  "world-stamps-v1",
  (raw) => { try { const v = raw ? JSON.parse(raw) : []; return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : EMPTY; } catch { return EMPTY; } },
  (v) => JSON.stringify(v),
  EMPTY,
);

import type { Deck, CardState, Box } from "@/lib/srs";
import { today } from "@/lib/srs";

const EMPTY_DECK: Deck = {};
const parseDeck = (raw: string | null): Deck => {
  try {
    const v = raw ? JSON.parse(raw) : {};
    if (!v || typeof v !== "object" || Array.isArray(v)) return EMPTY_DECK;
    const out: Deck = {};
    for (const [k, c] of Object.entries(v as Record<string, unknown>)) {
      const r = c as Partial<CardState> | null;
      if (r && typeof r.box === "number" && r.box >= 1 && r.box <= 5 && Number.isFinite(r.due) && Number.isFinite(r.seen)) out[k] = { box: Math.round(r.box) as Box, due: r.due as number, seen: r.seen as number };
    }
    return out;
  } catch { return EMPTY_DECK; }
};
/** Flashcard progress (Leitner boxes). Stored only in this browser. */
export const deckStore = makeStore<Deck>("world-srs-v1", parseDeck, (v) => JSON.stringify(v), EMPTY_DECK);

const EMPTY_DAYS: number[] = [];
/** Days on which the visitor studied (day numbers). Stored only in this browser. */
export const studyDaysStore = makeStore<number[]>(
  "world-study-days-v1",
  (raw) => { try { const v = raw ? JSON.parse(raw) : []; return Array.isArray(v) ? v.filter((x): x is number => Number.isInteger(x)).slice(-400) : EMPTY_DAYS; } catch { return EMPTY_DAYS; } },
  (v) => JSON.stringify(v),
  EMPTY_DAYS,
);
export function markStudiedToday() {
  const d = today();
  const cur = studyDaysStore.get();
  if (!cur.includes(d)) studyDaysStore.set([...cur, d].slice(-400));
}
