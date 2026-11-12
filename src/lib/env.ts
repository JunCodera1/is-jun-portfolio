import "server-only";
import { z } from "zod";

/** Treat empty strings (e.g. `GITHUB_TOKEN=` in .env) as "not set". */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), schema.optional());

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: optional(z.url()),
  VERCEL_PROJECT_PRODUCTION_URL: optional(z.string().min(1)),
  GITHUB_TOKEN: optional(z.string().min(1)),
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
