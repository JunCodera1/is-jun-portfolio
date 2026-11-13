# Features

Legend: ✅ built and tested · 🟡 built, owner content missing · ⏭ deferred (reason) · ➕ supplementary (not a spreadsheet row).

## Core (spreadsheet P0/P1)
✅ Three-language routing, switcher, saved choice, translation states · ✅ Theme system (system/light/dark) · ✅ Command palette (Ctrl/Cmd+K) · ✅ Simulated terminal · ✅ Global search · ✅ Projects + case studies · ✅ Journal (TOC, reading time, RSS) · ✅ Garden (maturity, tags, related) · ✅ Recruiter view
🟡 Home, About, Now, Interests, Timeline, Craft (education/experience), Contact — structure complete, owner facts needed

## Optional (spreadsheet P2/P3) — built
✅ Dashboard widgets (visitor clock/date, latest repository push) · ✅ GitHub API with cache + snapshot fallback

## Optional — deferred, with reasons
⏭ Guestbook (needs persistence, moderation, abuse protection; the site has no user-generated content by design) · ⏭ Code playground (needs a real sandbox) · ⏭ 3D workspace · ⏭ Supabase, React Flow (only needed by the above) · ⏭ Motion library (CSS covers every interaction)

## The world (owner request after the spreadsheet)
✅ Entrance, City, Hideout (6 interactive objects), Lab (case files + field notes), Station (7 missions, stamps), Arcade (5 games), Archive (shelves), Backstage (secret) · ✅ HUD, shutter transition, opt-in sound, local discoveries · ✅ Japanese notes (kana, grammar), tech news blog (9 sources: The Verge, Ars Technica, BBC, Hacker News, Lobsters, DEV, Zenn, GIGAZINE, VnExpress; filter by group/source) · ✅ Delight layer: magnetic cursor, ambient background tinted by time of day, "Time of day" theme (manual light/dark locks it), kinetic type, horizontal exhibition (projects, timeline), image reveal, solar-system map (`/orbit`), "Surprise me", Ctrl+K command center everywhere, hidden terminal (` key; theme/lang/go commands; easter eggs) · ✅ Knowledge graph (`/graph`: projects → technologies with repo evidence, notes via `related`, editable learning paths in `src/content/data/graph.ts`) · ✅ Review cards (spaced repetition, streak, browser speech) · ✅ Playlists (`/library`: your tracks from YouTube/Spotify/SoundCloud play in-page on click; other links open on their site; charts playlist with 30s Deezer previews via `/api/deezer-preview/[id]`) · ✅ Library (`/library`: owner shelf + music links from any site in `src/content/data/library.ts`; public Discover lists from AniList, Open Library, Deezer — labelled as not the owner's taste)
⏭ Listening practice (needs audio assets), reading comprehension

## Supplementary (owner requests after the spreadsheet)
➕ Anime/manga visual layer (shipped) · ➕ RSS feed (shipped) · ➕ Open Graph image (shipped)
➕ Persona-style interaction layer, Japanese hub (journey, kana, grammar), tech news, mascot, mini games — in progress, see PROJECT_STATUS.md
