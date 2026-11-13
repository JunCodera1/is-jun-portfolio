# A Place Called Me

A personal digital ecosystem in English · 日本語 · Tiếng Việt: a world to wander, a site to read, a knowledge vault, and open feeds — connected to the open Internet and fully readable without it. See [docs/REDEFINITION.md](docs/REDEFINITION.md) for the product definition, architecture and decisions.
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · next-intl · MDX. Original SVG art, no 3D engine, no accounts, no tracking.

> Status: work in progress. See [PROJECT_STATUS.md](PROJECT_STATUS.md) and the generated
> [requirements traceability](docs/REQUIREMENTS_TRACEABILITY.md) for exactly what is done, tested and still open.

## Run it

```bash
npm install
cp .env.example .env.local      # optional; see "Environment" below
npm run dev                     # http://localhost:3000  → redirects to /en, /ja or /vi
```

Production build + checks:

```bash
npm run build && npm run start
npm run check                   # lint + typecheck + unit tests + content check + i18n status
npm run test:e2e                # Playwright against the production server (build first)
```

Playwright uses the system Chromium at `/usr/bin/chromium` locally; set `PLAYWRIGHT_CHROMIUM_PATH` to change it, or run
`npx playwright install chromium` and unset it in CI.

## Routes

| URL | What |
|---|---|
| `/{en,ja,vi}` | Entrance (title screen) |
| `/city` | The City (hub) · `/hideout` `/lab` `/station` `/arcade` `/archive` — the places · `/backstage` — hidden |
| `/classic` | The earlier site's Index; About, Projects, Journal, Garden, Now, Timeline, Japanese notes, News, Terminal, Search, Recruiter view |

Keys in the world: **Enter** start · **M** map · **← →** move between places · **Esc** close a panel. Sound is off until you turn it on.

## Where things live

| What | Where | Edit this to… |
|---|---|---|
| Owner facts (name, e-mail, links) | `src/content/data/profile.ts` | change who the site is about |
| Projects | `src/content/data/projects.ts` | add/remove/reorder projects (array order = site order) |
| Skills → project evidence | `src/content/data/skills.ts` | change the Craft page |
| About, Now, Interests, Timeline, Career | `src/content/data/{about,now,interests,timeline,education}.ts` | fill the placeholders |
| Navigation / Index order | `src/content/data/navigation.ts` | reorder or add pages |
| UI text, all languages | `messages/{en,ja,vi}.json` | change wording (keys must stay identical across files) |
| Notes and posts | `content/garden/<id>/{en,ja,vi}.mdx`, `content/journal/<id>/…` | write; a missing language falls back to English with a notice |
| World places, hotspots, secrets | `src/content/data/world.ts` | add a place (plus a scene and messages) |
| Station missions | `src/content/data/station.ts` | add vocabulary, kanji, grammar, conversation items |
| Archive shelves | `src/content/data/archive.ts` | add items (only confirmed ones) |
| Japanese journey | `src/content/data/japanese.ts` | level, goal, milestones, study log |
| Design tokens | `src/styles/globals.css` | colours, type, stage layer |

You never need to touch a component to change content. See [CONTENT_GUIDELINES.md](CONTENT_GUIDELINES.md) and
[CONTENT_NEEDED.md](CONTENT_NEEDED.md) (the exact list of things only the owner can supply).

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | for production | Canonical origin for canonical URLs, hreflang, sitemap, Open Graph. Falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3000`. Validated at build. |
| `GITHUB_TOKEN` | no | Server-only. Raises the GitHub API rate limit for the cached repository feed. Never commit it; never prefix it `NEXT_PUBLIC_`. |

## Tooling

`npm run i18n:status` (translation report → `docs/TRANSLATION_STATUS.md`) ·
`npm run content:check` (validate MDX frontmatter, relations, tags) ·
`npm run docs:traceability` (regenerate the requirements matrix from `docs/requirements/*.json`) ·
`npm run snapshot:github` (refresh the committed public-GitHub snapshot).

Deployment: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md). Decisions: [TECHNICAL_DECISIONS.md](TECHNICAL_DECISIONS.md).
