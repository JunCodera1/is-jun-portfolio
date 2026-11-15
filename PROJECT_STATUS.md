# Progress note

**A Place Called Me** — an evolving personal digital ecosystem (Next.js 16, three languages), readable without any external service. The redefinition (audit, decisions, architecture, migration, requirements) is in [docs/REDEFINITION.md](docs/REDEFINITION.md).

## Shape
* **Wander** — Entrance, City and its five places, Backstage; the knowledge graph; the Discovery Engine.
* **Read** — About, Now, Interests, Garden, Journal, Projects, Profile, the Knowledge Vault, the unified Timeline.
* **Japanese** — hub, kana, grammar, review cards, Station missions, Arcade.
* **Outside** — tech news, library and playlists.
* **Connect** — JSON Feed, RSS, open profile JSON, the Observatory.

## Architecture in one paragraph
Identity Core (`content/data/profile.ts` and friends) → Integration Layer (`lib/*-feed.ts`, each with timeout, hostile-input parsing and graceful failure) → **Unified Data Layer** (`lib/knowledge`: `Item` + `Edge`, provenance, visibility) → Knowledge Graph and Intelligence (rule-based discovery, suggestions, translation coverage) → Experience Layer (world and classic pages, palette, terminal, feeds).

## Facts that came from the owner
IT student; software development, AI/ML, Linux; JLPT N3 passed, N2 in progress, N1 longer-term; Hunter × Hunter, Hisoka. No dates were given, so none are shown. The display name "Jun" is a working name: `profile.json` publishes `name: null` until it is confirmed.

## Open
Owner content (see CONTENT_NEEDED.md), native review of ja/vi drafts, credentials rotation in a public repository, `NEXT_PUBLIC_SITE_URL` before any deploy. Nothing has been deployed.

Requirements matrix: `docs/REQUIREMENTS_TRACEABILITY.md` (generated, covers the original spreadsheet). Revised requirements: REDEFINITION.md §J.

## Ecosystem (2026-11-15) — what exists and how it was verified
Architecture, research, ADRs, deployment, backup and roadmap: [docs/ecosystem/ARCHITECTURE.md](docs/ecosystem/ARCHITECTURE.md).

| Check | Result (last run, this machine) |
|---|---|
| `tsc --noEmit`, `eslint .` | 0 errors, clean |
| Unit + contract tests (Vitest, 30 files) | **310 passed**: policy (exhaustive), SDK (retries, rate limit, SSRF, redaction), retrieval, AI grounding and verification, API contract, auth/sessions, store, agents, knowledge layer |
| End-to-end (Playwright) | **283 passed** (3 locales, axe in both themes, no horizontal overflow at 5 widths) including: a real browser session on a second server with the owner console configured; a second **build with every integration disabled** (all pages render, empty states are honest) |
| Performance | `POST /api/ask` p50 3.4 ms, p95 5.2 ms (200 requests, first call 186 ms builds the corpus); static pages p50 7–10 ms; Lighthouse mobile on /ask and /observatory: performance 99, accessibility 100, best-practices 100, SEO 100, CLS 0; client JS chunks 1.1 MB (was 1.2 MB) |
| Not verified | the Anthropic adapter against the live API (contract-tested against a stub only); OAuth flows (none exist) |

