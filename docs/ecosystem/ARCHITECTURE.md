# Personal Digital Ecosystem — architecture (Stages 1–3)

*2026-11-15. Builds on [docs/REDEFINITION.md](../REDEFINITION.md). Facts are tagged **[V]** verified in this session (command or web search), **[K]** known from official docs but not re-checked today, **[?]** unverified or disputed — check before relying on it.*

## 1. Stage 1 — Discovery and audit

### 1.1 Current architecture report (measured)
- One Next.js 16 App Router app, React 19, TypeScript 5.9, Tailwind 4, next-intl 4 (en/ja/vi), anime.js. **[V]** 10.4k source lines, 21 commits.
- **No backend, no database, no authentication, no AI, no write path.** **[V]** (grep for ORMs, auth libraries and LLM SDKs: none). Content lives in typed data files and MDX in Git.
- Five route handlers: `feed.json`, `feed.xml`, `profile.json`, `search-index.json`, `api/deezer-preview/[id]`. All read-only. **[V]**
- A unified data layer (`src/lib/knowledge`: `Item`/`Edge`, provenance, visibility) already feeds search, graph, timeline, feeds, discovery. **[V]**
- Integrations (all keyless, server-side, optional): GitHub public API with committed snapshot, 9 news feeds, AniList, Open Library, Deezer. Each has its own ad-hoc timeout/failure handling and no shared health record. **[V]**

### 1.2 Technical debt
| Item | Risk | Plan |
|---|---|---|
| Five integration modules with five failure-handling styles | inconsistent retries, no health, no rate limiting | **Integration SDK** (§5), existing modules become adapters |
| Search is client-side substring ranking over a JSON index | weak relevance, no CJK tokenisation, no permission model | **Retrieval core** (BM25, CJK bigrams, permission-aware) |
| Visibility is `public/unlisted/private` only; no notion of *who wrote it* | AI or integration output could be mistaken for owner text | add `restricted` and `authorship` (owner / integration / ai) |
| Long e2e loops crashed Chromium on a 15 GB machine | flaky CI | fixed (tab recycling) |

### 1.3 Security assessment (today)
Strengths: static output, CSP allow-list, no cookies besides locale/theme, no user input stored, third-party text rendered as plain text, endpoints accept only numeric ids. Gaps relevant to this brief: **no identity, no authorization model, no audit log, no rate limiting, no secret management beyond one optional `GITHUB_TOKEN`.** Anything that adds a write path (owner console, agents, AI) must add all of them first.

### 1.4 Integration inventory vs candidates
| Candidate | Access reality | Verdict |
|---|---|---|
| GitHub | REST, 60/h unauthenticated, 5 000/h with a token **[K]** | **Keep** (adapter) |
| RSS/Atom (9 feeds) | open | **Keep** (adapter) |
| AniList | GraphQL, **90 req/min**, may be temporarily degraded to 30 **[V]**; 1-minute penalty | **Keep** (adapter, rate limiter respects 30/min) |
| Open Library, Deezer (chart + preview) | open, keyless **[K]** | **Keep** (adapters) |
| YouTube | Data API v3, **10 000 units/day per Cloud project**, per-minute limits separate **[V]**; playlists already embed without the API | **Defer** (embed is enough) |
| Spotify | **Feb 2026: dev mode needs Premium, one Client ID, ≤5 users; July 2026 quota per developer account [V]**; extended access needs a registered business **[V]** | **Defer**: not a credible production path for a personal site |
| Goodreads | API retired, keys disabled in 2020 **[V]**; terms forbid storing data | **Reject** |
| Letterboxd | API by request only; **not granted for private/personal projects [V]** | **Reject** (use TMDB if film data is ever needed) |
| MyAnimeList | OAuth client; Jikan mirror was unreachable on 2026-11-13 **[V]** | **Defer** (AniList covers anime) |
| Reddit | OAuth, ~100 req/min per client, free for approved non-commercial use **[?]** | **Defer** (no concrete use) |
| X / Threads | X free tier reported write-only **[?]** | **Reject** |
| Bluesky | public reads; app passwords vs OAuth is disputed across sources **[?]** | **Defer**: candidate first social integration (open protocol) |
| Mastodon | open OAuth, per-instance limits **[K]** | **Defer** with Bluesky |
| LinkedIn, Discord, Steam, Kaggle, Stack Overflow, Hugging Face, GitLab, Figma, Notion, Google Drive, Obsidian | each needs credentials and has narrow personal-data value; Obsidian has no API (local files) | **Defer**; the SDK makes any of them a one-file addition |

### 1.5 Product redundancy
Already resolved in REDEFINITION.md (six surfaces merged, three effects and three dependencies removed). New in this pass: **ad-hoc health/failure code in five integration modules** and **the Observatory's own source checks** collapse into one SDK registry.

### 1.6 Preservation plan
Everything public keeps working unchanged. New capability is additive; the public site must still build and run with **no environment variables, no network and no writable disk**.

## 2. Stage 2 — Research and architecture

### 2.1 Open-source evaluation
| Project | Purpose | License | Fit | Decision |
|---|---|---|---|---|
| n8n | workflow automation | Sustainable Use (source-available, not OSI) **[V]** | separate always-on service, heavy for one owner | **Not adopted**; revisit only for glue between hosted services |
| Temporal | durable workflow engine | MIT **[K]** | needs a cluster | **Not adopted**: our tasks are short, bounded, single-process |
| LangGraph / LlamaIndex / Haystack | agent / RAG orchestration | MIT / MIT / Apache-2.0 **[K]** | Python-first (LangGraph also JS); large surface | **Not adopted**: the loop here is ~150 lines with hard caps; adopting a framework would hide the permission boundary we must own |
| Meilisearch / Typesense | search servers | MIT (core) / GPL-3.0 **[K]** | extra service to run | **Deferred**: BM25 over ~150 items runs in-process in microseconds; revisit past ~10⁵ items |
| Directus / Payload | headless CMS | BSL-1.1 / MIT **[K]** | would replace Git-as-database | **Not adopted**: Git + typed files is the owner's intended editing model |
| Fedify | ActivityPub framework (TypeScript) | MIT, Next.js integration, SQLite/Postgres drivers **[V]** | needs persistent inbox and moderation | **Deferred**, best candidate when federation is wanted |
| Webmention.io | hosted webmention receiver | hosted service **[V]** | works with static sites | **Deferred**: a one-tag addition when the owner wants it |
| anime.js, next-intl, zod, gray-matter, MDX | already in use | MIT | | keep |

New runtime dependencies added by this work: **none.** (Node's `crypto` provides scrypt/HMAC; `fetch` provides HTTP.)

### 2.2 Architecture: a modular monolith with a hard core
One deployable. Logical layers, dependency direction downward only:

```
Experience   pages · palette · terminal · /ask · /owner
   │
API gateway  route handlers: validate → authenticate → authorise (policy) → rate-limit → call core → audit
   │
Runtime      agents (tasks, tools, approvals)      ai (provider interface, grounding, budget)
   │
Core         retrieval ← knowledge (Item/Edge) ← integrations (SDK + adapters) ← content (Git)
   │
Foundation   policy (classification × actor × action) · store (file/memory) · audit · auth · redact
```
Rules: `policy` and `store` import nothing from above; `knowledge` knows nothing about AI; `agents` and `ai` reach data **only** through `retrieval`/`knowledge` and every call passes `policy.decide`. Lives in `src/core/*` (new) next to the existing `src/lib/*`.

**Event bus:** deliberately *not* built. In a single process a typed `emit()` adds indirection without benefit; task and audit logs serve as the event record. Revisit when a second process exists.

### 2.3 Data model
```ts
Item   { id, kind, title, summary, topic?, tags, date?, href, source,
         provenance{origin,evidence?}, visibility: public|unlisted|private|restricted,
         authorship: owner|integration|ai, status, lang }
Edge   { from, to, kind: uses|related|topic|supersedes|next, evidence? }
```
Classification matrix (the five required classes are *derived*, not stored twice):
| Class | visibility | authorship | leaves the server |
|---|---|---|---|
| Public | public | any | yes |
| Private | private/unlisted | owner | owner console only |
| Restricted | restricted | owner | never in lists, search or AI context |
| Integration-derived | any | integration | follows its visibility; deleted on disconnect |
| AI-generated | private until approved | ai | only after explicit owner approval; always labelled |

### 2.4 Integration architecture
`Integration` = { id, name, kind, auth (`none` \| `apiKey` env name \| `oauth2`), scopes, `allowedHosts`, rateLimit, ttl, attribution, privacy, `fetch(ctx)` }. `runIntegration()` provides: host allow-list (SSRF), timeout, token-bucket rate limiting, exponential backoff with jitter and a retry budget, result normalisation, a **health record** (`ok | degraded | failed | disabled | needs-auth`, latency, attempts, last error, checkedAt), and credential redaction in every log line. Credentials are read only from server env (`resolveCredential`), never serialised, never sent to a browser. `disconnect(id)` deletes derived data from the store. OAuth is part of the contract and **is not implemented**: no shipped adapter needs it, and an untestable OAuth flow would be a mock pretending to work.

### 2.5 AI architecture
`LanguageModel` interface (provider-independent). Providers: **`extractive`** (default, no network: quotes and links retrieved sources) and **`anthropic`** (env-configured; request shape and error handling are contract-tested against a stub; **not verified against the live API in this session**). Grounding pipeline: retrieve (permission-aware) → build context from allowed items only → generate → **verify citations** (every `[n]` must exist; at least one required) → fall back to extractive if verification fails. Responses separate **facts** (quoted from owner/site data), **inferences** (graph relations, flagged) and **suggestions**; they carry a retrieval-based confidence and the provenance of every source. Output is `authorship: ai` and never auto-published. Budget: per-IP and global rate limits, daily request cap, output-token cap; when exhausted or the provider is down the service degrades to extractive.

### 2.6 Agent architecture
A task is a bounded state machine: `queued → running → succeeded | failed | cancelled | awaiting-approval`. Hard caps: max steps, wall-clock timeout, `AbortSignal` cancellation. Agents have no ambient authority: they receive **tools**, each tool declares a risk class (`read | draft | write | external`), and each invocation is checked by `policy.decide({agent level}, action, resource)` and written to the audit log. Agents can only **create proposals** (authorship `ai`, private); applying anything requires owner approval and, for this release, **produces a patch the owner applies by hand** — nothing writes to the site's data files.

### 2.7 Permission model
| Level | May | Never |
|---|---|---|
| 1 read-only | read public + private items it is scoped to | restricted data, any write |
| 2 assisted | + create **proposals/drafts** (private, `ai`) | apply, publish |
| 3 approval-required | + perform a write **with a valid owner approval** | write without it |
| 4 autonomous | + run allow-listed **low-risk** actions (e.g. refresh a cache, re-check health) | anything outside the allow-list |
| **all levels** | | **hard-denied:** publish personal information, delete data, touch credentials, irreversible external actions, read `restricted` |

Actors: `visitor` (public read only), `owner` (authenticated; reads private and restricted; approves), `agent(level)`. Decisions return `{allow, requires: none|approval, reason}` and are table-tested exhaustively.

### 2.8 API design (route handlers)
| Route | Auth | Purpose |
|---|---|---|
| `POST /api/ask` | none, rate-limited, same-origin | grounded answer over **public** items |
| `POST /api/owner/login`, `/logout` | password → signed httpOnly cookie | session |
| `GET /api/owner/state` | owner | health, tasks, proposals, audit tail |
| `POST /api/owner/agents/{id}/run` | owner + Origin check | start a task |
| `POST /api/owner/tasks/{id}/cancel` | owner | cancel |
| `POST /api/owner/proposals/{id}/{approve\|reject}` | owner | decide |
| `GET /api/owner/export`, `POST /api/owner/purge` | owner | export / delete derived data |

All handlers: schema validation (zod), body size cap, Origin check on state changes, rate limit, audit entry, no stack traces in responses.

### 2.7 Deployment modes (honest scope)
- **Public site** (static/ISR, anywhere including serverless): no env needed, everything public works.
- **`/ask`**: works everywhere in extractive mode; generation needs `AI_PROVIDER` + key.
- **Owner console and agents**: need `OWNER_PASSWORD_HASH`, `SESSION_SECRET` and a **writable `DATA_DIR`**. On serverless hosts the filesystem is ephemeral, so the console is disabled (404) there rather than silently losing history; self-hosted Node, a VPS or local use is the intended target. A `Store` interface leaves room for SQLite/Postgres later.

## 3. Architecture decision records
- **ADR-1 Modular monolith, no microservices.** One owner, one process, tens of items.
- **ADR-2 Git stays the content database.** Agents propose; the owner commits.
- **ADR-3 Extractive-first AI, provider-independent.** The site must work with no model; generation is an upgrade, verified by citation checks. *Supersedes the "AI postponed" decision in REDEFINITION.md now that the prerequisite (public items with provenance) exists.*
- **ADR-4 Policy engine as a pure function.** One place decides; everything else asks.
- **ADR-5 No agent framework.** Boundaries must be ours and testable.
- **ADR-6 No new dependencies.** Node built-ins cover hashing, signing and HTTP.
- **ADR-7 Owner console is opt-in and fails closed.** Missing secret or non-writable disk ⇒ 404.
- **ADR-8 Integrations are adapters over one SDK; OAuth is in the contract, not in the code until a real adapter needs it.**
- **ADR-9 Proposals produce patches, not writes.** Autonomy is limited to low-risk operations that cannot change published content.

## 4. Stage 3 — Product definition
**Identity:** *A Place Called Me* stays one personal world: Wander · Read · Japanese · Outside · Connect. The new capabilities appear as **three quiet doors**, not dashboards: **Ask** (question the site, with citations), **Observatory** (source health, languages, gaps — now fed by the SDK) and **Owner** (private, only if configured).

**Core journeys:** (1) a visitor asks "what has this person built with Python?" and gets cited facts; (2) the owner opens the Observatory, sees a source failing, and the Integration Monitor has already recorded it; (3) the owner runs the Knowledge Organizer, reviews proposed links with their evidence, approves one and applies the patch; (4) the owner runs translation coverage and reviews an AI draft that is marked as such and never published automatically.

| Decision | Items |
|---|---|
| **Build now** | policy engine · integration SDK (+5 adapters) · retrieval (BM25) · AI runtime + `/ask` · auth + store + audit · agent runtime + 3 agents · owner console |
| **Merge** | per-module health code → SDK; client substring search → retrieval core |
| **Remove** | nothing new (see REDEFINITION.md) |
| **Defer** | YouTube/Spotify/Bluesky/Mastodon/Reddit/etc. adapters · embeddings/semantic search · OAuth flows · SQLite/Postgres store · Fedify · Webmention · event bus · Meilisearch |
| **Reject** | Goodreads · Letterboxd · X · digital twin |

## 5. Acceptance report (Stage 6)

### 5.1 Implemented (complete vertical slices, each with tests)
| Slice | What exists | Where |
|---|---|---|
| Policy engine | one pure `decide(actor, action, resource)`; 4 agent levels, hard denials, `restricted` visibility, `authorship`; exhaustive table test over every actor × action × visibility | `src/core/policy` |
| Audit + redaction | structured audit entries; secrets redacted from keys, bearer tokens and token shapes | `src/core/policy/audit.ts` |
| Integration SDK | host allow-list (SSRF), manual redirect checks, timeouts, token-bucket rate limit, retry with backoff and `Retry-After`, TTL cache, stale-on-error, fallback, health records, owner kill-switch (`INTEGRATIONS_DISABLED`), disconnect | `src/core/integrations` |
| 13 adapters | GitHub, 9 news sources, AniList, Open Library, Deezer. The old ad-hoc modules (`news-feed`, `library-feed`, `github-feed`) are now thin facades | `src/core/integrations/adapters` |
| Retrieval | BM25, accent folding, Japanese bigrams, permission-aware, deterministic | `src/core/retrieval` |
| AI runtime | provider-independent interface, extractive default, Anthropic adapter, grounding prompt, **citation and URL verification**, fallback chain, per-client rate limit + daily budget + token tally | `src/core/ai` |
| Public assistant | `/ask` page and `POST /api/ask` | `src/app/api/ask`, `src/components/ask` |
| Owner console | scrypt + HMAC session, CSRF (SameSite=Strict + Origin), login throttling, state/run/cancel/approve/reject/export/purge/disconnect, all audited; **404 unless fully configured** | `src/core/owner`, `src/core/auth`, `src/app/api/owner` |
| Store | memory and file implementations behind one interface; atomic writes, torn-line recovery, path-traversal-proof names | `src/core/store` |
| Agent runtime | bounded tasks (steps, time, cancel), tool grants, policy per call, approval parking, proposals with dedupe, execution history | `src/core/agents` |
| 3 agents | Knowledge Organizer (L2), Translation Assistant (L2, AI drafts flagged for review), Integration Monitor (L4, one allow-listed operation) | `src/core/agents/catalog.ts` |
| Observatory | now reads the SDK health registry | `/observatory` |

### 5.2 Deferred (with reason)
OAuth flows and YouTube/Spotify/Bluesky/Mastodon/Reddit adapters (no concrete value yet, or restricted access, see §1.4) · embedding-based semantic retrieval (needs a provider; lexical covers today's corpus) · SQLite/Postgres store (file store suffices for one owner) · event bus · Fedify/ActivityPub, Webmention · applying approved proposals automatically (by design) · a Project Explorer with architecture diagrams (needs verified architecture per project).

### 5.3 Removed
Nothing in this pass. Earlier removals are in REDEFINITION.md. The ad-hoc integration code was **replaced**, not deleted: behaviour and call sites are unchanged.

### 5.4 Test results (final run, this machine)
See the table in PROJECT_STATUS.md; numbers are copied from the actual last run, not estimated.

### 5.5 Known limitations (honest list)
1. The Anthropic adapter's request/response shape is contract-tested against a stub. **It has not been run against the live API.**
2. Retrieval is lexical. A paraphrase with no shared words will not match.
3. The owner console persists to a local directory. On serverless hosts it is switched off by design; use a VPS, a container with a volume, or run it locally.
4. One owner, no account recovery: lose the password and you generate a new hash with `npm run owner:hash`.
5. Rate limits and the AI budget are per process (in memory). Behind several instances each has its own counters.
6. Approving a proposal records the decision; applying a change is manual.
7. Health records are per process too: the Observatory shows what this server has seen.
8. No OAuth integration exists, so "connection lifecycle" for OAuth is in the contract and untested in practice.

## 6. Deployment
**Public site only (no environment needed):** `npm run build && npm run start`, or any host that runs Next.js. Set `NEXT_PUBLIC_SITE_URL` to the real origin (canonical URLs, hreflang, sitemap, feeds). Nothing else is required; every optional piece below is off by default.

**Optional AI model for `/ask`:** `AI_PROVIDER=anthropic`, `ANTHROPIC_API_KEY=…` (server only), optionally `AI_MODEL`, `AI_DAILY_REQUESTS` (default 200), `AI_RATE_PER_MIN` (8), `AI_MAX_OUTPUT_TOKENS` (400). Unset ⇒ the assistant quotes the site.

**Optional owner console (self-hosted):**
1. `npm run owner:hash` (reads the password from stdin) and put the two printed lines in the server environment.
2. Set `DATA_DIR` to a writable directory (default `.data`, gitignored). In a container, mount a volume there.
3. Serve over HTTPS and set `NEXT_PUBLIC_SITE_URL=https://…`: the session cookie then becomes `__Host-owner; Secure`.
4. Open `/en/owner`. If it is a 404, one of the three settings is missing or the directory is not writable.

### Environment variables
| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | for production | canonical origin |
| `GITHUB_TOKEN` | no | higher GitHub rate limit (public read-only token, server only) |
| `AI_PROVIDER`, `ANTHROPIC_API_KEY`, `AI_MODEL` | no | enable a model for `/ask` and AI translation drafts |
| `AI_DAILY_REQUESTS`, `AI_RATE_PER_MIN`, `AI_MAX_OUTPUT_TOKENS` | no | cost controls |
| `OWNER_PASSWORD_HASH`, `SESSION_SECRET` (≥ 32 chars), `DATA_DIR` | all three to enable | owner console and agents |
| `INTEGRATIONS_DISABLED` | no | comma-separated integration ids to switch off |
| `NEXT_DIST_DIR` | no | build output directory (used by the failure-mode test) |

### Backup and recovery
- **Content** (everything public) is in Git: the repository is the backup.
- **Owner data** is the contents of `DATA_DIR`: `streams/*.jsonl` (audit, tasks) and `docs/*.json` (tasks, proposals). Back it up by copying the directory while the server is idle (writes are atomic, so a copy taken mid-write is still readable; a torn last log line is skipped on read). `GET /api/owner/export` produces the same data as one JSON file.
- **Restore:** stop the server, copy the directory back, start. **Wipe:** the console's "Delete everything", or delete the directory.
- **Secrets** are never stored in `DATA_DIR`. Rotate by changing the environment and restarting; changing `SESSION_SECRET` signs every session out.
- **Disaster:** the public site is stateless, so redeploying from Git restores it fully.

## 7. Next development roadmap
1. Run the Anthropic adapter against the live API once a key exists, then record the result in the Vault (Research Notes).
2. Embedding retrieval behind the existing `retrieve` signature (optional provider), compared against BM25 on a hand-written question set.
3. A Bluesky read-only adapter (open protocol) as the first social integration, then decide on posting.
4. Proposal appliers that open a pull request instead of editing files, keeping the owner as the merger.
5. SQLite store for history search, if the audit log grows beyond what a file handles comfortably.
6. Project Explorer, once one project's architecture has been read and verified from code.
