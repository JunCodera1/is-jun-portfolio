import { locales } from "@/i18n/routing";
import { profile, socialLinks } from "@/content/data/profile";
import { SITE_NAME, siteUrl } from "@/lib/site";
import { textOf } from "@/lib/localized";

export const dynamic = "force-static";

/**
 * Open profile: a small, stable, machine-readable description of the owner. It contains only what the site already shows,
 * and nothing the owner has not confirmed (`name` is null until the display name is confirmed; no e-mail unless one is published).
 * Switch it off with `publishProfileJson: false` in profile.ts.
 */
export function GET() {
  if (!profile.publishProfileJson) return new Response("Not found", { status: 404 });
  const base = siteUrl();
  const body = {
    version: 1,
    site: { name: SITE_NAME, url: base, languages: [...locales] },
    handle: profile.githubHandle,
    name: profile.displayNameConfirmed ? profile.displayName : null,
    email: profile.email ?? null,
    links: socialLinks.map((s) => ({ rel: "me", label: s.label, url: s.url })),
    facts: profile.facts.map((f) => Object.fromEntries(locales.map((l) => [l, textOf(f, l)]))),
    feeds: Object.fromEntries(locales.map((l) => [l, { json: `${base}/${l}/feed.json`, rss: `${base}/${l}/feed.xml` }])),
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
