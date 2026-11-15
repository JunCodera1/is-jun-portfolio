# Architecture governance

*Written 2026-11-15 against commit `27d1f0e` plus the fixes in [FEATURE_AUDIT.md](FEATURE_AUDIT.md) §4. Every statement about code names the file that proves it. Product intent lives in [PRODUCT_CONSTITUTION.md](PRODUCT_CONSTITUTION.md); this document says how the system is allowed to be built.*

## 1. System boundaries

One deployable Next.js application (modular monolith). Dependency direction is strictly downward:

```
Experience        src/app/[locale]/(world)  (site)      src/components/*      pages, palette, terminal, Ask, Owner
   │
API surface       src/app/api/ask · api/owner/[...path] · api/deezer-preview    + feed.json, feed.xml, profile.json, search-index.json
   │
Runtime           src/core/agents      src/core/ai                              bounded tasks · grounded assistant
   │
Core              src/core/retrieval ← src/lib/knowledge ← src/core/integrations ← content (Git)
   │
Foundation        src/core/policy · src/core/store · src/core/auth · src/core/policy/audit.ts
```

Rules: `src/core/policy` and `src/core/store` import nothing above them. `src/lib/knowledge` knows nothing about AI. `src/core/agents` and `src/core/ai` reach data only through `retrieve()` or the data layer, and every agent tool call passes `decide()` (`src/core/policy/index.ts`). Browser code never imports `src/core/*` except types and the two client forms (`src/components/ask`, `src/components/owner`), which talk to the API over `fetch`.

**Three runtime tiers, each with its own failure contract**

| Tier | Needs | If unavailable |
|---|---|---|
| Public site | nothing (no env, no network, no writable disk) | n/a — this is the baseline |
| Optional services | server env: AI key, `GITHUB_TOKEN`, integrations | degrades to quoted answers / snapshot / empty states |
| Owner console + agents | `OWNER_PASSWORD_HASH`, `SESSION_SECRET`, writable `DATA_DIR` | every owner route is a 404 (`src/core/owner/context.ts`) |

## 2. Unified data model

Defined in `src/lib/knowledge/types.ts`; built by `src/lib/knowledge/build.ts`. Storage is untouched: typed data files and MDX remain the source of truth, and the layer is computed at build time without copies.

```ts
Item { id, kind, title, summary, topic?, tags[], date?, href, source,
       provenance{ origin, evidence? }, visibility, authorship, status, lang }
Edge { from, to, kind: uses | related | topic | supersedes | next, evidence? }
```

| Field | Values | Rule |
|---|---|---|
| `kind` | project, tech, note, post, concept, research, mistake, decision, idea, path, topic, log, event | adding a kind requires updating `Kind`, the build, the timeline groups, the search type map and the Observatory labels in one change |
| `source` | owner, site, github, public | where the content *originates* |
| `authorship` | owner, integration, ai | who *wrote* it. AI-authored items are `private` until approved |
| `visibility` | public, unlisted, private, restricted | see §4 |
| `status` | translated, draft, untranslated | translation state of `title`/`summary` in the requested locale |
| `date` | ISO day or absent | never inferred (§2.2) |
| `provenance.origin` | file path of the source (`data/vault/decisions.ts`, `content/garden/<id>`, `data/github-snapshot.json`) | required, non-trivial (tested in `tests/unit/knowledge.test.ts`) |

### 2.1 Identifiers
`<kind>:<slug>` for content (`project:voiceai`, `garden:how-this-space-is-built`, `decision:anime-js`, `tech:Python`, `topic:web`, `event:github-account`, `log:2026-11-13-launch`); learning-path steps use their step id (`jp-kana`, `jlpt-n3`). Identifiers are language-independent (tested: the same ids exist in all three locales).

### 2.2 Dates
Only items with a real date appear on the Unified Timeline (`src/app/[locale]/(site)/timeline/page.tsx`). Dates come from: MDX frontmatter, dated entries in the Vault data files, `src/content/data/log.ts`, and the committed GitHub snapshot (`src/content/data/github-snapshot.json`, refreshed with `npm run snapshot:github`; the first-repository-per-language events are derived by `src/lib/derived.ts`). Tests assert that undated kinds (tech, topic, path, project, concept) carry no date and dated kinds carry an ISO day.

### 2.3 Relationships (Knowledge Graph rules)
| Edge | Created from | Must carry evidence? |
|---|---|---|
| `uses` | `usedIn` in `src/content/data/skills.ts` (project → technology) | **Yes**: the file or breakdown that proves it (tested) |
| `related` | `related:` frontmatter of notes/posts | no (the owner wrote it) |
| `supersedes` | `supersededBy` on a decision | no |
| `next` | order of steps in `src/content/data/graph.ts` paths | no |
| `topic` | an item's `topic` → hub (`topic:<id>`) | derived, no |

Rules: an edge is created only from data the owner or the repository states; nothing is inferred into the graph. **Suggestions** (`suggestConnections`, `src/lib/knowledge/types.ts`) and the Knowledge Organizer agent may *propose* a link from word overlap; they never write one. A node with no edge is a gap to be shown (Observatory), not hidden. The graph layout is deterministic and tested not to overlap labels (`tests/unit/knowledge.test.ts`, `src/lib/graph.ts`).

## 3. Content ownership

| Content | Home (single source) | Editor | Notes |
|---|---|---|---|
| Owner facts | `src/content/data/profile.ts`, `japanese.ts` | owner only | everything else derives or must not repeat them (audit F-05) |
| Garden, Journal | `content/{garden,journal}/<id>/{en,ja,vi}.mdx` | owner (`npm run new -- garden "Title"`) | frontmatter validated by zod (`src/lib/content.ts`) |
| Projects, skills | `src/content/data/projects.ts`, `skills.ts` | owner / verified from repos | evidence per technology |
| Vault modules | `src/content/data/vault/*.ts` | owner; seeded only from real build history | one model, nine views |
| Timeline events | derived (see §2.2) + `timeline.ts` (owner milestones, currently empty) | owner | |
| UI strings | `messages/{en,ja,vi}.json` | owner; ja/vi currently drafted by the assistant | parity enforced by `tests/unit/messages.test.ts`; no per-string review state (audit F-09) |
| Library "Mine", playlists | `src/content/data/library.ts` | owner | external data is fetched, never stored |
| Private operations (audit log, tasks, proposals) | `DATA_DIR` (never Git) | owner console | see §4 |

Decisions about architecture are recorded in the Decision Journal (`src/content/data/vault/decisions.ts`) — see §10.

## 4. Public and private data boundaries

**Rule:** only `visibility: "public"` (or omitted) may reach a public page, index, feed, endpoint, AI context or log. Everything else exists only for the owner.

**Enforcement points (all tested)**
1. `publicOnly()` — `src/lib/knowledge/types.ts`; the single choke point for the data layer. `getKnowledge()` returns public items and only edges between them; `getKnowledgeAll()` (owner/agents only) returns everything. Test: `tests/unit/knowledge.test.ts`.
2. **Module-level listing** — `src/content/data/vault/index.ts` exports *filtered* lists (`decisions`, `concepts`, …) for pages and unfiltered `*All` lists for the data layer; `src/content/data/projects.ts` exports `projects` (listed) and `allProjects` (data layer). Every page, the terminal, the sitemap, the hideout and the lab import the filtered names. Test: `tests/unit/visibility.test.ts` injects a private decision and proves it is absent from pages' lists, the public knowledge set, the search index and the assistant's corpus, while present for the owner and agents.
3. MDX: `getEntries()` returns only `visibility: "public"`; `getEntry()` returns `null` for `private` (`src/lib/content.ts`).
4. **The policy engine** — `decide(actor, action, resource)` in `src/core/policy/index.ts`. Visitors read only `public`; agents never read `restricted`; hard denials for publish, delete, credentials, irreversible external actions at every agent level. Exhaustive test: `tests/unit/policy.test.ts`.
5. **Retrieval** filters by `decide()` before ranking (`src/core/retrieval/index.ts`).
6. **Logs and errors** pass through `redact()` (`src/core/policy/audit.ts`).

**Classification** (the five data classes are derived from two fields, never stored twice)

| Class | `visibility` | `authorship` | Leaves the server |
|---|---|---|---|
| Public | public | any | yes |
| Private | private / unlisted | owner | owner console only |
| Restricted | restricted | owner | never: not in lists, search, AI context, agents |
| Integration-derived | follows its visibility | integration | deleted on disconnect (`clearIntegrationData`) |
| AI-generated | private until approved | ai | only after explicit owner approval, always labelled |

**Boundary for operations:** private operational data (audit log, task history, proposals) lives only in `DATA_DIR` through the `Store` interface (`src/core/store/index.ts`); it is git-ignored (`.gitignore`), written with owner-only permissions, and is exported or deleted from the console. Secrets are never written to it.

**Known gaps in this boundary:** `skills.ts` references projects by slug, so marking a project `private` would leave a technology evidence line pointing at a missing page (roadmap R-P1-09); `glossary`, `learning`, `reading` and `roadmap` entries have no `visibility` field yet.

## 5. Integration architecture

All external data goes through `src/core/integrations/sdk.ts`. Provided by the SDK and **non-negotiable**: HTTPS-only host allow-list with redirect re-checking (SSRF), token-bucket rate limiting, timeouts, retry with exponential backoff and `Retry-After`, TTL cache with stale-on-error, fallback data, a health record per integration, credentials read only from server env, secret redaction, the `INTEGRATIONS_DISABLED` kill switch, and `clearIntegrationData` for disconnect. Tests: `tests/unit/integrations-sdk.test.ts` (18), `tests/unit/integrations-adapters.test.ts` (9).

**Shipped adapters (13):** `github.repos`, nine `news.*` (verge, ars, bbc, hn, lobsters, devto, zenn, gigazine, vnexpress), `anilist`, `openlibrary`, `deezer` (`src/core/integrations/adapters/`). Pages never call an adapter directly: thin facades (`src/lib/github-feed.ts`, `news-feed.ts`, `library-feed.ts`) keep call sites stable. The Observatory reads `refreshAll()`.

**Adding an integration:** one adapter file declaring auth, scopes, `allowedHosts`, rate limit, TTL, attribution, privacy, probe, `fetch`, optional `fallback`; register by import in `src/core/integrations/index.ts`; extend the CSP in `next.config.ts` only if the browser must load its images, media or frames; add tests with an injected `fetch`. Paid or quota-limited services omit `probe`.

**Documented architectural exception (to be closed, roadmap R-P1-02):** `src/app/api/deezer-preview/[id]/route.ts` calls `api.deezer.com` with a plain `fetch` (numeric ids only, `*.dzcdn.net` redirect check) instead of the SDK, so it has no rate limit, retry or health record. It exists because preview URLs are signed and expire, so they cannot be cached. It is the only SDK bypass in `src/`.

OAuth is part of the SDK contract (`AuthSpec`) but **no OAuth flow exists**; an OAuth integration must not be added without implementing and testing the flow end to end.

## 6. AI context and citation rules
Implemented in `src/core/ai/ask.ts`, `src/core/retrieval/index.ts`, `src/core/ai/runtime.ts`; tested in `tests/unit/ai.test.ts`, `tests/unit/api-ask.test.ts`, `tests/unit/retrieval.test.ts`.

1. **Context is the public corpus only** (`publicDocs()`); never private, restricted or AI-authored items; never raw integration payloads.
2. Retrieval is lexical BM25 with accent folding and Japanese bigrams. No embeddings exist; none may be added without an ADR comparing them to BM25 on a written question set.
3. Every answer states `mode` (`extractive` | `generated` | `none`), `label` (`quoted` | `ai-generated` | `none`), a retrieval-based `confidence` (a heuristic, documented as such), and the sources with `origin`, `evidence`, `authorship`.
4. **Facts** = cited sources; **inferred** = relations recorded in the data layer, labelled "linked in this site's graph"; **suggestions** = weaker lexical matches. They are separate fields and separate UI sections.
5. A generated answer is accepted only if it has at least one citation, every `[n]` exists, no URL outside the sources appears, and it is ≤ 1 500 characters; otherwise the quoted answer is shown with a notice. `NO_ANSWER` and low confidence (< 0.25) produce "nothing on this site answers that".
6. The model sees sources inside `<sources>` with a system prompt that declares them data, not instructions; output is plain text.
7. Provider failure, a spent budget or a verification failure never breaks the page: it falls back to quotes. Budget: per-client rate limit, daily cap, token tally (`src/core/ai/budget.ts`); counters are per process.
8. The provider interface (`src/core/ai/provider.ts`) is vendor-neutral. The Anthropic adapter is **contract-tested against a stub and has not been run against the live API.**

## 7. Agent permission rules
`src/core/agents/runtime.ts`, `tools.ts`, `catalog.ts`; tests `tests/unit/agents.test.ts`, `tests/unit/owner-api.test.ts`, `tests/e2e/owner.spec.ts`.

| Level | May | Never |
|---|---|---|
| 1 read-only | read public + private | restricted, any write |
| 2 assisted | + create private, AI-labelled **proposals** | write, apply |
| 3 approval-required | + write only with the owner's approval (the call is parked as a proposal) | write unapproved |
| 4 autonomous | + run allow-listed **low-risk** operations | anything not on its allow-list |
| every level | | publish, delete, touch credentials, irreversible external actions, read restricted |

Rules: an agent gets only the tools in its definition; each call is policy-checked and audited; tasks are bounded (20 steps, 30 s) and cancellable; approving a proposal records the decision and, for this release, **produces a patch the owner applies by hand** (nothing writes to the site's data files). Shipped agents: Knowledge Organizer (L2), Translation Assistant (L2), Integration Monitor (L4, allow-list `integrations.refresh`). A new agent needs: its level justified in writing, a minimal tool list, tests for denial paths, and an entry in this document.

Owner console security (`src/core/owner/handlers.ts`, `src/core/auth/owner.ts`): scrypt password hash, HMAC-signed 8-hour session cookie (`HttpOnly`, `SameSite=Strict`, `__Host-` + `Secure` over HTTPS), Origin check on every state change, login throttling (5 / 15 min per IP, 30 / h global), generic error bodies, every action audited.

## 8. Localization
- Routes: `/{en|ja|vi}/…` always (`src/i18n/routing.ts`); `src/proxy.ts` redirects the bare `/` (cookie → `Accept-Language` → en). Metadata, canonical and hreflang come from `src/lib/seo.ts`.
- Content: `LocalizedText = { en: string; ja?: Variant; vi?: Variant }` (`src/lib/localized.ts`); `resolveText()` falls back to English and marks the result `untranslated`. MDX has one file per locale with a `translation: translated | draft` frontmatter field; a missing locale file is `untranslated`.
- **States:** `translated` (the product spec's "published"), `draft`, `untranslated`. `LText` renders the badge; a draft is never presented as approved. English is the source language and is always `translated`.
- Search is localized (`src/lib/search-index.ts` builds per-locale indexes; accent- and width-insensitive; Japanese substring/bigram).
- The Observatory counts each state per locale from the data layer (`src/app/[locale]/(site)/observatory/page.tsx`).
- UI strings: 1 107 keys per locale, parity enforced; **no per-string review state** (audit F-09).
- AI translation drafts: the Translation Assistant may attach an AI draft to a *proposal*; it is flagged `needs-human-review` and is never written into content automatically.

## 9. Operational constraints
- No database: Git for content, `DATA_DIR` for owner data. The file store is single-owner; it is not a multi-user store.
- Caching windows: GitHub 1 h, news 30 min, library 6 h (SDK `ttlMs` and Next `revalidate`). Pages that call integrations are rendered at build and revalidated; a build with no network produces honest empty states (verified by `tests/e2e/degraded.spec.ts`).
- Rate limits, the AI budget and integration health are **per process** (in memory); behind several instances each has its own counters.
- The owner console is for self-hosted Node/containers; on serverless hosts it is off by design.
- Performance budget is measured, not assumed: Lighthouse mobile ≥ 95 on measured pages, CLS ≈ 0, `POST /api/ask` p95 in single-digit milliseconds on the local machine (see `PROJECT_STATUS.md`).
- Deployment is never automatic; `NEXT_PUBLIC_SITE_URL` must be set to the real origin first (canonical URLs).

## 10. Dependency management
Runtime dependencies (16): `next`, `react`, `react-dom`, `next-intl`, `zod`, `animejs`, `gray-matter`, `next-mdx-remote`, `remark-gfm`, `rehype-slug`, `github-slugger`, `server-only`, and four font packages. **A new dependency requires**: a concrete need that Node built-ins or existing packages cannot meet, a license and maintenance check, a bundle/security note, and a Decision Journal entry. Hashing, signing, HTTP, the integration SDK, retrieval, the policy engine, the agent runtime and the store use no dependency. Unused dependencies are removed in the same change that makes them unused.

## 11. Architectural decision process
1. Write the proposal as a Decision Journal entry (`src/content/data/vault/decisions.ts`): context, decision, why, cost; mark any decision it replaces `superseded` with `supersededBy`.
2. If it changes a *fixed* rule below, update this document and the Constitution in the same change.
3. Land it with tests; existing tests are never weakened to admit it.
4. `TECHNICAL_DECISIONS.md` (22 numbered entries) is **frozen history**; new decisions go to the Vault journal (audit F-07).

### Fixed vs evolvable
| Fixed (changing needs the owner's explicit decision) | Evolvable (change with an ADR and tests) |
|---|---|
| Identity boundaries and "no invented facts" | visual details within the red/black/white identity |
| Public-site independence from AI, integrations and owner services | which integrations exist; adding adapters |
| `visibility` semantics and the public/private boundary | retrieval method (BM25 → hybrid) behind `retrieve()` |
| Owner authority; agents propose, owner applies; hard agent denials | agent roster and tools; levels per agent |
| Git as source of truth; no CMS/DB by default | the `Store` implementation for owner data |
| One unified data layer feeding all cross-content features | new `Kind`s and edge kinds (with the §2 checklist) |
| Three languages and honest translation states | translation workflow and review tooling |
| Integration SDK is the only path to external services | SDK internals (limits, retries, cache) |
| Original art only; reduced motion respected; sound off by default | effects, motion design, new original characters |
| Fail-closed owner console | auth mechanism details (e.g. add passkeys) |
