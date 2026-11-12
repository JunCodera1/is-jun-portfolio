# Phase 0 — Discovery Report

Satisfies requirement rows 56–57 (`REQ-10-01`, `REQ-10-02`). Date: 2026-11-13.

## 1. What was inspected

| Item | Finding |
|---|---|
| Specification | `~/Downloads/my_digital_space_requirements.xlsx` read in full: sheet **Requirements** (64 rows, 11 groups) and sheet **Overview** (14 rows). A PDF export of the same sheet was also supplied and matches row for row. |
| Existing workspace | `~/projects/` holds `MidtermMultiplatform`, `miraigo-be`, `miraigo-x-p` (has uncommitted changes). **None of it was touched.** No prior digital-space project exists, so a new directory `~/my-digital-space/` was created. |
| Git state | `~/` is not a repository. `my-digital-space/` is a fresh project. |
| Toolchain | Node 26.12, npm 12.2, system Chromium at `/usr/bin/chromium` (used for Playwright/Lighthouse). |
| GitHub | `JunCodera1` (public API, unauthenticated): 87 public repos, 31 forks, 56 owned. READMEs, manifests, file trees and (where needed) source files were read. See `PROJECTS_REVIEW.md`. |
| Design references | **None supplied** (row 64 is an owner input). The design direction below comes from the spec's own palette/typography/anti-pattern rows. |

## 2. Identity (what can honestly be said today)

Only the GitHub URL was supplied by the owner. Everything else is *public but unconfirmed* and is tracked in `CONTENT_NEEDED.md`.

* **Handle:** `JunCodera1` (supplied).
* **Working display name:** "Jun" — derived from the GitHub handle and repo texts; flagged *unconfirmed*.
* **Languages:** the site is trilingual (en / ja / vi) by specification. Whether the owner is fluent in each is *unconfirmed* and is not claimed anywhere.
* **Observable engineering profile (verified from repos):** full-stack web (React/Next.js/Node), Android (Kotlin/Jetpack Compose), Spring Boot (Kotlin), Python ML/audio (SpeechBrain, TensorFlow), PostgreSQL (triggers/functions), a Firefox extension, networking coursework (Java/C++/Python). See `PROJECTS_REVIEW.md`.

## 3. Three homepage concepts

| | A. **Index** | B. **Logbook** | C. **Workbench** |
|---|---|---|---|
| Idea | The home page is a *table of contents* of the whole space: oversized name, a trilingual greeting stack, then a numbered index of rooms (About, Notes, Projects, Now…) each with live metadata (counts, last updated). | A reverse-chronological stream mixing Now updates, notes, journal posts and project milestones, like a lab notebook. | A spatial grid of widgets (clock, now, latest note, repo activity). |
| Strength | Personal-first by construction; navigation *is* content; scales as content grows; strongly typographic and unlike a template. | Feels alive; great once there is lots of content. | Showcases interactivity. |
| Weakness | Needs good microcopy to avoid feeling like a menu. | Nearly empty at launch (we must not invent entries) — looks abandoned. | Reads as a SaaS dashboard, which row 35 explicitly forbids. |
| **Verdict** | **Chosen.** Combines with B's "latest entries" strip, which fills itself from real content and degrades to a clean empty state. | Elements reused. | Rejected. |

**Visual identity — "Index":** hairline rules, numbered entries (`01 — About`), mono micro-labels, one accent (lime used as a *highlighter mark*, never as a glow), registration-mark crosshairs at grid junctions, and a trilingual greeting stack (`Hello / こんにちは / Xin chào`) where the active locale is emphasised. Palette and fonts follow the spec: `#0C0D10 / #15171C / #F2F3F5 / #B8F36B`, Space Grotesk + Inter + JetBrains Mono, with a Japanese system-font fallback stack.

## 4. Sitemap (all under `/{en|ja|vi}`)

```
/                       Home (Index)
/about                  About Me
/projects               Projects (filter by kind/tech)   /projects/[slug]  case study
/now                    Now (dated)
/contact                Contact (no form — no real submission handler exists)
/garden                 Digital Garden (MDX notes, tags, status)   /garden/[slug]
/journal                Journal (MDX, TOC, reading time)           /journal/[slug]
/interests              Interests (confirmed items only)
/timeline               Life Timeline (verified-only entries)
/profile                Technical profile (skills, education, experience — evidence-backed)
/search                 Global search          (+ Ctrl/Cmd+K palette on every page)
/terminal               Simulated terminal (pure client-side command table; no shell)
/library                Personal Library (optional; empty state until the owner supplies items)
```
Non-localised: `/sitemap.xml`, `/robots.txt`, `/{locale}/feed.xml` (journal RSS — supplementary, not a sheet row), `/` → locale redirect.

## 5. Feature priority (sheet is authoritative)

| Tier | Sheet level | Rows | Plan |
|---|---|---|---|
| P0 | Bắt buộc / Đề xuất chính | 37 | Build and verify first. |
| P1 | Nên có / Đề xuất | 12 | Build after the P0 slice is green. |
| P2 | Tùy chọn | 10 | Build only the cheap, honest ones (Recruiter Mode, Dashboard widgets without weather, GitHub API with fallback, Library with empty state). |
| P3 | Thử nghiệm | 1 | Deferred. |
| OWNER | Cần chủ website cung cấp | 4 | Blocked on owner input; documented in `CONTENT_NEEDED.md`. |

The master prompt lists a few features at a different tier than the sheet (library, GitHub integration, knowledge graph at P1; RSS, PWA, changelog, activity feed, gallery which are not sheet rows). **The sheet wins** (prompt §1 and row 61). Those extras are recorded as *supplementary* in `FEATURES.md`.

**Explicitly deferred (with reasons):** Guestbook (needs a persistent store + moderation → Supabase, not justified yet), Music integration (needs the owner's Spotify/Last.fm credentials), Code Playground (needs a real sandbox), 3D Workspace (no value yet; site must not depend on it), Knowledge graph / Skill graph with React Flow (only 1–2 seed notes exist; a graph of three nodes would be decoration; the data model already stores `related` links so it can be added later), PWA and Changelog (not sheet rows).

## 6. Architecture

* **Next.js 16 (App Router) + React 19 + TypeScript 5.9** (TS 7.x is npm's `latest` but is a native rewrite; Next 16 does not declare support, so 5.9 is pinned).
* **next-intl 4** — `[locale]` segment, `localePrefix: "always"`, static generation for all locales, `setRequestLocale`. A `proxy` only redirects `/` using cookie → `Accept-Language` → `en`.
* **Tailwind CSS 4** via CSS tokens; no shadcn/ui (the spec says not to depend on a component library when it hurts originality).
* **Motion** only where it communicates (reveal on enter, palette, theme control), all behind `prefers-reduced-motion`.
* **Content split (row 49/50):** typed data in `src/content/data/*.ts`; long form in `content/{garden,journal}/<id>/{en,ja,vi}.mdx`; UI strings in `messages/{en,ja,vi}.json`. Rendered with `next-mdx-remote/rsc` (server), `remark-gfm`, `rehype-slug`.
* **Translation status (row 10):** every UI key and content item resolves to `translated | draft | untranslated`; fallbacks are shown with a visible banner and a `lang` attribute. `npm run i18n:status` reports counts.
* **GitHub API (row 46):** server-side only, `revalidate: 3600`, optional `GITHUB_TOKEN` (server env), falls back to a committed verified snapshot on any error.
* **Security:** headers in `next.config.ts` (see `TECHNICAL_DECISIONS.md` for the CSP decision), zod-validated env, no secrets in client code, no user-generated content anywhere.
* **Testing:** Vitest (pure logic), Playwright on system Chromium (routes, switcher, theme, palette, terminal, search, overflow at 5 widths), axe-core, Lighthouse against `next start`.

## 7. Roadmap

Design foundation → core pages → content ecosystem → interactions → integrations → experimental → QA, per row 58. See `IMPLEMENTATION_ROADMAP.md` for the milestone checklist and `PROJECT_STATUS.md` for live state.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Sparse owner content makes a personal-first site look empty. | Designed empty states; verified GitHub-derived timeline and "recently active" feed; seed note about the site itself. |
| README claims ≠ code (found: speech README says Whisper Small, code loads `whisper-base`; backend README says PostgreSQL/Prisma, manifest also lists Mongoose; EduVision README lists Flask/Docker/AWS, repo is a PyQt desktop app). | Only manifest/tree/source-verified facts render; README-only claims are listed separately in `PROJECTS_REVIEW.md`. |
| Japanese/Vietnamese copy quality. | Authored natively (丁寧語), flagged `draft` where not owner-reviewed; the status mechanism makes that visible. |
| CSP vs. static rendering + inline theme script. | Documented relaxation (`'unsafe-inline'` for scripts) rather than forcing dynamic rendering; no UGC and no third-party scripts keep the exposure small. |
| TypeScript/ESLint major-version drift. | TS pinned to 5.9; ESLint 9 with `eslint-config-next`. |
| **Secrets committed in a public repo** (found during research: `DeepSea-RestAPI` has literal values for `security.key` and `spring.mail.password` in `application.properties`). | Not used or printed anywhere. Reported to the owner for rotation. |

## 9. Missing content

Tracked in `CONTENT_NEEDED.md`: display name/nickname, bio and story, confirmed interests, location, e-mail, social links (only GitHub confirmed), avatar and images, 3–5 design references, project role/problem/results/lessons, education and experience, privacy decisions.
