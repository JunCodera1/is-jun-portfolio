/**
 * Personal Library — owner-controlled part.
 * `shelf` = things the owner has said they like; each is looked up on a public API so its card carries real data.
 * `music` = any link from anywhere (YouTube, SoundCloud, Bandcamp, Apple Music, Spotify, a file…). Add your own entries here.
 * Everything else on /library is clearly labelled "public charts", never presented as the owner's taste.
 */
export interface ShelfItem { id: string; kind: "anime"; lookup: string }
export interface MusicItem { id: string; title: string; artist?: string; url: string }

export const shelf: ShelfItem[] = [{ id: "hxh", kind: "anime", lookup: "Hunter x Hunter (2011)" }];

// Empty on purpose: no listening history has been confirmed by the owner. Example:
// { id: "m1", title: "Song name", artist: "Artist", url: "https://www.youtube.com/watch?v=..." }
export const music: MusicItem[] = [];
