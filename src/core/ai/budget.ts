import { createLimiter } from "@/core/auth/ratelimit";

/** Usage and cost control: a per-client rate limit, a daily request cap and a token tally. When it says no, the assistant degrades to quoting the site. */
export function createBudget(opts: { dailyRequests: number; ratePerMin: number; now?: () => number }) {
  const now = opts.now ?? (() => Date.now());
  const limiter = createLimiter({ max: opts.ratePerMin, windowMs: 60_000, now });
  let day = Math.floor(now() / 86_400_000), used = 0, inTok = 0, outTok = 0;
  const roll = () => { const d = Math.floor(now() / 86_400_000); if (d !== day) { day = d; used = 0; inTok = 0; outTok = 0; } };
  return {
    /** Ask permission to spend one model call. */
    admit(client: string): { ok: true } | { ok: false; reason: "rate" | "daily"; retryAfterMs: number } {
      roll();
      if (used >= opts.dailyRequests) return { ok: false, reason: "daily", retryAfterMs: 86_400_000 - (now() % 86_400_000) };
      const r = limiter.check(client);
      if (!r.ok) return { ok: false, reason: "rate", retryAfterMs: r.retryAfterMs };
      used++;
      return { ok: true };
    },
    record(usage: { inputTokens: number; outputTokens: number }) { roll(); inTok += usage.inputTokens; outTok += usage.outputTokens; },
    snapshot() { roll(); return { day, requests: used, inputTokens: inTok, outputTokens: outTok, dailyRequests: opts.dailyRequests }; },
  };
}
export type Budget = ReturnType<typeof createBudget>;
