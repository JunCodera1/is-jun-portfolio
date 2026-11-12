import { env } from "@/lib/env";

/**
 * Canonical origin of the site (no trailing slash).
 * Order: NEXT_PUBLIC_SITE_URL → Vercel production domain → localhost (dev/test only).
 */
export function siteUrl(): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export const SITE_NAME = "My Digital World";
