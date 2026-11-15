import "server-only";
import { z } from "zod";

/** Treat empty strings (e.g. `GITHUB_TOKEN=` in .env) as "not set". */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), schema.optional());

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: optional(z.url()),
  VERCEL_PROJECT_PRODUCTION_URL: optional(z.string().min(1)),
  GITHUB_TOKEN: optional(z.string().min(1)),
  // AI (all optional: without them /ask answers by quoting the site itself)
  AI_PROVIDER: optional(z.enum(["none", "anthropic"])),
  ANTHROPIC_API_KEY: optional(z.string().min(1)),
  AI_MODEL: optional(z.string().min(1)),
  AI_DAILY_REQUESTS: optional(z.coerce.number().int().min(0).max(100000)),
  AI_MAX_OUTPUT_TOKENS: optional(z.coerce.number().int().min(16).max(4000)),
  AI_RATE_PER_MIN: optional(z.coerce.number().int().min(1).max(600)),
  // Owner console (all optional: without them /owner and agents are switched off)
  OWNER_PASSWORD_HASH: optional(z.string().min(20)),
  SESSION_SECRET: optional(z.string().min(32)),
  DATA_DIR: optional(z.string().min(1)),
  INTEGRATIONS_DISABLED: optional(z.string()),
});

export type Env = z.infer<typeof schema>;

/** Parsed once. A malformed value fails the build loudly instead of shipping a broken canonical URL. */
export const env: Env = (() => {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
})();
