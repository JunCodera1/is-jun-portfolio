# Testing strategy

| Layer | Tool | What it proves |
|---|---|---|
| Static | `tsc --noEmit`, ESLint (`eslint-config-next`, React-hooks rules) | types, React correctness |
| Unit | Vitest (`tests/unit`) | message parity + ICU placeholders; **WCAG contrast parsed from the real CSS**; translation states; search normalisation (diacritics, Japanese); terminal can never run a command; MDX/TOC/reading time; content integrity and evidence rules; GitHub feed failure paths (403/429/500/network/bad JSON); env validation; SEO metadata; documentation exists |
| End-to-end | Playwright on the **production** server, system Chromium (`tests/e2e`) | every route × 3 locales (lang, title, canonical, hreflang, no console errors); redirect matrix; switcher keeps the page; fallback/draft banners; theme persistence and no-flash; palette/terminal/filters/search; dead-link crawl; security headers; sitemap/RSS/OG image; **no horizontal overflow at 375/430/768/1366/1920 on every page and locale**; **axe WCAG 2 A/AA on every page in both themes and all locales**, plus open dialogs; keyboard, focus and reduced-motion |
| Performance/SEO | Lighthouse 13 against `next start` | see below |
| Generated docs | `npm run docs:traceability`, `i18n:status`, `content:check` | integrity rules (no TESTED/VERIFIED with open gaps) |

Run: `npm run check` (static + unit + content + i18n) then `npm run build && npm run test:e2e`.

Not covered: manual screen-reader testing, real-device touch testing, cross-browser (Chromium only), load/penetration testing.

## Lighthouse

Measured with Lighthouse 13.6 against the **final production build** (`next start`, headless Chromium, mobile preset unless the name says desktop; `NEXT_PUBLIC_SITE_URL` set to the served origin so the canonical check is meaningful). Raw JSON is not committed; rerun with the commands in README. Any page not listed here has not been measured.

| Page / preset | Perf | A11y | Best practices | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---|---|---|
| arcade-en | 100 | 100 | 100 | 100 | 0.9 s | 0 | 40 ms |
| city-en-desktop | 100 | 100 | 100 | 100 | 0.2 s | 0 | 0 ms |
| city-en | 99 | 100 | 100 | 100 | 0.9 s | 0 | 110 ms |
| classic-en | 100 | 100 | 100 | 100 | 0.9 s | 0.001 | 60 ms |
| entrance-en-desktop | 100 | 100 | 100 | 100 | 0.2 s | 0 | 0 ms |
| entrance-en | 100 | 100 | 100 | 100 | 0.9 s | 0 | 50 ms |
| entrance-ja | 100 | 100 | 100 | 100 | 0.9 s | 0 | 50 ms |
| entrance-vi | 99 | 100 | 100 | 100 | 0.9 s | 0 | 100 ms |
| hideout-ja | 100 | 100 | 100 | 100 | 0.9 s | 0 | 70 ms |
| lab-vi | 100 | 100 | 100 | 100 | 0.9 s | 0 | 90 ms |
| station-en | 100 | 100 | 100 | 100 | 0.9 s | 0 | 50 ms |

Notes: the targets in the brief were Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95, LCP < 2.5 s, CLS < 0.1. Two real layout-shift problems were found and fixed along the way (Vietnamese garden CLS 0.157 → 0 with metric-matched font fallbacks; mobile entrance CLS 0.186 → 0 by preloading the display font). Scores come from a local server on a fast machine and will differ on real networks.
