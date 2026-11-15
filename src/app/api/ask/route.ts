import { z } from "zod";
import { ask } from "@/core/ai/ask";
import { publicDocs, runtime } from "@/core/ai/runtime";
import { clientIp, sameOrigin } from "@/core/auth/origin";
import { locales } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const body = z.object({ question: z.string().trim().min(3).max(300), locale: z.enum(locales) });
const json = (data: unknown, status = 200, headers: Record<string, string> = {}) => Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });

/**
 * Ask the site a question. Public data only; no side effects other than counting usage. Validation, same-origin check, rate limits,
 * a daily model budget, and a generic error body (no stack traces, no provider details).
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) return json({ error: "unsupported_media_type" }, 415);
  const raw = await req.text();
  if (raw.length > 2048) return json({ error: "too_large" }, 413);
  const parsed = body.safeParse((() => { try { return JSON.parse(raw); } catch { return null; } })());
  if (!parsed.success) return json({ error: "invalid_request" }, 400);

  const ip = clientIp(req);
  const gate = runtime.requests.check(ip);
  if (!gate.ok) return json({ error: "rate_limited" }, 429, { "Retry-After": String(Math.ceil(gate.retryAfterMs / 1000)) });

  try {
    const admit = runtime.model ? runtime.budget.admit(ip) : { ok: false as const };
    const answer = await ask({
      question: parsed.data.question, docs: await publicDocs(parsed.data.locale), actor: { type: "visitor" },
      model: runtime.model, allowModel: admit.ok, maxOutputTokens: runtime.maxOutputTokens, onUsage: (u) => runtime.budget.record(u),
    });
    return json(answer);
  } catch {
    return json({ error: "internal_error" }, 500);
  }
}
