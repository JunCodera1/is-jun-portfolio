# Evolution roadmap

*Evidence-based and unscheduled: no dates, only priority and dependency order. Every item maps to a finding in [FEATURE_AUDIT.md](FEATURE_AUDIT.md) (`F-nn`), a gap in [EXPERIENCE_STANDARDS.md](EXPERIENCE_STANDARDS.md), or is explicitly labelled **Opportunity**. Complexity: **S** ≤ ½ day · **M** ≤ 2 days · **L** > 2 days (one focused session each, not a calendar promise).*

**Priority levels** — **P0** correctness, security, reliability, incomplete core behaviour · **P1** complete the intended product experience · **P2** valuable capabilities that improve coherence and exploration · **P3** experimental.

**Mandatory = P0 + P1.** Optional = P2 + P3. Owner-supplied content is tracked separately in [OWNER_CONTENT_NEEDED.md](OWNER_CONTENT_NEEDED.md) and is the largest single determinant of how complete the product feels; it is not engineering work and cannot be done for the owner.

**Already done in the audit phase** (no further work): F-01 Ctrl+K on the entrance · F-02 discovery follows relations · F-03 visibility enforced by pages · F-04 sitemap privacy and concept pages · F-06 unconfirmed claims removed · F-08 Observatory timing · F-24 no invented "updated" date on the Now page.

---

## Mandatory

### P0 — correctness, security, reliability

**R-P0-01 · Refresh the release gate and the performance evidence** *(F-17, standards §16)*
- *Problem:* Lighthouse was last measured on four pages; the table in `docs/TESTING_STRATEGY.md` predates the redesign. The full release gate has not been re-run since the audit-phase fixes.
- *Outcome:* a measured table for every page type (entrance, City, Hideout, Lab, Station, Arcade, Archive, a Vault page, Graph, Timeline, Ask, Observatory, News, Library) on mobile, with LCP, CLS, TBT, and the full gate green.
- *Depends on:* nothing. *Acceptance:* Lighthouse mobile ≥ 95 performance and 100 accessibility/best-practices/SEO on each, or a recorded, explained exception; CLS ≤ 0.01.
- *Test strategy:* scripted Lighthouse runs against a production build with `NEXT_PUBLIC_SITE_URL` set (otherwise canonical fails, as seen on 2026-11-15); results copied, not estimated. *Complexity:* S. *Risk:* world pages with large SVG art may miss the target; then record and decide.

**R-P0-02 · Close the small verification gaps** *(F-17; W-6, R-4, B-6)*
- *Problem:* Vocabulary Speedrun and Typing Sprint have no behaviour tests; printable Profile output is untested; no test asserts the "public charts, not the owner's picks" label.
- *Outcome:* each of these has a failing-if-broken test. *Depends on:* nothing.
- *Acceptance:* e2e for both games (start, answer by keyboard, score/result, storage blocked); an e2e using `page.emulateMedia({ media: "print" })` asserting header/footer/controls hidden and evidence visible; an assertion for the chart labels in 3 locales.
- *Test strategy:* extend `tests/e2e/play.spec.ts`, `quality.spec.ts`. *Complexity:* S. *Risk:* timing-based games need injected clocks to avoid flakiness.

**R-P0-03 · Review state for Japanese study content** *(F-09, J-4)*
- *Problem:* vocabulary, kanji readings, grammar items and conversation scenes in `src/content/data/station.ts` (and kana/grammar tables) have no `reviewed` flag; the owner (N3 passed) has not reviewed them, yet a wrong reading misleads a learner.
- *Outcome:* every study item carries `reviewed: boolean` (default `false`); unreviewed items are visibly marked in Station/Review and listed on the Observatory; the owner can review in bulk by editing one list.
- *Depends on:* owner time to review (OWNER_CONTENT_NEEDED #11). *Acceptance:* a unit test fails if an item lacks the flag; Review and Station show the mark; Observatory counts reviewed vs not, derived from data.
- *Test strategy:* data-integrity unit test + e2e. *Complexity:* M. *Risk:* low; the marking must not make the learning tools look broken: it is a quiet tag.

**R-P0-04 · Reduced-motion and touch sweep** *(F-16, M-1, L-3)*
- *Problem:* the promise "effects are fully off under reduced motion and absent on touch" is implemented through `reducedMotion()` and media queries but proven for only four effects.
- *Outcome:* a parametrised e2e over the main pages in two contexts: `reducedMotion: "reduce"` (desktop) and a touch device.
- *Acceptance:* in reduced motion `document.getAnimations()` is empty on each page, no effect-set inline transforms exist, no `.cursor-ring`, content is in its final position; on touch no cursor ring, no pointer drift, the exhibition is a swipeable row.
- *Test strategy:* new `tests/e2e/motion.spec.ts`. *Complexity:* S. *Risk:* CSS animations that are deliberately infinite (train, twinkle) must be covered by the same global reduced-motion rule; the test will show if one is missed.

### P1 — complete the intended experience

**R-P1-01 · Touch-first Wander** *(F-10, W-10, L-4)*
- *Problem:* at 390 px the City and Hideout need horizontal panning (1 000 / 960 px).
- *Outcome:* on small touch screens, each is a vertical sequence of large tappable scenes with the art as a header (keep the map on pointer devices); identity preserved.
- *Depends on:* R-P0-04 (to keep the motion contract). *Acceptance:* at 390×800 touch, no horizontal pan, every place/object reachable with one tap, tap targets ≥ 44 px, the list twin removed as redundant or merged.
- *Test strategy:* touch e2e on both pages; axe; visual review at 3 sizes. *Complexity:* L. *Risk:* medium: it changes the signature experience on phones; do it with the owner's review of the design.

**R-P1-02 · Move the preview endpoint onto the SDK** *(F-11, B-5)*
- *Problem:* `src/app/api/deezer-preview/[id]/route.ts` is the only SDK bypass.
- *Outcome:* a `deezer.preview` adapter (short TTL, no stale serving, host allow-list, rate limit) used by the route; health visible on the Observatory (14 integrations).
- *Depends on:* nothing. *Acceptance:* route calls `runIntegration`; direct `fetch` removed from the route; adapter tests for expiry and bad ids; the "only bypass" statement in ARCHITECTURE_GOVERNANCE.md §5 deleted.
- *Test strategy:* unit (injected fetch) + existing `playlist.spec.ts`. *Complexity:* S. *Risk:* low; stale caching of a signed URL must be impossible (`ttlMs: 0`, no stale).

**R-P1-03 · Glossary terms into the unified data layer** *(F-12, V-7)*
- *Problem:* terms are a separate representation in `src/lib/search-index.ts`; Ask, graph and discovery cannot use them.
- *Outcome:* `Kind` gains `term` (with `topic`); search, Ask and discovery read terms from the layer; the Glossary page remains a view.
- *Depends on:* nothing. *Acceptance:* "What is CSP?" is answered with the glossary entry as a cited source; term ids are language-independent; no glossary special case remains in `search-index.ts`.
- *Test strategy:* knowledge/ask unit tests; e2e on Ask and Ctrl+K. *Complexity:* M. *Risk:* low; update the `Kind` checklist (governance §2).

**R-P1-04 · One source for JLPT and learning facts** *(F-05)*
- *Problem:* the same facts live in `japanese.ts`, `vault/roadmap.ts`, `graph.ts`, `vault/learning.ts`; two study logs.
- *Outcome:* `japanese.ts` is the only source; the roadmap track, the graph path and the learning goal derive from it; one study log.
- *Depends on:* nothing. *Acceptance:* changing a milestone in `japanese.ts` updates the Japanese hub, roadmap, graph and Learning Tracker; a unit test fails if any other file hard-codes N3/N2/N1.
- *Test strategy:* data tests + vault/graph e2e. *Complexity:* M. *Risk:* low.

**R-P1-05 · One decision log; mark stale documents** *(F-07)*
- *Problem:* two decision logs; four historical documents describe removed pages.
- *Outcome:* `TECHNICAL_DECISIONS.md` frozen with a pointer; the four historical documents get a header ("historical, superseded by docs/product/"); future decisions go to the Vault journal.
- *Depends on:* nothing. *Acceptance:* `tests/unit/docs.test.ts` extended to require the header; README links to `docs/product/`.
- *Test strategy:* docs unit test. *Complexity:* S. *Risk:* none.

**R-P1-06 · Review state for UI strings** *(F-09)*
- *Problem:* 1 107 keys × ja/vi were drafted by the assistant with no review state.
- *Outcome:* a per-namespace review manifest (`messages/review.json`: namespace → `reviewed | draft`), shown on the Observatory and used to badge unreviewed pages' footers; default `draft`.
- *Depends on:* owner/native review (OWNER_CONTENT_NEEDED #12). *Acceptance:* every namespace is listed (test); the Observatory shows counts; no draft namespace is silently treated as approved.
- *Test strategy:* unit (manifest covers all namespaces) + e2e. *Complexity:* M. *Risk:* UI badge noise: keep it on the Observatory and a quiet page-level note only.

**R-P1-07 · RSS and JSON Feed from one projection** *(F-13, C-2)*
- *Problem:* `feed.xml` carries journal posts only.
- *Outcome:* both feeds are built from the same dated-public-items function; RSS gains category and language.
- *Depends on:* nothing. *Acceptance:* item sets equal; both valid; private items absent. *Test strategy:* unit + `routes.spec.ts`. *Complexity:* S. *Risk:* feed readers may re-announce old items if ids change: keep GUIDs stable (`href`).

**R-P1-08 · Verify what cannot be verified offline** *(F-17, A-9, B-4, J-5)*
- *Problem:* Anthropic adapter, owner-added embeds and browser speech are unverified in practice.
- *Outcome:* a short recorded check each: the adapter against the live API (needs a key from the owner), a real YouTube/Spotify/SoundCloud link in the playlist (needs tracks from the owner), speech on Chromium/Firefox/Safari.
- *Depends on:* owner key, owner tracks. *Acceptance:* results written to Research Notes (`vault/research.ts`) with date and sources; the adapter's "not verified" note removed only after a pass.
- *Test strategy:* manual protocol with a checklist; the live-API call is not part of CI. *Complexity:* S each. *Risk:* provider behaviour differing from the stub: fix the adapter and its contract test together.

**R-P1-10 · Present the working name honestly** *(F-23, constitution §3.3)*
- *Problem:* "Jun" appears as the headline and in the copyright line with no qualifier although it is unconfirmed.
- *Outcome:* while `displayNameConfirmed` is false, the footer carries a "working name" tag and the copyright credits the GitHub handle; confirming the name removes both automatically.
- *Depends on:* the owner (OWNER_CONTENT_NEEDED #1) may make this moot. *Acceptance:* a test asserts the tag appears iff the flag is false, in 3 languages; `profile.json` still `name: null`.
- *Test strategy:* unit + e2e. *Complexity:* S. *Risk:* low.

**R-P1-09 · Finish visibility coverage** *(F-22)*
- *Problem:* glossary, learning, reading, roadmap have no `visibility`; `skills.ts` keys projects by slug.
- *Outcome:* all modules support `visibility`; `skills.ts` evidence derives from listed projects only.
- *Depends on:* R-P1-04 (touches the same files). *Acceptance:* extended `visibility.test.ts` injects a private entry into each module and a private project and proves absence everywhere public.
- *Test strategy:* unit. *Complexity:* S. *Risk:* low.

---

## Optional

### P2 — recommended, improves coherence and exploration

**R-P2-01 · Real relations between content** *(F-14; Opportunity for discovery quality)*
- *Problem:* 33 of 37 content entries have no real relation; discovery and Ask fall back to topic siblings.
- *Outcome:* owner-approved `related` links (e.g. each mistake ↔ the decision it led to; each decision ↔ the concept it uses).
- *Depends on:* the Knowledge Organizer's proposals, owner judgement. *Acceptance:* Observatory "not connected to anything" ≤ 2; no link without a stated reason.
- *Test strategy:* existing graph/knowledge tests; data integrity. *Complexity:* S per batch. *Risk:* low; do not add links just to raise counts.

**R-P2-02 · Relations for top-level pages** *(F-15, S-3)*
- *Problem:* `/about` and similar pages have no recorded relations, so Surprise me falls back to any page.
- *Outcome:* each top-level page lists the content that cites it and its area siblings; the fallback becomes the exception.
- *Depends on:* R-P1-03. *Acceptance:* from every top-level page the destination is in a recorded set (test over all pages). *Complexity:* M. *Risk:* over-linking.

**R-P2-03 · Archive as a view** *(F-19)*
- *Problem:* Archive, Library "Mine", References, Reading Progress overlap.
- *Outcome:* one source (`library.ts` + `reading.ts` + references); Archive and Reading are views. *Depends on:* owner content for Library/Reading. *Acceptance:* no item defined in two files. *Complexity:* M. *Risk:* medium (identity of Archive).

**R-P2-04 · Idea stage history** *(Opportunity; previously postponed)*
- *Problem:* the Idea Incubator records one date, not the journey "spark → exploring → building → shipped".
- *Outcome:* optional `history: {stage, date}[]`, shown as a small timeline; feeds the Unified Timeline. *Depends on:* none. *Acceptance:* dates only from `history`. *Complexity:* S. *Risk:* none.

**R-P2-05 · Project Explorer** *(Opportunity; previously postponed)*
- *Problem:* case studies lack interactive architecture views.
- *Outcome:* for one or two projects, a diagram whose every box links to a file that proves it. *Depends on:* the owner picking projects and reading their code with me. *Acceptance:* every module and arrow has an evidence path (tested like `uses` edges). *Complexity:* L. *Risk:* diagrams that outrun the evidence; refuse to draw unverified boxes.

**R-P2-06 · Compare retrieval methods** *(Opportunity)*
- *Problem:* BM25 misses paraphrases. *Outcome:* a written question set (≥ 30 questions in 3 languages), BM25 baseline, and an embedding or hybrid prototype behind `retrieve()`; adopt only if it beats the baseline measurably. *Depends on:* a provider or local model decision. *Acceptance:* recorded precision@3; no new infrastructure unless it wins. *Complexity:* L. *Risk:* cost and a new dependency.

**R-P2-07 · Proposal appliers that open pull requests** *(Opportunity)*
- *Problem:* approving a proposal still means editing files by hand. *Outcome:* an applier that prepares a branch/patch for review; the owner remains the merger. *Depends on:* owner console in use for a while. *Acceptance:* no write to the default branch; patch reproduces exactly the proposal. *Complexity:* M. *Risk:* credentials: use a narrowly scoped token, never agent-held.

### P3 — experimental / low value now
- **R-P3-01 · Remove dead code** (F-18): `GithubIcon`, `Spot` `chain`. *S.*
- **R-P3-02 · Shared state for limits, budget and health** (F-21): only if more than one instance is deployed. *M.*
- **R-P3-03 · Bluesky read-only adapter** (Opportunity): first social integration through the SDK; verify the auth model first (sources disagree). *M.*
- **R-P3-04 · Webmention receiving / ActivityPub** (Opportunity): need an always-on receiver, storage and moderation; revisit only with a concrete wish. *L.*
- **R-P3-05 · SQLite store** (Opportunity): only if the audit log outgrows a file. *M.*

---

## Suggested order
1. **R-P0-01 → R-P0-04** (cheap, closes honesty and accessibility proof).
2. **R-P1-05, R-P1-07, R-P1-02** (small, remove inconsistency).
3. **R-P1-04, R-P1-03, R-P1-09, R-P1-10** (data foundation: one source per fact, one representation per entity).
4. **R-P0-03, R-P1-06** as soon as the owner can review.
5. **R-P1-01** (the largest, design-sensitive).
6. **R-P1-08** whenever the owner supplies a key and tracks.
7. P2/P3 only when a real need appears.

## Mapping check
Findings → items: F-05→R-P1-04 · F-07→R-P1-05 · F-09→R-P0-03, R-P1-06 · F-10→R-P1-01 · F-11→R-P1-02 · F-12→R-P1-03 · F-13→R-P1-07 · F-14→R-P2-01 · F-15→R-P2-02 · F-16→R-P0-04 · F-17→R-P0-01, R-P0-02, R-P1-08 · F-18→R-P3-01 · F-19→R-P2-03 · F-20→OWNER_CONTENT_NEEDED · F-21→R-P3-02 · F-22→R-P1-09 · F-23→R-P1-10 · F-24→fixed. Opportunities: R-P2-04, R-P2-05, R-P2-06, R-P2-07, R-P3-03, R-P3-04, R-P3-05.
