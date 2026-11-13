# Content needed from the owner

Everything below is something the site cannot honestly invent. Fill it in the file shown; nothing else needs editing.

## Identity — `src/content/data/profile.ts`
* [ ] Real display name / nickname (currently **"Jun"**, an unconfirmed working name taken from the GitHub handle)
* [ ] Short introduction (3 languages) → `profile.intro`
* [ ] E-mail address you are happy to publish → `profile.email` (until then Contact shows a labelled placeholder, not a fake link)
* [ ] Location, if you want it shown → `profile.location`
* [ ] Avatar / photo, if any → `profile.avatar`
* [ ] Social links to publish (only GitHub is confirmed). Public candidates found on your GitHub profile that I did **not** publish without your confirmation: Facebook, YouTube, X/Twitter handle, Codeforces, LeetCode.

## Story — `src/content/data/about.ts`
* [ ] Story, background, journey, interests, values, goals (6 sections, each with a prompt on the page)

## Now / Interests / Timeline / Career
* [ ] `now.ts` — learning, building, reading, interested in, short-term goals (+ update `nowUpdated`)
* [ ] `interests.ts` — anime/manga, music, books, games, tools, other (confirmed items only)
* [ ] `timeline.ts` — personal milestones with real dates
* [ ] `education.ts` — education, internships, work, training, activities with real dates

## Projects — `src/content/data/projects.ts`
* [ ] Which repositories to feature and in what order
* [ ] Per project: problem, goals, your role, challenges, results, lessons (these are owner knowledge, shown as slots)
* [ ] Screenshots / images, demo confirmations (the SoundBox demo returned 404 and has no link)
* [ ] `status` (in progress / shipped / paused / archived) per project

## Translations
* [ ] Native review of the Japanese and Vietnamese copy (currently labelled "draft"): see `docs/TRANSLATION_STATUS.md`

## Design & privacy
* [ ] 3–5 design reference sites/images
* [ ] What is public, what is private, topics to avoid, content to approve before publishing
* [ ] Confirm the owner-requested anime direction is what you want to keep for production

## Housekeeping
* [ ] Rotate credentials found in another public repository of yours (reported in the chat; not repeated here)
* [ ] Set `NEXT_PUBLIC_SITE_URL` to the real domain before deploying


## Knowledge Vault (added)
Seeded only with what really happened while building this site. Still waiting for the owner's own entries (edit the files in `src/content/data/vault/`):
- `reading.ts` — books, articles and documents with progress (empty).
- `learning.ts` — study-log lines (date, minutes, note) and more topics than Japanese.
- `roadmap.ts` — tracks beyond JLPT (AI/ML, Linux…), with dates when known.
- `mistakes.ts`, `decisions.ts`, `research.ts`, `ideas.ts` — the owner's own entries from their projects.
- `concepts.ts` — more explainers; Japanese/Vietnamese translations of the concept bodies (titles and summaries are drafts, bodies are English).
- `glossary.ts` — more terms; native review of the ja/vi wording.
