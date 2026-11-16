# A Place Called Me — Product Constitution

*Status: authoritative. Written 2026-11-15 against commit `27d1f0e` plus the small fixes listed in [FEATURE_AUDIT.md](FEATURE_AUDIT.md) §4. When this document and another document disagree, this one wins; when this document and the code disagree, the difference is a defect to record in the audit, not a reason to rewrite the constitution quietly.*

Companion documents: [ARCHITECTURE_GOVERNANCE.md](ARCHITECTURE_GOVERNANCE.md) · [FEATURE_AUDIT.md](FEATURE_AUDIT.md) · [EXPERIENCE_STANDARDS.md](EXPERIENCE_STANDARDS.md) · [EVOLUTION_ROADMAP.md](EVOLUTION_ROADMAP.md) · [OWNER_CONTENT_NEEDED.md](OWNER_CONTENT_NEEDED.md). Earlier history: [../REDEFINITION.md](../REDEFINITION.md), [../ecosystem/ARCHITECTURE.md](../ecosystem/ARCHITECTURE.md).

---

## 1. Product definition

**A Place Called Me** is a personal digital space in three languages (English, 日本語, Tiếng Việt). It is not a CV and not a developer portfolio. It is, at the same time:

1. **a world** a visitor can explore (Wander);
2. **a place to read** personal and technical writing (Read);
3. **a knowledge environment** (the Knowledge Vault and the Knowledge Graph);
4. **a window** onto selected external data (Beyond);
5. **a digital representation of its owner**, made only of what the owner has confirmed.

Three promises hold the product together:

- **It is personal.** Distinctive voice, original art, an identity that cannot be mistaken for a template.
- **It is honest.** Every personal fact, date, statistic, integration status and project claim has a source; what is unknown is shown as unknown.
- **It is independent.** The public experience stays readable and useful when every external service, every AI model and every optional owner feature is unavailable.

## 2. Target experience

A first-time visitor should, within a minute, understand that this is one person's own place, find something worth reading or playing, and be able to leave with a true picture of who the owner is, never an invented one. The owner should be able to understand, control and evolve every part of it from files in Git.

Qualities, in priority order: **truthful · personal · explorable · readable · accessible · fast · maintainable.** When two conflict, the earlier one wins.

## 3. Owner identity boundaries

### 3.1 What is confirmed (stated by the owner)
- An IT student.
- Interested in software development, AI/ML and Linux.
- Passed JLPT N3; currently studying N2 (N1 is a long-term aim, also stated by the owner).
- Interested in Hunter × Hunter, particularly Hisoka.
- Display name "Jun"; fourth-year IT student from Vietnam; passed JLPT N3 on 2026-08-27; interests in anime, films, Japanese music, AI-assisted development, Unreal Engine/3D (supplied by the owner on 2026-11-16, in `about.ts`, `interests.ts`, `now.ts`). The owner chose not to publish some personal details; they stay out.

Where it lives: `src/content/data/profile.ts` (`facts`), `src/content/data/japanese.ts` (`level`, `goal`, `milestones`). These are the only places personal facts may originate.

### 3.2 What is *not* confirmed and must stay unfilled
Real name beyond the display name "Jun" (confirmed by the owner on 2026-11-16; `displayNameConfirmed: true`, so `profile.json` publishes `name: "Jun"`), e-mail, profile photograph, birth date, location, academic results beyond those above, employment history, personal opinions, further hobbies, project achievements, and any historical dates (including the date N3 was passed).

### 3.3 The rule for gaps
A missing fact is rendered as a labelled placeholder (`src/components/ui/Placeholder.tsx`), never as plausible text. A dated claim without a real date shows no date (for example the Now page shows no "updated" date until the owner sets `nowUpdated`). The display name "Jun" is confirmed by the owner; nothing beyond it (real name, surname) may be implied.

## 4. The five product areas

### Area 1 — Wander
The entrance and the explorable world. **Fixed set of places; do not add more without a product reason recorded in the roadmap.**
- **Entrance → City** (hub with five places and three hidden things).
- **Hideout**: a room with exactly six interactive objects; every object has real content or an intentional interaction.
- **Lab**: the seven projects as case files; every technology pinned to evidence in a repository (a file, a manifest entry, or the GitHub language breakdown). Evidence is never invented.
- **Station**: Japanese learning routes and missions, sharing data with the review cards.
- **Arcade**: five original, lightweight games in the product's style.
- **Archive**: a library-like space of source-labelled items.
- **Backstage**: one secret room (found via the hidden things or the Konami code; `noindex`).
- **Knowledge Graph** (`/graph`): one map of projects, technologies, notes, Vault entries, learning paths and topics.

### Area 2 — Read
The editorial side: **About, Now, Interests, Garden, Journal** (MDX), **seven project case studies**, a **printable Profile**, and a **Unified Timeline** that combines notes, posts, Vault entries, the site log and verified milestones — only events with real, verifiable dates.

**Knowledge Vault** — nine modules on one data foundation (typed files under `src/content/data/vault/`, projected through the unified data layer): Concept Explainer (interactive diagrams), Research Notes, Mistake Archive, Decision Journal, Idea Incubator, three-language Glossary, Reading Progress, Learning Tracker, Learning Roadmap. They are one system with nine views, not nine applications.

### Area 3 — Japanese learning
Spaced-repetition review cards (Leitner boxes), study streak and heatmap, kana, grammar, and the Station tasks. Actual learning progress (stored only in the visitor's browser and labelled as such) is kept apart from configured or demo data; no streak or history is ever fabricated. Japanese text, readings and explanations must be reviewable and correctable by the owner.

### Area 4 — Beyond
External information and entertainment: tech news (nine sources), the anime library (AniList), the book library (Open Library), the music library (Deezer) and playlists that play on the page. Every service goes through the shared Integration SDK. External data is always distinguishable from owner-authored content. When a service is down the page shows an honest fallback; it never shows invented live activity and never implies an account is connected.

### Area 5 — Connect
The product's public information in machine-readable form and its operational honesty: **JSON Feed, RSS, `profile.json`, and the Observatory** (which integrations answer, translation completeness, knowledge-graph gaps). Every number on the Observatory is derived from data; no arbitrary percentages.

## 5. Global experiences
| Experience | Definition |
|---|---|
| **Ask** (`/ask`) | A grounded assistant over the site's public content: real sources with provenance; facts, inferred relations and suggestions kept apart; says "nothing here answers that" when true; rejects fabricated citations and URLs; honest quoted fallback without an AI model. |
| **Command palette** (Ctrl/⌘+K) | Available on **every** page including the entrance and the world; meaningful navigation, search and actions. |
| **Hidden terminal** (`` ` ``) | A simulated terminal over the site's own data (theme, language, navigation, easter eggs). It never runs an operating-system command and only maps text to a fixed command table. |
| **Surprise me** (🎲) | Goes to content **genuinely related** to the current page (recorded edges, back-references, shared topic). Only when the page has no recorded relation does it fall back to any public page, because stopping would be worse; this fallback is a known gap (see roadmap). |
| **Adaptive theme** | System, time-of-day (light 06:00–18:00 local) and manual light/dark. A manual choice always overrides automatic modes. |

## 6. Visual identity
Red, black and white, manga-inspired: bold italic display type, hard shadows, speech bubbles, screentone, original SVG art, and two original characters — **Mochi** (mascot) and **Kuro** (cat). Everything drawn here is original. Hunter × Hunter may be named as an interest, but no franchise character art, logo, screenshot or sound is used or imitated.

Motion: anime.js effects, magnetic cursor, animated type and horizontal scrolling are **enhancements**, only active for pointer devices, and fully off (or replaced by static equivalents) under reduced motion. **Sound is off by default.** Mobile receives a deliberate touch-first experience (bottom navigation, swipeable rows, list alternatives to map views), not a shrunken desktop.

## 7. Content principles
1. **Git is the source of truth.** Structured TypeScript data and MDX. Public content is reproducible from the repository.
2. **One fact, one place.** A personal fact is entered once; everything else derives from it (see audit finding F-05 for places that still repeat the JLPT facts).
3. **Provenance on everything shown as fact** (`Item.provenance`), with evidence where it exists.
4. **Dates are real or absent.**
5. **Translation honesty.** Every content entry has a state — `translated` (reviewed), `draft` (written, not reviewed by a native speaker), `untranslated` (shown in English with a visible tag). A draft is never presented as approved. (UI message files do not yet carry a review state; see audit F-09.)
6. **AI-generated text is labelled** and never mixed into owner-authored content without the owner's approval.

## 8. Technical principles (summary; full rules in ARCHITECTURE_GOVERNANCE.md)
Next.js 16 · React 19 · TypeScript · Tailwind 4 · next-intl, kept unless evidence demands change. No CMS, no database, no microservices, no message broker, no vector database. One unified public data layer feeds search, graph, timeline, feeds, discovery, Ask and the Observatory. Every external service goes through the Integration SDK. The owner console and agents exist only when fully configured; agents propose, the owner applies.

## 9. Security and privacy principles
- **Public by explicit approval.** Only entries with `visibility: "public"` (or omitted) reach pages, indexes, feeds, the assistant's context or the open profile. `unlisted`, `private`, `restricted` never do.
- **Private data has its own boundary** (`DATA_DIR`, owner console), never in Git, never in a public bundle, never in a log.
- **Secrets stay on the server** and are redacted from logs and errors.
- **External text is data**: rendered as plain text, links http(s) only, images from an allow-list.
- **Fail closed**: the owner console is a 404 unless completely configured.
- **Owner authority**: the owner decides identity, personal content, permissions, connections and publication. No agent publishes, deletes, touches credentials or acts irreversibly.

## 10. Accessibility principles
Essential content and navigation never depend only on animation, audio, hover, keyboard sequences or pointer effects. Every map or canvas-like view has a list equivalent. Focus is visible; contrast is a tested property; reduced motion is honoured; text alternatives exist for diagrams; the site works in light and dark; WCAG 2.1 AA is checked automatically on every page in every locale.

## 11. Non-goals
Not a SaaS dashboard, not a CMS, not a social network, not a store; no accounts for visitors, no user-generated content, no analytics or tracking by default, no fake activity feeds, no decorative statistics, no mandatory third-party service, no 3D engine, no feature added only because it is technically interesting.

## 12. Feature acceptance rules
A feature may be added only if **all** hold:
1. It strengthens the identity or the utility of the product and says how (identity over feature count).
2. It does not duplicate an existing capability; if it overlaps, they are merged (one capability, one system).
3. Every fact it shows has a source; every number is derived.
4. It works without JavaScript effects, AI, integrations and optional owner services (graceful independence, progressive enhancement).
5. It cannot leak non-public data (privacy by design) and respects `visibility`.
6. It has keyboard and screen-reader access, a reduced-motion behaviour, and a touch layout.
7. It exists in three languages with honest translation states.
8. Its failure state is designed and tested; it never shows a fake success.
9. It adds no database, service or dependency without a recorded, evidenced need.
10. It has tests, and the existing tests are not weakened to admit it.

## 13. How this document changes
Changing the constitution requires an entry in the Decision Journal (`src/content/data/vault/decisions.ts`) stating context, decision, reason and cost, and an update of the affected companion documents in the same change. The owner has the final say on §3 (identity) and §9 (publication).
