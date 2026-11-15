# Owner content and decisions needed

*Only information and decisions that must come from the owner. Nothing here may be invented, guessed or derived by an assistant. Until an item is supplied, the product shows a labelled placeholder (or nothing), by design. This list replaces the older `CONTENT_NEEDED.md` for planning purposes (that file remains as the original checklist). Measured on 2026-11-15: placeholders on About 6, Now 5, Interests 5, Profile 2, Japanese hub 2, Timeline 1, Contact 1, Reading 1, Learning 1.*

**How to supply an item:** either send it in plain text (any of the three languages; say which language it is in) and ask for it to be entered, or edit the file named in "Where". Entries in Japanese or Vietnamese written by someone other than a reviewed native speaker are stored as `draft` until reviewed.

**Columns:** *Need* = why the product needs it · *Where* = file → what the visitor sees · *Required?* = needed for the product to match its own constitution, or optional · *Safe to publish?* = a plain statement of the privacy consideration. "Owner's call" means it is safe only if the owner is comfortable with it being public.

---

## A. Identity

| # | What | Need | Where | Required? | Safe to publish? |
|---|---|---|---|---|---|
| 1 | **Display name** — confirm the real name or a chosen nickname, or confirm "Jun" as the permanent name | "Jun" is a working name taken from the GitHub handle; the site cannot present a name nobody confirmed (constitution §3.3) | `src/content/data/profile.ts` (`displayName`, set `displayNameConfirmed: true`) → hero, header, footer, About, `profile.json`, terminal | **Required** | Owner's call. A nickname is fine and common |
| 2 | **Short self-introduction** (a few sentences; ideally in your own words and language) | The hero and About have an empty slot; the site is "personal-first" and this is its voice | `profile.ts` (`intro`) → hero | **Required** | Safe once you have read it; write nothing you would not say publicly |
| 3 | **Profile photograph or avatar** (an original image you have the right to use) + alt text | Makes the owner a person, not a handle | `profile.ts` (`avatar`) → About and hero | Optional | Owner's call: a photo identifies you; an illustration/avatar is safer |
| 4 | **Contact e-mail** you are happy to publish | The Contact page shows a placeholder and no mailto, by design | `profile.ts` (`email`) → Contact, `profile.json`, terminal `contact` | Optional | Owner's call. Public addresses attract spam; consider an alias |
| 5 | **Other social links** to publish (only GitHub is confirmed) | Identity verification across the web (`rel="me"`) and ways to reach you | `profile.ts` (`socialLinks` in `src/content/data/profile.ts`) → footer, Contact, `profile.json` | Optional | Confirm each one individually |
| 6 | **Location** (city, country, or none) | Only if you want it shown | `profile.ts` (`location`) | Optional | Privacy-sensitive; omit or keep coarse (country) |

## B. Personal content

| # | What | Need | Where | Required? | Safe to publish? |
|---|---|---|---|---|---|
| 7 | **About: your story** — background, journey, interests, values, goals (six prompts) | The About page is the core of a personal space and is currently six empty slots | `src/content/data/about.ts` → About | **Required** | Owner's call per paragraph; avoid third-party personal details |
| 8 | **Now** — what you are learning, building, reading, interested in, aiming for this season | Gives the site a living, dated pulse. The "updated" date appears **only** when you set it | `src/content/data/now.ts` (items + `nowUpdated`) → Now, Index row, terminal | Optional (recommended) | Safe; it is yours to curate |
| 9 | **Interests beyond what you stated** (confirmed items only); if you want it shown, **which Hunter × Hunter work you mean** (1999 anime, 2011 anime, manga) | Only Hunter × Hunter / Hisoka are confirmed; the Library card shows "the closest AniList match" because the work was not specified | `src/content/data/interests.ts`, `archive.ts`, `library.ts` → Interests, Archive, Library | Optional | Safe |
| 10 | **Milestones with real dates** — e.g. the date you passed N3, the date of the N2 exam you aim for, when you started Japanese; education, internships, work, training with real dates | The Unified Timeline shows only dated, verified events; today it holds site events and GitHub milestones only | `src/content/data/timeline.ts`, `japanese.ts` (`startedOn`, milestone `date`), `education.ts` → Timeline, Profile, Japanese hub, Hideout calendar | Optional, **never approximate a date** | Employer or school names and exact dates: owner's call |
| 11 | **Writing** — notes for the Garden, posts for the Journal, in your own words (any language) | Today there are 2 notes and 1 post, all about the site itself | `content/garden/<id>/`, `content/journal/<id>/` (`npm run new -- garden "Title"`) | Optional | Safe once you decide; mark `visibility: private` to keep a draft out |
| 12 | **Reading list** — books, articles, documents, with progress | Reading Progress has no entries; the module is built and waiting | `src/content/data/vault/reading.ts` → Vault › Reading | Optional | Safe |
| 13 | **Learning tracker and roadmap entries** — other technologies or skills you are learning (AI/ML, Linux…), dated log lines, milestones with real dates | The Learning Tracker holds only Japanese; its log is empty; the roadmap holds only JLPT | `vault/learning.ts`, `vault/roadmap.ts` | Optional | Safe; never log study that did not happen |
| 14 | **Library: tracks and favourites** — links from anywhere (YouTube, Spotify, SoundCloud…), anime and books you actually like | The "Mine" blocks show only Hunter × Hunter; the playlist is empty. Discover lists are public charts, not your taste | `src/content/data/library.ts` → Library | Optional | Safe; you are linking to public content |
| 15 | **Your own Vault entries** — mistakes, decisions, research and ideas from your own projects | Today they record how *this site* was built; yours would make the Vault personal | `vault/{mistakes,decisions,research,ideas}.ts` | Optional | Safe once you decide; use `visibility: "private"` for anything not for the public |

## C. Projects (the seven case studies)

| # | What | Need | Where | Required? | Safe to publish? |
|---|---|---|---|---|---|
| 16 | **Per project: problem, goals, your role, challenges, results, lessons** | Only the owner knows these; the case studies show them as labelled slots, and technical highlights come from the repositories | `src/content/data/projects.ts` (`caseStudy`) → Projects, Lab | **Required** for a truthful case study | Owner's call; check client or team confidentiality |
| 17 | **Confirmations about evidence** — which repositories are really yours to feature, which technologies you actually used (not only what a README claims), and the order | The Lab pins every technology to a file; forks and README-only claims are deliberately not featured | `projects.ts`, `skills.ts` → Lab, Profile, graph | Required | Safe |
| 18 | **Status per project** (in progress / shipped / paused / archived) and working demo links | Status is owner-controlled and unset; the SoundBox demo returned 404 and has no link | `projects.ts` (`status`, `demo`) | Optional | Safe |
| 19 | **Original images or screenshots** of your projects | The case studies have no images; none may be taken from others | `public/` + `projects.ts` | Optional | Check that screenshots show no private data or keys |

## D. Japanese learning content

| # | What | Need | Where | Required? | Safe to publish? |
|---|---|---|---|---|---|
| 20 | **Review the Japanese study material for correctness** — vocabulary and readings, kanji readings, grammar items and explanations, conversation scenes, kana and grammar reference pages | The material was drafted by an assistant at an approximate N3/N2 level and has not been reviewed; a wrong reading misleads a learner. You (N3) can catch most errors; flag the rest | `src/content/data/station.ts`, `kana.ts`, `japanese-knowledge.ts` → Station, Review, Kana, Grammar | **Required** before the product claims the material is accurate (roadmap R-P0-03) | Safe |
| 21 | **Study start date and goal wording**, if you want them shown | Journey cards show "not stated yet" | `japanese.ts` (`startedOn`, `goal`) → Japanese hub | Optional | Safe |

## E. Translation review

| # | What | Need | Where | Required? | Safe to publish? |
|---|---|---|---|---|---|
| 22 | **Vietnamese review** (you can do this yourself) | ~76 content items and all UI strings in Vietnamese are `draft`/unreviewed | content data files, `messages/vi.json` → every page in `/vi` | **Required** before removing "draft" tags | Safe |
| 23 | **Japanese review by a native speaker** (or an agreed limit, e.g. "N3-level review") | Same, for `/ja` | content data files, `messages/ja.json` | **Required** before removing "draft" tags | Safe |
| 24 | **Decision: keep English as the source language** and in which language you prefer to write new content | New writing needs one source language for the translation workflow | — | Required decision | — |

## F. Decisions only the owner can make

| # | Decision | Why it matters | Where it takes effect |
|---|---|---|---|
| 25 | **What is public, what is private, what must never appear** (topics to avoid, approval before publishing) | Visibility is a per-entry field; the default for owner-authored data is public | `visibility` on entries; `publishProfileJson` in `profile.ts` |
| 26 | **Whether to publish `profile.json` and the feeds** | They expose confirmed facts in machine-readable form | `profile.ts` (`publishProfileJson`), `feed.*` routes |
| 27 | **Whether to confirm the visual direction** (red/black/white manga identity, Mochi and Kuro) as the production look, and any design references you want honoured | The constitution preserves it; it is yours to confirm or change | `src/styles/globals.css`, `src/components/ui/Art.tsx` |
| 28 | **Whether to enable the AI model for `/ask`** (provider, key, daily budget) and **the owner console** (password hash, writable data directory) | Both are off by default and cost money or require hosting | server environment: `AI_PROVIDER`, `ANTHROPIC_API_KEY`, `AI_DAILY_REQUESTS`; `OWNER_PASSWORD_HASH`, `SESSION_SECRET`, `DATA_DIR` |
| 29 | **Where and when to deploy**; the real domain and host | Canonical URLs, hreflang, feeds and Open Graph need the real origin; nothing has been deployed | `NEXT_PUBLIC_SITE_URL`, hosting choice |
| 30 | **Rotate the credentials found in another public repository of yours** (reported privately earlier; the values are not repeated anywhere) | An exposed secret stays exposed even if the file is deleted | outside this repository |
| 31 | **Whether to rewrite git history** of this repository to remove an early commit that named that file (no values were committed here) | History rewrite is irreversible for anyone who cloned | this repository |

---

## What is *not* needed from the owner
Already confirmed and in use: IT student; software development, AI/ML and Linux; JLPT N3 passed, N2 in progress, N1 long-term; Hunter × Hunter and Hisoka. Technical facts about the seven projects that were verified from repository manifests and source (see `PROJECTS_REVIEW.md`). Site-build history (decisions, mistakes, research, log), which is true of this site and labelled as such.

## What no one may add on the owner's behalf
A real name, an e-mail, a photograph, a birth date, results, employment, opinions, hobbies, achievements, or any date, unless the owner supplies it.
