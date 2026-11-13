import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy (see TECHNICAL_DECISIONS.md → "CSP without nonces").
 *
 * Pages are statically generated, so a per-request nonce is impossible without
 * giving up static rendering. Scripts therefore allow 'unsafe-inline' (needed for
 * Next's bootstrap and the no-flash theme script); everything else is locked down:
 * no third-party origins, no framing, no plugins, same-origin forms only.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://s4.anilist.co https://covers.openlibrary.org https://archive.org https://*.archive.org https://cdn-images.dzcdn.net",
  "font-src 'self'",
  "media-src 'self' https://*.dzcdn.net",
  "frame-src https://www.youtube-nocookie.com https://w.soundcloud.com https://open.spotify.com",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // hide the floating Next.js dev badge ("N · 1 Issue"); errors still show in the terminal and browser console
  devIndicators: false,
  // Pages that were merged into others keep working: same content, new home (see docs/REDEFINITION.md, section I)
  async redirects() {
    const moved: [string, string][] = [["play", "arcade"], ["recruiter", "profile"], ["terminal", "classic"], ["links", "vault/reading"], ["log", "timeline"], ["orbit", "graph"]];
    return moved.flatMap(([from, to]) => [
      { source: `/:locale(en|ja|vi)/${from}`, destination: `/:locale/${to}`, permanent: true },
      { source: `/${from}`, destination: `/${to}`, permanent: true },
    ]);
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
