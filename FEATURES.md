# Features

*A Place Called Me.* Legend: ✅ built and tested · 🟡 built, owner content missing · ⏭ postponed (reason). Design rationale: [docs/REDEFINITION.md](docs/REDEFINITION.md).

## Wander (the world)
✅ Entrance → City → Hideout, Lab, Station, Arcade, Archive, Backstage (secret) · ✅ HUD, shutter transition, opt-in sound, local discoveries · ✅ Knowledge graph (`/graph`, one map of projects, technologies, notes, Vault entries, learning paths and topics; find-a-node, provenance, list twin) · ✅ Discovery Engine (🎲, Ctrl+K, terminal `surprise`: follows real connections 60% of the time)

## Read (the classic site)
✅ About, Now, Interests, Garden, Journal, Projects (+ exhibition), Profile (printable) · 🟡 owner facts still missing, see CONTENT_NEEDED.md · ✅ **Knowledge Vault** (`/vault`: Concept Explainer with interactive diagrams, Research Notes, Mistake Archive, Decision Journal, Idea Incubator, 3-language Glossary, Reading & references, Learning Tracker, Learning Roadmap) · ✅ **Unified Timeline** (`/timeline`: notes, posts, Vault entries, site log and milestones with real dates, filterable)

## Japanese
✅ Hub, Kana, Grammar · ✅ Review cards (spaced repetition, streak, heatmap, browser speech) · ✅ Station missions · ✅ Arcade games · ⏭ Listening practice (needs audio)

## Outside
✅ Tech news (9 sources, filters) · ✅ Library (AniList, Open Library, Deezer covers; playable playlists) · all fail gracefully

## Connect
✅ `feed.json` (JSON Feed 1.1) and `feed.xml` per language · ✅ `profile.json` (only confirmed fields; `name: null` until the owner confirms it; switch off in profile.ts) · ✅ `rel="me"` identity links, feed discovery tags · ✅ **Observatory** (`/observatory`: source health, language coverage, graph gaps, rule-based link suggestions)

## Tools and feel
✅ Ctrl+K command center (everywhere, including the world) · ✅ Hidden terminal (`` ` ``, footer button; theme/lang/go/surprise; easter eggs) · ✅ Time-of-day theme + ambient light · ✅ Magnetic cursor, kinetic type, exhibition scroll (all pointer-only and off under reduced motion)

## Data layer
✅ `src/lib/knowledge`: one model (`Item`, `Edge`) with provenance, visibility (`public`/`unlisted`/`private`) and status; search, graph, timeline, feeds and discovery are projections of it. Only public items leave the site (tested).

## Merged or removed (all old URLs redirect)
`/play` → `/arcade` · `/recruiter` → `/profile` · `/terminal` → overlay · `/links` → `/vault/reading` · `/log` → `/timeline` · `/orbit` → `/graph` · image veil, header float and pointer parallax removed.

## Postponed
⏭ Semantic search / RAG / AI assistant (needs a model service; the data layer is the prerequisite) · ⏭ Webmention and ActivityPub (need an always-on receiver, storage, moderation) · ⏭ Guestbook · ⏭ 3D workspace · ⏭ Code playground · ⏭ Project explorer diagrams (needs verified architecture per project) · ⏭ Idea stage history
