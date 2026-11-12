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

Numbers must come from the final build. They are filled in by the delivery step; any figure not listed here has not been measured.
