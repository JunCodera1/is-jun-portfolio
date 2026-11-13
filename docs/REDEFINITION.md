# A Place Called Me — redefinition

*Date: 2026-11-13. Deliverables A–J of the redefinition brief. Every number below was measured from the repository, not remembered.*

## A. Audit (what actually exists)

| Area | Measured |
|---|---|
| Routes | 47 pages + 4 route handlers (feed.xml, search-index.json, deezer-preview, OG/Twitter images). 8 world pages (`(world)`), 39 classic pages (`(site)`), 3 locales each |
| Source | 78 components (4.9k lines, 58 are client components), 33 lib modules (1.5k), 33 data files (1.5k), 59 app files (2.5k), 34 test files (2.2k) |
| Messages | 3 × ~50 KB JSON, key parity enforced by a test |
| Client JS | ~1.2 MB of chunks in `.next/static` (largest single chunk 229 KB) |
| Navigation | 27 entries: 13 personal, 11 utility (world places + tools), 3 professional, 12 "sub" pages; 7 in the header |
| Dependencies | 15 runtime (4 are fonts, 1 is animejs, 5 are MDX/content, next, next-intl, zod), 16 dev |
| External services | GitHub (public API + committed snapshot), 9 news feeds, AniList, Open Library, Deezer (+ a preview redirect endpoint). All server-side, all optional: the site renders without them |
| Content | Owner-stated facts only (N3 passed / N2 in progress / N1 long-term, Hunter × Hunter, Hisoka, IT student, AI/ML/Linux). 7 verified projects, 2 notes + 1 post (about the site itself), Vault seeded from real build history |

**What is not there:** no database, no auth, no user-generated content, no AI features, no inbound protocols (webmention/ActivityPub), no analytics. That is a feature, and it stays.

**Findings**

1. **The same data is rebuilt in five places.** `search-index.ts`, the graph page, the Vault hub's "latest", the terminal data and `surprise.ts` each walk projects/notes/vault separately, with their own idea of title, date, topic and visibility.
2. **Duplicate surfaces.** `/play` and `/arcade` render the same `GamesHub`; `/recruiter` repeats `/profile`; `/terminal` (page) duplicates the terminal overlay; `/links` and `/vault/reading` are both "things to read"; `/log` and `/timeline` are both "what happened when"; `/orbit` is a third hub next to the City and the Index.
3. **Decorative effects without a job.** The grey veil over every page header art (`RevealArt`), the idle float on that art (`Float`), pointer parallax on the mascots (`Parallax`).
4. **Unused dependencies.** `@testing-library/react`, `jsdom`, `@vitejs/plugin-react` (0 references in tests or config).
5. **No provenance model.** Items do not say where they came from, who may see them, or when they were checked. Today that is implicit in file names.
6. **Naming drift.** The product is called three things (digital space / world / portfolio). The owner calls it *A Place Called Me*.

## B. Feature decision matrix

| Feature | Decision | Why |
|---|---|---|
| City, Hideout, Lab, Station, Arcade, Archive (world) | **Keep** | The distinctive experience. Lab/Archive present the same data as Projects/Library; the cost is one extra view each, accepted |
| Classic site (About, Now, Interests, Garden, Journal, Projects, Contact, Profile) | **Keep** | The readable, printable, searchable face |
| `/play` | **Remove → `/arcade`** | Same component twice |
| `/recruiter` | **Merge → `/profile`** (+ print button) | Same data, same print stylesheet |
| `/terminal` page | **Remove** (overlay stays: `` ` ``, footer, Ctrl+K) | One terminal, not two |
| `/links` | **Merge → Vault › Reading & references** | One place for what to read |
| `/log` | **Merge → unified Timeline** | One place for what happened when |
| `/orbit` (solar system) | **Remove** | A third hub with no content of its own; the City map and Index already do the job |
| Timeline + Log + Vault "latest" | **Merge → Unified Personal Timeline**, filterable by kind | Time is one axis |
| Surprise Me + palette action + terminal `surprise` | **Merge → Discovery Engine**, now context-aware | One function, uses the graph |
| Knowledge graph, search index, timeline, feeds | **Improve → one Unified Data Layer** | Build once, project many ways |
| Header, Index, palette | **Improve** | Fewer entries (27 → 22) |
| Vault (9 modules) | **Keep, consolidate** with the layer | Real content; Reading absorbs Links |
| Library, playlists, news (9 sources) | **Keep** | Real integrations with graceful failure |
| Review cards, streak, Station | **Keep** | The daily-return loop |
| Magnetic cursor, ambient light, kinetic type, exhibition scroll | **Keep, with off switches** (all respect reduced motion; pointer-only) | Each has a use; none hides content |
| Image veil, header float, parallax | **Remove** | Decoration that dims the art on every page |
| Unused dev dependencies | **Remove** | Install weight, no use |
| Public JSON Feed, Open Profile JSON | **Introduce** | Cheap, real, durable, replaces nothing |
| Observatory (source health, translation coverage, link gaps) | **Introduce (slim)** | Answers real maintenance questions; replaces ad-hoc "latest" widgets |
| `rel="me"`, feed discovery links | **Introduce** | IndieWeb basics at near-zero cost |
| Webmention, ActivityPub | **Postpone** | Need an always-on receiver, storage, spam handling |
| Semantic search / RAG / AI assistant | **Postpone** | Needs a model service and keys; the site must work without external services. The data layer is the prerequisite and is built now |
| Digital twin | **Reject** | A simulated owner invites invented statements; the open profile JSON replaces it |
| Guestbook, 3D, code playground | **Postpone** (kept in Idea Incubator) | Unchanged reasons |

## C. Product vision

> **A Place Called Me** — an evolving personal digital ecosystem, connected to the open Internet, that stays readable without it.

Three layers of experience over one body of knowledge:
- **Wander** — the City and its places; the Discovery Engine.
- **Read** — the classic site; the Vault; the Timeline.
- **Connect** — feeds, profile JSON, source health; what leaves the site is chosen by the owner.

Principles kept from the brief: simplicity over quantity, real integrations only, privacy by default (visibility is a field, not a convention), nothing invented.

## D. Information architecture

```
A Place Called Me
├─ Wander   /  (entrance) · /city · /hideout · /lab · /station · /arcade · /archive · /graph
├─ Read     /about · /now · /interests · /garden · /journal · /projects · /profile
│           /vault (concepts, research, mistakes, decisions, ideas, glossary, reading & references, learning, roadmap)
│           /timeline  (everything that happened, filterable)
├─ Japanese /japanese · /japanese/kana · /japanese/grammar · /japanese/review
├─ Outside  /news · /library
├─ Connect  /contact · /observatory · /feed.json · /profile.json · /feed.xml
└─ Tools    Ctrl+K · ` terminal · Discovery (🎲) · /search
```
Header (7): City, About, Garden, Tech news, Library, Projects, Contact. Everything else through Index, Ctrl+K, or the tiles. Removed with redirects: `/play`, `/recruiter`, `/terminal`, `/links`, `/log`, `/orbit`.

## E. Technical architecture

1. **Identity Core** — `src/content/data/profile.ts` (+ about/now/interests/education): the only place personal facts live; unconfirmed = `undefined` = placeholder.
2. **Integration Layer** — `src/lib/{github-feed,news-feed,library-feed}.ts`, `api/deezer-preview`: each source is a small module with its own timeout, parser (hostile-input rules) and `ok` flag; replaceable one by one.
3. **Unified Data Layer** — `src/lib/knowledge/`: normalises every dated or linkable thing into `Item` + `Edge` with provenance and visibility. The only place that knows where data comes from.
4. **Knowledge Graph** — a *view* of the data layer (`/graph`), using the deterministic layout already tested.
5. **Intelligence Layer** — today: rule-based (context-aware discovery, link suggestions, translation coverage). Tomorrow: retrieval over **public** items with provenance as citations. No model calls now.
6. **Experience Layer** — world + classic pages, palette, terminal, feeds. Pages never read data files directly for cross-content features; they ask the data layer.

## F. Data model and integration strategy

```ts
Item { id, kind, title, summary, topic?, tags[], date?, href,
       source: "owner" | "site" | "github" | "public",
       provenance: { origin, evidence? },          // where it came from, what proves it
       visibility: "public" | "unlisted" | "private",
       status: "translated" | "draft" | "untranslated", lang,
       checkedAt? }                                // for synced items
Edge { from, to, kind: "uses" | "related" | "topic" | "supersedes" | "next", evidence? }
```
- Storage stays in typed files + MDX (Git is the database). The layer adds no copy; it is computed at build.
- **Only `public` items leave the site** (search index, feeds, graph, timeline, discovery). A unit test asserts that a `private`/`unlisted` item never appears in any projection.
- Synced external items (a future RSS import) enter as `visibility: "private"` until the owner approves them in a data file ("public content requires owner approval").
- Source health is observable: each integration reports `ok`, latency and cache window; failures are an empty state, never an error.

## G. New high-value proposals (each answers the six questions)

| Idea | Problem it solves / why here | What makes it different | Connects to | Cost |
|---|---|---|---|---|
| **Discovery Engine** (context-aware) | "I read this, what next?" — wandering should follow meaning, not dice | 60% of the time it follows real edges from where you are | graph, vault, notes, projects | one pure function + tests; replaces 3 |
| **Public JSON Feed + Open Profile JSON** | A personal site should be readable by other programs, durably | Owner-approved fields only; `name` stays `null` until confirmed | all public items | 2 route handlers |
| **Observatory** | The owner needs to see what is stale, untranslated or unlinked | Honest maintenance view: source health, translation coverage per language, orphan entries, *possible* connections | data layer, integrations | one page, no new data |
| **Link suggestions (rule-based)** | Graphs rot when nobody adds links | Suggests pairs sharing ≥ 2 tags/terms and no edge; never writes anything | graph | ~40 lines, tested |
| **IndieWeb basics** (`rel="me"`, feed discovery) | Identity verification across the open web | free | contact, footer | trivial |
| Webmention / ActivityPub | belong on a personal site long-term | | | **postponed**: needs receiver, storage, moderation |
| Source-aware assistant / RAG | answer questions about the site, with citations | citations = provenance fields | data layer | **postponed**: needs a model service; must not make the site depend on one |

## H. Performance, privacy, security, maintenance

- **Performance:** removals cut client code (SolarSystem, RevealArt, Float, Parallax, terminal page, recruiter page) and one dependency set; new pages are static or ISR (30 min). Lighthouse is re-measured after the change.
- **Privacy:** visibility is data; feeds and the profile JSON carry only fields the owner has stated; learning progress stays in the browser; no analytics, no cookies except the locale and theme the visitor sets.
- **Security:** CSP stays allow-list based; the new routes return JSON only; no new third-party origins; third-party text remains plain text.
- **Maintenance:** one data layer instead of five builders; redirects documented below; the data-integrity tests (ids, dates, languages, visibility) guard the model.

## I. Migration plan (nothing is lost)

| Old | New | Content |
|---|---|---|
| `/play` | `/arcade` (301) | same games |
| `/recruiter` | `/profile` (301) + print button | same facts |
| `/terminal` | `/classic` (301); terminal = `` ` `` overlay | same commands |
| `/links` | `/vault/reading` (301), section *References* | same links (`links.ts` kept) |
| `/log` | `/timeline` (301), kind *Site log* | same entries (`log.ts` kept) |
| `/orbit` | `/graph` (301) | the planets were navigation; the graph + Index replace them |
| `search-index.ts`, graph page, vault "latest", `surprise.ts` | built on `src/lib/knowledge` | same results, one source |

All data files stay. Locale-prefixed and bare URLs redirect. External links that used the old URLs keep working.

## J. Revised requirements (priorities and acceptance criteria)

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| R1 | P0 | One data layer feeds search, graph, timeline, feeds, discovery | Unit test: every projection is built from `getKnowledge()`; ids unique; edges point at existing items |
| R2 | P0 | Visibility is enforced | Test: `private`/`unlisted` items absent from search index, feed, timeline, graph, discovery |
| R3 | P0 | Removed pages redirect | E2E: each old URL (en/ja/vi) ends on its new page, status 200, no console errors |
| R4 | P0 | No lost content | E2E: Links content on Reading; Log content on Timeline; recruiter facts on Profile |
| R5 | P1 | Unified timeline | Filter by kind works; items sorted newest-first; dates are real or the item is omitted |
| R6 | P1 | Context-aware discovery | Unit test: with a related item available, ≥ 60% of seeded draws follow an edge; never returns the current page |
| R7 | P1 | JSON Feed 1.1 and Open Profile | Valid JSON Feed fields; `name` is `null` while unconfirmed; only public items |
| R8 | P1 | Observatory | Shows source health, per-language coverage, orphans, suggestions; works with every external source failing |
| R9 | P2 | Name and identity | "A Place Called Me" in title, entrance, footer, OG image; en/ja/vi |
| R10 | P0 | Quality gates | tsc, eslint, unit, e2e (axe both themes, 3 locales, no horizontal overflow, no console errors) all green |
| R11 | P2 | Dependencies pruned | No unused dependency remains |

*Postponed (requirements recorded, not scheduled):* webmention receiver, ActivityPub actor, retrieval-based assistant, idea-stage history.
