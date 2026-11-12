# Content guidelines

1. **Never invent.** No achievements, numbers, experience, opinions or links that the owner has not confirmed. If unknown, leave the field `undefined`: the site renders a labelled placeholder.
2. **Evidence for technology claims.** A technology belongs in a project's `stack` only with the file that proves it (`evidence`). README text is not evidence.
3. **English is the source.** Write `en` first. Add `ja`/`vi` as `{ text, status: "draft" }` (data files) or `translation: draft` (MDX) until a native speaker has reviewed them. Missing languages fall back to English *with a visible notice*.
4. **Japanese**: 丁寧語 (です・ます), natural phrasing, no word-for-word translation. **Vietnamese**: friendly, natural. Keep proper nouns and code identifiers unchanged.
5. **MDX notes.** `content/<garden|journal>/<id>/<locale>.mdx`. Required frontmatter: `title`, `summary`, `date` (YYYY-MM-DD). Optional: `updated`, `tags` (kebab-case; add a label under `tagNames` in each `messages/*.json`), `maturity` (garden: seedling/budding/evergreen), `related` (ids), `translation`. Shared fields (date, tags, related) are read from the English file. Run `npm run content:check`.
6. **No JavaScript in MDX.** Content is rendered with expression-blocking on; use Markdown, tables and code fences.
7. **Dates** are `YYYY-MM-DD` and formatted per locale at render time.
8. **Privacy.** Don't publish anything the owner has not approved (photos, location, employer, contact details).
