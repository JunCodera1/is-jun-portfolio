import "server-only";
import { env } from "@/lib/env";
import type { Locale } from "@/i18n/routing";
import { getKnowledge } from "@/lib/knowledge/build";
import { relatedHrefs } from "@/lib/knowledge/related";
import type { Doc } from "@/core/retrieval";
import { createLimiter } from "@/core/auth/ratelimit";
import { createAnthropicModel } from "./anthropic";
import { createBudget } from "./budget";
import type { LanguageModel } from "./provider";

/** Process-wide AI runtime, configured only from server environment. With no configuration the model is null and the assistant quotes the site. */
export const runtime = (() => {
  const model: LanguageModel | null = env.AI_PROVIDER === "anthropic" ? createAnthropicModel(process.env) : null;
  return {
    model,
    budget: createBudget({ dailyRequests: env.AI_DAILY_REQUESTS ?? 200, ratePerMin: env.AI_RATE_PER_MIN ?? 8 }),
    /** Protects CPU for every request, with or without a model. */
    requests: createLimiter({ max: 30, windowMs: 60_000 }),
    maxOutputTokens: env.AI_MAX_OUTPUT_TOKENS ?? 400,
  };
})();

const docCache = new Map<Locale, Doc[]>();
/** The public corpus for a locale (what a visitor may read), with relations attached. */
export async function publicDocs(locale: Locale): Promise<Doc[]> {
  const hit = docCache.get(locale);
  if (hit) return hit;
  const k = await getKnowledge(locale);
  const rel = relatedHrefs(k);
  const docs = k.items.filter((i) => !["topic", "tech", "log", "event"].includes(i.kind)).map<Doc>((i) => ({ ...i, related: rel.get(i.id) ?? [] }));
  docCache.set(locale, docs);
  return docs;
}
