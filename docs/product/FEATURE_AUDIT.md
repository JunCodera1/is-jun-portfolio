# Feature audit and consolidation

*Audited 2026-11-15 on `main` at `27d1f0e` with a clean working tree, then the fixes in §4. Every row cites files or tests. "Verified" means a test that fails if the behaviour breaks; a page merely rendering is **not** verification. Old documentation was not trusted: counts below were re-measured (6 Hideout objects, 5 games, 9 Vault modules, 7 projects, 13 integrations, 3 agents, 35 navigation entries, 32 unit test files, 16 e2e spec files, 0 skipped tests).*

**Status legend:** **V** implemented and verified · **I** implemented, insufficiently verified · **P** partially implemented · **D** designed, not implemented · **B** broken or inconsistent · **R** redundant · **X** deprecated.

---

## Part 1 — Feature inventory

### Area 1 · Wander
| Feature | Status | Evidence | Verified by / gap |
|---|---|---|---|
| Entrance (title screen, Enter to start) | **V** | `src/components/world/Entrance.tsx`, `src/app/[locale]/(world)/page.tsx` | `tests/e2e/world.spec.ts` ("entrance → city…"); `redesign.spec.ts` (name in 3 languages) |
| City hub, five places, three hidden things | **V** | `CityMap.tsx`, `CityArt.tsx`, `src/content/data/world.ts` | world.spec (hotspots are real links, hidden things, tracking in HUD). Mobile: **P**, see F-10 |
| Hideout: 6 interactive objects | **V** (desktop) / **P** (touch) | `Hideout.tsx`, `HideoutArt.tsx` | world.spec ("every object opens a panel with real content", "window toggles day/night"). Needs horizontal pan at 390 px (F-10) |
| Lab: case files with technology evidence | **V** | `CaseBoard.tsx`, `src/content/data/lab.ts`, `projects.ts`, `skills.ts` | world.spec ("evidence names files"); 36 `uses` edges all carry evidence (`knowledge.test.ts`) |
| Station: Japanese routes and missions | **V** (mechanics) / **I** (content) | `StationMap.tsx`, `src/lib/station.ts`, `src/content/data/station.ts` | `tests/unit/station.test.ts`, world.spec ("playable end-to-end", "wrong answer does not stamp"). Study items have no review flag (F-09) |
| Arcade: 5 games | Kana Blitz, Kana Match, Reaction **V**; **Vocabulary Speedrun, Typing Sprint I** | `src/components/games/*.tsx` | `play.spec.ts`, `world.spec.ts`, `japanese.test.ts` cover the first three; the other two are only render/axe-checked (F-17) |
| Archive | **V** / **R** (overlap) | `ArchiveShelves.tsx`, `archive.ts` | world.spec ("spines open cards that state their source"). Overlaps Library/References (F-19) |
| Backstage + Konami code | **V** | `(world)/backstage/page.tsx`, `WorldProvider.tsx` | world.spec ("Konami code opens Backstage (noindex)") |
| Knowledge Graph | **V** | `(site)/graph/page.tsx`, `src/components/graph/KnowledgeGraph.tsx`, `src/lib/graph.ts` | `graph.spec.ts`, `redesign.spec.ts`, layout test in 3 locales (`knowledge.test.ts`). 33 of 37 content entries have no real relation (F-14) |

### Area 2 · Read
| Feature | Status | Evidence | Verified by / gap |
|---|---|---|---|
| About, Now, Interests | **P** (structure done, owner content missing) | `(site)/about|now|interests/page.tsx` | routes.spec, axe. Measured placeholders: About 6, Now 5, Interests 5 (F-20) |
| Garden, Journal (MDX) | **V** | `content/*/*/*.mdx`, `src/lib/content.ts` | `content.test.ts`, i18n.spec (3 translation states). Only 2 notes + 1 post exist, all about this site |
| Project case studies (7) | **V** | `projects.ts`, `(site)/projects/[slug]/page.tsx` | interaction.spec ("evidence table…"), `data.test.ts` |
| Printable Profile | **I** | `(site)/profile/page.tsx`, `PrintButton.tsx` | page rendered and axe-checked; print output itself is not tested |
| Unified Timeline | **V** | `(site)/timeline/page.tsx` | `redesign.spec.ts` (real dates, newest first, filters) |
| Knowledge Vault (9 modules) | **V** (structure) / **P** (content) | `src/content/data/vault/*.ts`, `(site)/vault/**` | `vault.spec.ts`, `vault.test.ts`, `visibility.test.ts`. Reading Progress has 0 entries, Learning log 0 |

### Area 3 · Japanese learning
| Feature | Status | Evidence | Verified by / gap |
|---|---|---|---|
| Spaced-repetition cards | **V** | `src/lib/srs.ts`, `src/components/japanese/Review.tsx` | `srs.test.ts` (8), `review.spec.ts` |
| Study streak and heatmap | **V** | `StudyStats.tsx`, `src/lib/world-store.ts` | `srs.test.ts`, `review.spec.ts`. Browser-local and labelled as such |
| Kana, grammar | **V** (structure) / **I** (content correctness) | `(site)/japanese/kana|grammar/page.tsx`, `kana.ts`, `japanese-knowledge.ts` | table completeness tested (`play.spec.ts`); the Japanese text itself has not been reviewed by the owner (F-09) |
| Station ↔ review integration | **V** | `StationMap.tsx` calls `markStudiedToday()` | review.spec / world.spec |
| Real vs demo progress | **V** | all progress stores empty at start; nothing seeded | `vault.test.ts` ("nothing personal is invented") |

### Area 4 · Beyond
| Feature | Status | Evidence | Verified by / gap |
|---|---|---|---|
| Tech news (9 sources) | **V** | `src/core/integrations/adapters/news.ts`, `(site)/news/page.tsx`, `NewsBoard.tsx` | `integrations-adapters.test.ts`, play.spec (safe links / empty state), `degraded.spec.ts` |
| Anime (AniList), books (Open Library), music (Deezer) | **V** | `adapters/library.ts`, `(site)/library/page.tsx` | adapters tests; degraded.spec (honest empty states) |
| Playlists playable in-page | **V** | `src/components/library/Playlist.tsx`, `src/lib/music.ts` | `music` unit tests, `playlist.spec.ts`. Owner playlist is empty, so YouTube/Spotify/SoundCloud embeds are contract-tested only (F-17) |
| Preview endpoint | **B** | `src/app/api/deezer-preview/[id]/route.ts` | bypasses the Integration SDK (F-11) |
| Integration SDK + 13 adapters | **V** | `src/core/integrations/sdk.ts` | 27 unit tests (retry, rate limit, SSRF, redaction, fallback, kill switch, disconnect) |
| External vs owner content distinction | **V** | `Item.source`, `authorship`; labels in Ask and Timeline | ecosystem.spec, redesign.spec |

### Area 5 · Connect
| Feature | Status | Evidence | Verified by / gap |
|---|---|---|---|
| JSON Feed | **V** | `src/app/[locale]/feed.json/route.ts`, `src/lib/jsonfeed.ts` | redesign.spec (valid 1.1, 3 locales, public only) |
| RSS | **P** | `src/app/[locale]/feed.xml/route.ts` | journal posts only; the JSON feed carries everything dated (F-13) |
| `profile.json` | **V** | `src/app/profile.json/route.ts` | redesign.spec (`name: null`, no e-mail, rel=me) |
| Observatory | **V** (after F-08) | `(site)/observatory/page.tsx` | ecosystem.spec, degraded.spec. All numbers are derived (counts per state, health per integration, graph gaps) |

### Global experiences
| Feature | Status | Evidence | Verified by / gap |
|---|---|---|---|
| Ask | **V** (extractive) / **I** (generated) | `src/core/ai/ask.ts`, `src/app/api/ask/route.ts`, `AskForm.tsx` | `ai.test.ts` (16), `api-ask.test.ts` (12), ecosystem.spec. Anthropic adapter never run live (F-17). Cannot answer glossary questions (F-12) |
| Command palette | **V** (after F-01) | `CommandPalette.tsx`, `PaletteMount.tsx` | interaction.spec, delight.spec (incl. entrance and world) |
| Hidden terminal | **V** | `Terminal.tsx`, `TerminalOverlay.tsx`, `src/lib/terminal.ts` | `terminal.test.ts` (prototype keys, unknown commands, argument whitelist), delight.spec |
| Surprise me | **V** (after F-02) / **P** (no-relation fallback, F-15) | `src/lib/discover.ts`, `SurpriseButton.tsx` | `discover.test.ts`, redesign.spec ("always lands on one of them") |
| Adaptive theme | **V** | `src/lib/theme.ts`, `ThemeControl.tsx` | `theme.test.ts` (inline script equals helpers for 24 h), delight.spec, interaction.spec |
| Owner console + 3 agents | **V** | `src/core/owner/*`, `src/core/agents/*` | `agents.test.ts` (13), `owner-api.test.ts` (14), `owner.spec.ts` (real browser on a configured server) |
| Policy engine, store, auth | **V** | `src/core/policy`, `store`, `auth` | `policy.test.ts` (exhaustive), `store-auth.test.ts` |

### Cross-cutting
| Capability | Status | Evidence / gap |
|---|---|---|
| Three languages, routing, hreflang | **V** | routes.spec, i18n.spec, `seo.test.ts` |
| Translation states for content | **V** | `localized.ts`, Observatory (ja/vi: 11 translated, 76 draft, 1 untranslated of 88; en: 88 translated) |
| Translation states for UI strings | **D** | none for 1 107 keys × 2 locales (F-09) |
| Accessibility | **V** | axe WCAG 2.1 A/AA on every page × 3 locales × 2 themes (`quality.spec.ts`), contrast test (`contrast.test.ts`) |
| Reduced motion | **I** | 7 CSS blocks in `globals.css`, `reducedMotion()` in 12 files; e2e checks only shutter, cursor, kinetic text, smooth scroll (F-16) |
| Sound off by default | **V** | world.spec |
| Performance | **I** | Lighthouse mobile 99–100 on /ask, /observatory, /graph, /classic (measured 2026-11-15); the older table for world pages predates later changes (F-17) |
| Failure independence | **V** | `degraded.spec.ts` builds the site with every integration disabled |

---

## Part 2 — Findings

### 2.1 Defects fixed in this phase (see §4)
**F-01** Ctrl+K did nothing on the entrance. **F-02** Surprise me jumped to arbitrary pages 40 % of the time. **F-03** `visibility` was enforced only in the data layer, not by pages. **F-04** The sitemap published the address of private notes and omitted concept pages. **F-06** The Library pinned "Hunter × Hunter (2011)" and the Archive said "anime and manga", neither confirmed by the owner. **F-08** The Observatory did not say when health was measured. **F-24** The Now page displayed an "updated" date (13 Nov 2026) that the owner never set: it was the day the page was built.

### 2.2 Open findings
Each entry: current situation → proposed change → user value → engineering cost → risk → priority. Cost: S ≤ ½ day, M ≤ 2 days, L > 2 days.

**F-05 · The same facts live in four places** — Duplicate / overlap
- *Now:* JLPT N3/N2/N1 appear in `src/content/data/japanese.ts` (milestones, goal), `vault/roadmap.ts` (jlpt track), `graph.ts` (jlpt path) and `vault/learning.ts` (goal); the study log exists twice (`japanese.studyLog`, `learning[].log`). Editing one leaves the others stale.
- *Change:* make `japanese.ts` the only source; derive the roadmap track, the graph path and the learning goal from it; keep one study log.
- *Value:* no contradictions when the owner adds the N3 date or a log line. *Cost:* M. *Risk:* low (tests exist). *Priority:* **P1** (R-P1-04).

**F-07 · Two decision logs and stale historical documents** — Duplicate
- *Now:* 22 numbered decisions in `TECHNICAL_DECISIONS.md` and 11 in the Vault Decision Journal; `docs/REQUIREMENTS_TRACEABILITY.md`, `docs/requirements/requirements-status.json`, `docs/DISCOVERY_REPORT.md`, `docs/IMPLEMENTATION_ROADMAP.md` still describe pages that no longer exist (`/recruiter`, `/terminal`, `/links`, `/log`) and the original spreadsheet rows.
- *Change:* freeze `TECHNICAL_DECISIONS.md`; new decisions go to the Vault journal only. Mark the four historical documents with a header pointing to the Constitution; keep them for provenance.
- *Value:* one place to look. *Cost:* S. *Risk:* none. *Priority:* **P1** (R-P1-05).

**F-09 · Translation review state is missing where most text lives** — Missing foundation
- *Now:* content entries carry `translated | draft | untranslated`; the **1 107 UI strings per locale** and the Japanese study items (kana, vocabulary, kanji readings, grammar) carry none. ja/vi UI text was drafted by the assistant, never reviewed by a native speaker, yet the Observatory counts it as nothing.
- *Change:* add a `reviewed` marker per message namespace (or file-level manifest) and per study item; show both on the Observatory; give the owner a review list.
- *Value:* the honest-translation rule becomes checkable for UI and for learning material. *Cost:* M. *Risk:* low. *Priority:* **P0** for Japanese study content (a wrong reading misleads a learner), **P1** for UI strings (R-P0-03, R-P1-06).

**F-10 · Wander is not yet touch-first** — UX inconsistency
- *Now:* at 390 px the City map needs a 1 000 px-wide pan area and the Hideout 960 px (measured). Both have list alternatives and the bottom dock exists on the classic site, but the world itself is a scaled desktop scene.
- *Change:* on small touch screens present the City and Hideout as a vertical sequence of large tappable scenes/cards with the art as a header; keep the map for pointer devices.
- *Value:* the product's main entry point works well on phones. *Cost:* L. *Risk:* medium (identity). *Priority:* **P1** (R-P1-01).

**F-11 · One SDK bypass** — Technical debt
- *Now:* `src/app/api/deezer-preview/[id]/route.ts` uses a bare `fetch`: no rate limit, retry or health record. Documented as an exception in ARCHITECTURE_GOVERNANCE.md §5.
- *Change:* add a short-TTL, no-cache SDK adapter (`deezer.preview`) and call it from the route. *Value:* rule compliance, visible health. *Cost:* S. *Risk:* low. *Priority:* **P1** (R-P1-02).

**F-12 · Glossary lives outside the unified data layer** — Duplicate representation
- *Now:* `src/lib/search-index.ts` builds glossary entries separately from `src/content/data/vault/glossary.ts`; they are not `Item`s, so Ask, the graph, the timeline and discovery cannot use them. Asking "what is CSP?" is answered from the concept page, not the glossary.
- *Change:* add `kind: "term"` to the data layer; terms feed search, Ask and discovery; the glossary page is a view. *Value:* one representation, better answers. *Cost:* M. *Risk:* low. *Priority:* **P1** (R-P1-03).

**F-13 · RSS is a subset of the JSON Feed** — Inconsistency
- *Now:* `feed.xml` lists journal posts only; `feed.json` lists every public dated item. *Change:* generate both from the same projection. *Cost:* S. *Risk:* low. *Priority:* **P1** (R-P1-07).

**F-14 · The graph is mostly topic hubs** — Content gap
- *Now:* of 92 edges, 48 are topic, 36 are `uses`, 5 `next`, 2 `related`, 1 `supersedes`. 33 of 37 content entries (notes, posts, concepts, research, mistakes, decisions, ideas) have no real relation; `journal:three-languages-from-day-one` has none at all. *Change:* the owner (or the Knowledge Organizer's proposals) adds `related` links; the Observatory already lists gaps. *Value:* discovery and Ask get meaningful context. *Cost:* S per batch. *Risk:* none. *Priority:* **P2** (R-P2-01).

**F-15 · Surprise me still falls back to arbitrary pages for pages without relations** — Partial
- *Now:* pages such as `/about` have no recorded relations, so discovery picks any public page. *Change:* give top-level pages relations (their area siblings and the content that cites them) in the data layer. *Cost:* M. *Risk:* low. *Priority:* **P2** (R-P2-02).

**F-16 · Reduced motion is respected but only partly proven** — Verification gap
- *Now:* every anime.js call goes through `reducedMotion()`, but e2e covers only four effects. *Change:* one parametrised e2e that loads the main pages with `reducedMotion: "reduce"` and asserts no running animations (`document.getAnimations()`) and no inline transforms from effects. *Cost:* S. *Risk:* none. *Priority:* **P0** (R-P0-04), because it is an accessibility promise.

**F-17 · Verification gaps** — Process
- Anthropic adapter never exercised against the live API; Vocabulary Speedrun and Typing Sprint lack behaviour tests; YouTube/Spotify/SoundCloud embeds are contract-tested only because the owner playlist is empty; Lighthouse was re-measured on four pages only; the printable Profile output is untested. *Priority:* **P0** for the two games and print (small), **P1** for the live API check once a key exists (R-P0-02, R-P1-08).

**F-18 · Dead code** — `GithubIcon` (`src/components/ui/Icons.tsx`) and the `chain` illustration in `src/components/ui/Spot.tsx` are unused. *Cost:* S. *Priority:* **P3**.

**F-19 · Overlapping surfaces** — Redundant
- *Now:* Lab and Projects present the same data (intentional: world vs classic); Archive, Library "Mine", Vault References and Reading Progress all hold "things the owner reads/likes".
- *Change:* keep Lab/Projects (two views of one dataset, no duplicated data). Make Archive a *view* of Library "Mine" + References + Reading, drawn from one data source. *Cost:* M. *Risk:* medium. *Priority:* **P2** (R-P2-03).

**F-20 · Owner content is the largest gap** — Content
- Measured placeholders: About 6, Now 5, Interests 5, Profile 2, Japanese hub 2, Timeline 1, Contact 1, Reading 1, Learning 1. See OWNER_CONTENT_NEEDED.md. *Priority:* **P0 for the product**, but the work is the owner's.

**F-21 · Operational state is per process** — Constraint
- Rate limits, the AI budget and integration health live in memory; the Observatory shows what this process saw. Acceptable for one instance; documented. *Priority:* **P3** unless more than one instance is deployed.

**F-23 · The working name is shown without a qualifier** — *Resolved 2026-11-16:* the owner confirmed "Jun" (`displayNameConfirmed: true`); the terminal no longer says "not confirmed"; `profile.json` publishes `name: "Jun"` (test updated, not weakened).
- *Now:* "Jun" is the hero headline (`src/components/sections/Hero.tsx`) and the footer copyright (`SiteFooter.tsx`: "© 2026 Jun"); the terminal and `profile.json` are honest about it, the visible pages are not. The owner has said "Jun" is temporary.
- *Change:* until `displayNameConfirmed` is true, show a quiet "working name" tag in the footer and credit the GitHub handle in the copyright line; no change to the hero typography. *Value:* no page implies a real name that was never given. *Cost:* S. *Risk:* low; the owner may prefer to confirm the name instead. *Priority:* **P1** (R-P1-10).

**F-22 · Visibility coverage is incomplete** — Technical debt
- `glossary`, `learning`, `reading`, `roadmap` entries have no `visibility` field; `skills.ts` references projects by slug, so a private project leaves a dangling evidence line. *Change:* add the field and filter; make skills derive from visible projects. *Cost:* S. *Priority:* **P1** (R-P1-09).

---

## 3. Duplicates and overlaps — summary
| Overlap | Verdict |
|---|---|
| JLPT/learning facts in 4 files (F-05) | merge into `japanese.ts` |
| Decision logs (F-07) | merge into the Vault journal |
| Glossary vs unified layer (F-12) | merge into the layer |
| RSS vs JSON feed (F-13) | one projection |
| Archive vs Library vs References vs Reading (F-19) | one data source, several views |
| Lab vs Projects | keep (two presentations, one dataset) |
| Station vs Review vs Arcade kana | keep: different jobs (route, memory, play); shared data already (`kana.ts`, `station.ts`) |
| `/search` page vs Ctrl+K | keep: shareable URLs vs overlay, one index and one ranking |

## 4. Small fixes made in this phase (all low risk, all tested)
| ID | Change | Files | Tests added or updated |
|---|---|---|---|
| F-01 | The command palette answers Ctrl+K on the entrance (button hidden, dialog and shortcut kept) | `CommandPalette.tsx`, `PaletteMount.tsx`, `WorldHud.tsx`, `(world)/layout.tsx` | `tests/e2e/delight.spec.ts` (entrance) |
| F-02 | Discovery always follows a recorded relation when one exists (default `follow = 1`); random only for pages with none | `src/lib/discover.ts` | `tests/unit/discover.test.ts`; `tests/e2e/redesign.spec.ts` ("always lands on one of them") |
| F-03 | Pages, terminal, sitemap, hideout and lab import *listed* lists (`projects`, `decisions`, …); the data layer imports `allProjects` / `*All` | `src/content/data/projects.ts`, `vault/index.ts`, `vault/types.ts`, `src/lib/knowledge/build.ts` | `tests/unit/visibility.test.ts` (injects a private decision end to end) |
| F-04 | Sitemap uses the visibility-aware lister and includes concept pages | `src/app/sitemap.ts` | `tests/unit/sitemap.test.ts` |
| F-06 | Library lookup no longer pins the 2011 adaptation; the card says it is the closest AniList match; Archive note says "named by the owner as an interest" | `library.ts`, `archive.ts`, `messages/*.json` | existing tests (no card is shown when the service is down: `degraded.spec.ts`) |
| F-24 | `nowUpdated` is unset until the owner writes an entry; the Now page, the Index row and the terminal show no date until then | `src/content/data/now.ts`, `(site)/now/page.tsx`, `IndexList.tsx`, `src/lib/terminal-data.ts` | typecheck; existing e2e (nothing asserted the date) |
| F-08 | Observatory shows when each source was checked and that it is not live | `(site)/observatory/page.tsx`, `messages/*.json` | `tests/e2e/ecosystem.spec.ts` |

Nothing was removed, no test was weakened or skipped, no dependency was added. Verification of the whole set is in §5.
