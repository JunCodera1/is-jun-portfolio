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
