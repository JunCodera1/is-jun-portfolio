/**
 * Personal Library — owner-controlled part.
 * `shelf` = things the owner has said they like; each is looked up on a public API so its card carries real data.
 * `music` = any link from anywhere (YouTube, SoundCloud, Bandcamp, Apple Music, Spotify, a file…). Add your own entries here.
 * Everything else on /library is clearly labelled "public charts", never presented as the owner's taste.
 */
import type { LocalizedText } from "@/lib/localized";

export interface ShelfItem { id: string; kind: "anime"; lookup: string }
export interface PlaylistTrack { id: string; title: string; artist?: string; url: string }
export interface Playlist { id: string; title: LocalizedText; tracks: PlaylistTrack[] }

export const shelf: ShelfItem[] = [{ id: "hxh", kind: "anime", lookup: "Hunter x Hunter (2011)" }];

/**
 * Your playlists. Paste links from anywhere: YouTube, Spotify and SoundCloud play right here; any other link (Bandcamp, Apple Music, a file…)
 * shows as a link that opens on its own site. Empty on purpose: no listening history has been confirmed by the owner. Example track:
 * { id: "t1", title: "Song name", artist: "Artist", url: "https://www.youtube.com/watch?v=..." }
 */
const L = (en: string, ja: string, vi: string): LocalizedText => ({ en, ja: { text: ja, status: "draft" }, vi: { text: vi, status: "draft" } });
export const playlists: Playlist[] = [
  { id: "main", title: L("My playlist", "マイ・プレイリスト", "Playlist của tôi"), tracks: [] },
];
