# Project status

Updated at each green build. Completion numbers come from the generated matrix, never from this file:
see [docs/REQUIREMENTS_TRACEABILITY.md](docs/REQUIREMENTS_TRACEABILITY.md).

## Right now

* Core site is built and statically generated in three languages; production build, 104 unit tests and 106 Playwright tests (routes ×3 locales, i18n, theme, palette, terminal, filters, overflow at 5 widths, axe in both themes) pass.
* Visual identity: editorial grid + owner-requested anime/manga layer.
* Requirements: see the traceability summary (IMPLEMENTED/TESTED/VERIFIED/DEFERRED/BLOCKED counts).

## In progress / next (in order)

1. Interaction layer (slanted, kinetic menu states; transitions that respect reduced motion).
2. Japanese hub: learning journey (owner placeholders), knowledge pages (kana, grammar), kana quiz as the first mini game.
3. Tech news page (Hacker News + Zenn trending, cached, titles only).
4. One original mascot (2–3 moods, decorative).
5. A second original mini game; re-measure Lighthouse on the final build.

New requests from the owner are tracked as **supplementary** in [FEATURES.md](FEATURES.md); they are not part of the 64-row percentages.

## Blocked on the owner

See [CONTENT_NEEDED.md](CONTENT_NEEDED.md). Nothing has been deployed or published under the owner's identity.
