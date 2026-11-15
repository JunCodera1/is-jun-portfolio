# Experience standards — acceptance criteria

*Each criterion is written so a test can fail it. The last column says what proves it today (an existing test) or which roadmap item adds the missing proof (`R-…` ids are in [EVOLUTION_ROADMAP.md](EVOLUTION_ROADMAP.md)). "gap" means the criterion is required but not yet proven. Criteria describe the product as intended by [PRODUCT_CONSTITUTION.md](PRODUCT_CONSTITUTION.md); where the code falls short, [FEATURE_AUDIT.md](FEATURE_AUDIT.md) records the finding.*

Conventions: "every page" = the 38 paths in `tests/e2e/helpers.ts` × `en`/`ja`/`vi`. "A11y" = axe WCAG 2.1 A/AA in light and dark (`tests/e2e/quality.spec.ts`). "Console clean" = no console error or warning and no uncaught exception (`trackConsole`).

## 1. Wander
| # | Criterion | Proof |
|---|---|---|
| W-1 | `/` shows the title, a start action reachable by Enter, Space, click and Tab; **Ctrl+K and `` ` `` work on it**; sound is off | `world.spec.ts` (entrance, sound), `delight.spec.ts` (entrance palette), `redesign.spec.ts` (title in 3 languages) |
| W-2 | The City has exactly five place links and three hidden things; each is a real `<a>`/`<button>`, reachable by Tab and ←/→; `M` returns to the map from any place | `world.spec.ts` |
| W-3 | The Hideout has exactly six objects; each opens a panel with real content or an intentional interaction; opening all six records a discovery; the window toggles day/night | `world.spec.ts` |
| W-4 | The Lab shows all seven projects; every technology listed names the evidence file/breakdown and the repository; links are real; no technology without evidence | `world.spec.ts`; `knowledge.test.ts` (every `uses` edge has evidence) |
| W-5 | A Station mission is playable end to end; ≥ 80 % earns a stamp that persists; a wrong answer shows the explanation and never stamps; completing counts as a study day | `world.spec.ts`, `station.test.ts`, `review.spec.ts` |
| W-6 | The Arcade offers exactly five games; each is keyboard-operable, lazy-loaded, works when `localStorage` is blocked, and ends with a result | Kana Blitz, Kana Match, Reaction: `play.spec.ts`, `world.spec.ts`. **gap:** Vocabulary Speedrun, Typing Sprint (R-P0-02) |
| W-7 | Archive items state their source (owner / GitHub / public); empty shelves are labelled | `world.spec.ts` |
| W-8 | Backstage opens by the three secrets or the Konami code, is `noindex`, and is absent from the sitemap | `world.spec.ts`, `sitemap.test.ts` |
| W-9 | Every Wander page has a non-pointer path: all hotspots are focusable controls and each place also appears as a list | `world.spec.ts`, axe on all world paths |
| W-10 | On a 390 px touch screen the City and Hideout are fully usable **without horizontal panning** | **gap:** measured 1 000 px / 960 px pan areas (R-P1-01) |
| W-11 | The Knowledge Graph shows every public project, technology, note, Vault entry, path and topic; selecting a node shows summary, provenance and connected nodes; a list twin exists; labels never overlap in any locale | `graph.spec.ts`, `redesign.spec.ts`, `knowledge.test.ts` (overlap test ×3 locales) |

## 2. Read
| # | Criterion | Proof |
|---|---|---|
| R-1 | About, Now, Interests, Contact, Profile render owner facts **only** from `profile.ts`/`japanese.ts`/data files; every missing fact is a labelled placeholder (`[data-placeholder]`); no placeholder looks like real content; no date is shown that the owner did not set (Now "updated"); the working name is never claimed as the real name | `interaction.spec.ts` ("contact: no fake mailto"), `play.spec.ts` ("owner facts are labelled placeholders") |
| R-2 | Garden and Journal render MDX with table of contents, reading time, localized dates; list filters work; a missing locale file shows the English text with a visible tag | `i18n.spec.ts`, `interaction.spec.ts` |
| R-3 | Each of the seven projects has a case study whose technologies, repositories and demo (if any) are evidenced; unknown sections are labelled | `interaction.spec.ts`, `data.test.ts` |
| R-4 | The Profile can be printed: header/footer/controls hidden, evidence preserved | **gap:** print output untested (R-P0-02) |
| R-5 | The Unified Timeline lists only items with a real ISO date, newest first, from notes, posts, Vault entries, the site log and verified milestones; filters hide groups without removing them from the document; every item names its source | `redesign.spec.ts` |
| R-6 | Content with `visibility` other than `public` appears in no list, no sitemap entry, no feed, no search result, no Ask answer; a `private` note's URL is a 404 | `visibility.test.ts`, `sitemap.test.ts`, `content.test.ts` |

## 3. Knowledge Vault
| # | Criterion | Proof |
|---|---|---|
| V-1 | The hub links to all nine modules; every module page has the section tabs; counts equal the number of *listed* entries | `vault.spec.ts`, `visibility.test.ts` |
| V-2 | All modules read from `src/content/data/vault/*` through one projection; ids are unique, dates are ISO, topics valid, sources https; no invented personal data (Reading and Learning log start empty, no roadmap date) | `vault.test.ts` |
| V-3 | Each concept has a diagram with a text alternative; the Leitner diagram uses the real `review()` function | `vault.spec.ts` |
| V-4 | The Decision Journal marks superseded decisions and links to the replacement | `vault.spec.ts`, `knowledge.test.ts` |
| V-5 | The Glossary has every term in en/ja/vi and is searchable in any of them, with or without accents | `vault.spec.ts`, `vault.test.ts` |
| V-6 | Empty modules explain how to fill them; none shows invented entries | `vault.spec.ts` |
| V-7 | Vault entries are findable through Ctrl+K and Ask | `vault.spec.ts`, `ecosystem.spec.ts`. **gap:** glossary terms are not in Ask (R-P1-03) |

## 4. Japanese learning
| # | Criterion | Proof |
|---|---|---|
| J-1 | A review session grades cards, persists box and due date per card in the browser, and the streak counts only real study days | `srs.test.ts`, `review.spec.ts` |
| J-2 | Progress is labelled "only in this browser"; nothing is preloaded | `review.spec.ts`, `vault.test.ts` |
| J-3 | The kana tables are complete (46 basic + 25 voiced per script) with correct `lang` | `play.spec.ts`, `japanese.test.ts` |
| J-4 | Every Japanese vocabulary, kanji-reading, grammar and conversation item carries a review state; unreviewed items are visibly marked and listed for the owner | **gap** (R-P0-03) |
| J-5 | Browser speech appears only where supported, never plays automatically, and is labelled as the browser's voice | `review.spec.ts` (no autoplay); manual cross-browser check recorded in the roadmap |

## 5. Beyond
| # | Criterion | Proof |
|---|---|---|
| B-1 | Each news source and each library service runs through the Integration SDK; one failing never affects the others; the page states how many sources loaded | `integrations-adapters.test.ts`, `degraded.spec.ts` |
| B-2 | With every integration down, `/news`, `/library` and the Observatory still render with honest empty states and no invented cards | `degraded.spec.ts` |
| B-3 | External text is plain text; links are http(s) with `rel="noopener noreferrer nofollow"`; images come only from allow-listed hosts | `japanese.test.ts` (parsers), `quality.spec.ts`, `play.spec.ts` |
| B-4 | Nothing plays or loads a third party before the visitor chooses a track; every track is playable by keyboard; links that cannot embed open on their own site | `playlist.spec.ts`. **gap:** owner embeds untested with real data (R-P1-08) |
| B-5 | The preview endpoint accepts only numeric ids and never redirects off Deezer's CDN; it goes through the SDK | `playlist.spec.ts`. **gap:** SDK use (R-P1-02) |
| B-6 | Owner-authored content and external data are visibly different (labels: source, "public charts, not the owner's picks", "closest AniList match") | **gap:** the labels exist in the messages but no test asserts them (R-P0-02) |

## 6. Connect and Observatory
| # | Criterion | Proof |
|---|---|---|
| C-1 | `/{locale}/feed.json` is valid JSON Feed 1.1, newest first, absolute URLs, public items only, in all locales | `redesign.spec.ts`, `knowledge.test.ts` |
| C-2 | `/{locale}/feed.xml` is well-formed RSS and carries the same public dated items as the JSON feed | `routes.spec.ts` (well-formed). **gap:** parity (R-P1-07) |
| C-3 | `/profile.json` contains only confirmed fields (`name: null` while unconfirmed, no e-mail unless published), `rel="me"` links and the feed URLs; it can be switched off | `redesign.spec.ts` |
| C-4 | The Observatory lists all 13 integrations with status, source (live / cached / saved copy), latency, **time checked**, and attribution link; says the data is not live; works when all are down | `ecosystem.spec.ts`, `degraded.spec.ts` |
| C-5 | Language coverage shows translated / draft / missing counts per locale, derived from data, with a "next to translate" list; no percentage that cannot be recomputed | `ecosystem.spec.ts`, `redesign.spec.ts` |
| C-6 | Graph gaps list unconnected entries and rule-based suggestions that are never written automatically | `redesign.spec.ts`, `knowledge.test.ts` |

## 7. Ask
| # | Criterion | Proof |
|---|---|---|
| A-1 | Every answer names its mode and label, confidence, and sources with origin, evidence and authorship | `api-ask.test.ts`, `ecosystem.spec.ts` |
| A-2 | Facts, inferred relations and suggestions are separate fields and separate UI sections | `ai.test.ts`, `ecosystem.spec.ts` |
| A-3 | With no matching source, the answer is "Nothing on this site answers that." with no sources | `ai.test.ts`, `ecosystem.spec.ts` |
| A-4 | A generated answer with no citation, an unknown citation, a foreign URL or excess length is rejected and replaced by quotes | `ai.test.ts` |
| A-5 | With no model, with the budget spent, or on provider error, the page still answers by quoting | `ai.test.ts` |
| A-6 | The corpus is public items only; private/restricted/AI-authored text never enters the prompt or the response | `visibility.test.ts`, `ai.test.ts` |
| A-7 | The endpoint validates input, rejects cross-site posts, rate-limits per client, and returns generic errors | `api-ask.test.ts` |
| A-8 | Works for questions in English, Japanese and Vietnamese (with or without accents) | `api-ask.test.ts`, `ecosystem.spec.ts` |
| A-9 | The Anthropic adapter matches the live API | **gap:** never run live (R-P1-08) |

## 8. Command palette (Ctrl/⌘+K)
| # | Criterion | Proof |
|---|---|---|
| P-1 | Opens on **every page, including `/` and Wander pages**; Esc closes; Enter runs the highlighted option; the visible button works for pointer/touch | `interaction.spec.ts`, `delight.spec.ts` |
| P-2 | Searches pages, projects, notes, posts and Vault entries, in the current UI language, accent- and width-insensitively; degrades to pages + actions if the index fails | `interaction.spec.ts`, `vault.spec.ts` |
| P-3 | Actions: theme (system/auto/light/dark), language, terminal, copy link, back to top, Surprise me, GitHub | `delight.spec.ts`, `interaction.spec.ts` |
| P-4 | It is a labelled combobox with `aria-activedescendant`; focus returns to the page on close | `interaction.spec.ts`, axe |

## 9. Hidden terminal (`` ` ``)
| # | Criterion | Proof |
|---|---|---|
| T-1 | Opens on every page by `` ` `` or the footer button, never while typing in a field; Esc/`exit` closes; focus lands on the input | `delight.spec.ts` |
| T-2 | Only a fixed command table runs; unknown input, prototype keys (`constructor`, `__proto__`) and shell-like input produce one error line and never an action | `terminal.test.ts` |
| T-3 | `theme`, `lang`, `go` accept only whitelisted arguments; a bad argument prints usage and does nothing | `terminal.test.ts`, `delight.spec.ts` |
| T-4 | Output is built from public data and localized; a hint says some commands are not listed | `delight.spec.ts`, `interaction.spec.ts` |

## 10. Surprise me
| # | Criterion | Proof |
|---|---|---|
| S-1 | It never stays on the current page | `discover.test.ts`, `delight.spec.ts` |
| S-2 | From a page with recorded relations it lands on one of them (edge, back-reference or shared topic) every time | `discover.test.ts`, `redesign.spec.ts` |
| S-3 | From a page with **no** recorded relation the fallback is documented and, as roadmap R-P2-02 lands, replaced by area siblings | covered as a known gap (F-15) |
| S-4 | It is reachable by keyboard (palette, terminal `surprise`, home button) | `delight.spec.ts` |

## 11. Adaptive theme
| # | Criterion | Proof |
|---|---|---|
| H-1 | System, Time of day, Light, Dark; the choice persists across reloads and is applied before first paint | `interaction.spec.ts`, `delight.spec.ts` |
| H-2 | Time of day: light 06:00–17:59 local, dark otherwise, re-checked every minute; the inline script and the helper agree for all 24 hours | `theme.test.ts`, `delight.spec.ts` |
| H-3 | A manual Light/Dark choice overrides the clock; a blocked `localStorage` never breaks the page | `delight.spec.ts`, `interaction.spec.ts` |
| H-4 | Both themes pass contrast (every text/background pair) and axe on every page | `contrast.test.ts`, `quality.spec.ts` |

## 12. Responsive layouts and touch
| # | Criterion | Proof |
|---|---|---|
| L-1 | No horizontal page scroll at 375, 430, 768, 1366, 1920 px on every page in every locale | `quality.spec.ts` |
| L-2 | Header controls are ≥ 36 px (≥ 44 px on coarse pointers); the bottom dock is shown below `lg` and each tab is a real link | `quality.spec.ts` |
| L-3 | Pointer-only effects (magnetic cursor, ambient drift, pinned horizontal scroll) are absent on touch; the exhibition becomes a swipeable row with buttons | `exhibit.spec.ts` (exhibition). **gap:** cursor and ambient drift on a touch context are not asserted (R-P0-04) |
| L-4 | Wander pages are touch-first, not shrunken desktop | **gap** (R-P1-01) |

## 13. Reduced motion
| # | Criterion | Proof |
|---|---|---|
| M-1 | With `prefers-reduced-motion: reduce`: no shutter, no letter animation, no cursor ring, no ambient drift, no staggered reveals, no idle float, no smooth scroll; content is fully visible and in final position | partial: `world.spec.ts`, `delight.spec.ts`, `exhibit.spec.ts`, `interaction.spec.ts`. **gap:** one sweep over the main pages asserting `document.getAnimations().length === 0` and no effect-set inline transforms (R-P0-04) |
| M-2 | Effects never remove information: text is never animated through opacity; the real sentence stays available to screen readers | `exhibit.spec.ts` (kinetic text), `contrast.test.ts` |
| M-3 | Sound never plays without a user gesture and is off by default | `world.spec.ts` |

## 14. Keyboard navigation and focus
| # | Criterion | Proof |
|---|---|---|
| K-1 | The skip link is the first tab stop and moves focus to `main`; focus is always visible | `interaction.spec.ts` |
| K-2 | Every interactive element in Wander, the graph, the Vault filters, Ask, the playlist and the owner console is reachable and operable without a pointer | `world.spec.ts`, `graph.spec.ts`, `vault.spec.ts`, `playlist.spec.ts`, `owner.spec.ts` |
| K-3 | No essential function depends on a key sequence: the Konami code and `` ` `` are conveniences with menu/palette/footer equivalents | `world.spec.ts`, `delight.spec.ts` |
| K-4 | Dialogs (palette, terminal, panels) trap focus, close on Esc, and return focus | `interaction.spec.ts`, `delight.spec.ts`, axe on open dialogs |

## 15. Empty and failure states
| # | Criterion | Proof |
|---|---|---|
| E-1 | Every list that can be empty explains why and how to fill it (placeholders, "no tracks added yet", "nothing waiting") | `vault.spec.ts`, `play.spec.ts` |
| E-2 | Every external feed shows a retry-aware empty message, never an error page or fake content | `play.spec.ts`, `degraded.spec.ts` |
| E-3 | `/ask` shows distinct messages for rate limit, error and no answer | `ecosystem.spec.ts` |
| E-4 | Unknown routes render the localized 404 inside the layout; removed pages redirect (`/play`, `/recruiter`, `/terminal`, `/links`, `/log`, `/orbit`) with status 200 at the destination | `routes.spec.ts`, `redesign.spec.ts` |
| E-5 | The owner console and its API are plain 404s unless fully configured; a configured console rejects cookie-less and cross-site requests | `ecosystem.spec.ts`, `owner.spec.ts`, `owner-api.test.ts` |
| E-6 | A blocked `localStorage` degrades progress features silently without errors | `interaction.spec.ts`, `play.spec.ts` |

## 16. Release gate
A change is releasable only when, on a production build: `tsc --noEmit` and `eslint .` are clean; all unit and e2e tests pass (no skips added); axe is clean in both themes and three locales; no horizontal overflow at the five widths; `tests/e2e/degraded.spec.ts` passes; and the checklist in §1–§15 has no *new* gap.
