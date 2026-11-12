"use client";

import { useSyncExternalStore } from "react";

/** Personal best kept in localStorage, wrapped in try/catch (private mode, blocked storage). `better` decides what counts as an improvement. */
const subs = new Set<() => void>();
const read = (key: string): number | null => {
  try {
    const v = localStorage.getItem(key);
    const n = v === null ? NaN : Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
};

export function useBest(key: string, better: (a: number, b: number) => boolean) {
  const best = useSyncExternalStore(
    (cb) => { subs.add(cb); return () => subs.delete(cb); },
    () => read(key),
    () => null,
  );
  const submit = (value: number): boolean => {
    const prev = read(key);
    const improved = prev === null || better(value, prev);
    if (improved) {
      try { localStorage.setItem(key, String(value)); } catch { /* storage unavailable: the game still works */ }
      subs.forEach((f) => f());
    }
    return improved;
  };
  return { best, submit };
}
