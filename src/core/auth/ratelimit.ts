/** Sliding-window rate limiter, in memory. Used for the assistant, login and owner actions. */
export function createLimiter(opts: { max: number; windowMs: number; now?: () => number }) {
  const hits = new Map<string, number[]>();
  const now = opts.now ?? (() => Date.now());
  return {
    check(key: string): { ok: boolean; retryAfterMs: number; remaining: number } {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((x) => t - x < opts.windowMs);
      if (recent.length >= opts.max) { hits.set(key, recent); return { ok: false, retryAfterMs: opts.windowMs - (t - recent[0]!), remaining: 0 }; }
      recent.push(t); hits.set(key, recent);
      if (hits.size > 5000) for (const [k, v] of hits) if (v.every((x) => t - x >= opts.windowMs)) hits.delete(k); // bound memory
      return { ok: true, retryAfterMs: 0, remaining: opts.max - recent.length };
    },
    reset() { hits.clear(); },
  };
}
