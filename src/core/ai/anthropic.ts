import "server-only";
import { defineIntegration, runIntegration, type Deps } from "@/core/integrations/sdk";
import { ModelUnavailable, type GenerateRequest, type GenerateResult, type LanguageModel } from "./provider";

type Args = GenerateRequest & { model: string };

/**
 * Anthropic Messages API as an ordinary integration: host allow-list, rate limit, retries, key from server env only, redaction.
 * It has no health probe on purpose (a probe would spend money); its health appears only after real use.
 * NOTE: the request/response shape is covered by contract tests against a stub; it has not been exercised against the live API.
 */
export const anthropicIntegration = defineIntegration<Args, GenerateResult>({
  id: "ai.anthropic", name: "Anthropic API", kind: "knowledge",
  auth: { type: "apiKey", env: "ANTHROPIC_API_KEY", header: "manual" }, scopes: ["messages:create"],
  allowedHosts: ["api.anthropic.com"], rateLimit: { max: 20, perMs: 60_000 }, ttlMs: 0,
  attribution: { label: "Anthropic API", url: "https://docs.anthropic.com/" }, privacy: "public-data",
  async fetch(ctx, a) {
    const raw = (await ctx.getJson("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": ctx.credential!, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: a.model, max_tokens: a.maxTokens, temperature: 0, system: a.system, messages: [{ role: "user", content: a.user }] }),
    })) as { content?: { type?: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number } };
    const text = (raw.content ?? []).filter((b) => b.type === "text" && typeof b.text === "string").map((b) => b.text).join("");
    if (!text) throw new Error("empty model response");
    return { text, usage: { inputTokens: Number(raw.usage?.input_tokens) || 0, outputTokens: Number(raw.usage?.output_tokens) || 0 } };
  },
});

export function createAnthropicModel(env: Record<string, string | undefined>, deps: Partial<Deps> = {}): LanguageModel | null {
  if (!env.ANTHROPIC_API_KEY) return null;
  const model = env.AI_MODEL || "claude-haiku-5-5";
  return {
    id: `anthropic:${model}`,
    async generate(req) {
      const r = await runIntegration(anthropicIntegration, { ...req, model }, { env, maxAttempts: 2, timeoutMs: 20_000, ...deps });
      if (!r.data) throw new ModelUnavailable(r.health.error ?? r.health.status);
      return r.data;
    },
  };
}
