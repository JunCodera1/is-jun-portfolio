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
