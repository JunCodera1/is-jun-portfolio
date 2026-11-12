# Deployment guide (Vercel + GitHub)

Nothing is deployed from this project automatically; deploying under your identity is your decision.

1. **Push** the repository to GitHub (already at `JunCodera1/is-jun-portfolio`).
2. **Import** it at vercel.com → *Add New → Project*. Framework preset: Next.js (auto). Build command `npm run build`, output default.
3. **Environment variables** (Project → Settings → Environment Variables):
   * `NEXT_PUBLIC_SITE_URL` = your final origin, e.g. `https://example.com` (no trailing slash). Required for correct canonical/hreflang/sitemap/OG URLs.
   * `GITHUB_TOKEN` = *optional*, a fine-grained token with no extra permissions (public read). Server-only.
4. **Domain**: add it in Vercel, then set `NEXT_PUBLIC_SITE_URL` to match and redeploy.
5. **Verify** after deploy: `/` redirects to a locale; `/sitemap.xml` lists three languages per page; `view-source` shows canonical + hreflang; run Lighthouse on `/en`, `/ja`, `/vi`.
6. **Content updates** are Git commits; Vercel rebuilds. GitHub-derived data refreshes hourly (ISR) without a rebuild.

Security headers (CSP etc.) are set in `next.config.ts`; see TECHNICAL_DECISIONS.md #4 before loosening them.
