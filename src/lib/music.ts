import { safeHttpUrl } from "@/lib/news";

/** Turns a pasted music link into an embeddable player URL. Pure and strict: only known providers, only well-formed ids. Everything else stays a plain link. */
export type Provider = "youtube" | "soundcloud" | "spotify";
export interface Embed { provider: Provider; src: string; height: number }

const YT_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"]);
const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const YT_LIST = /^[A-Za-z0-9_-]{10,64}$/;
const SP_ID = /^[A-Za-z0-9]{10,32}$/;

export function embedFor(input: string): Embed | null {
  const safe = safeHttpUrl(input);
  if (!safe) return null;
  const u = new URL(safe);
  const host = u.hostname.toLowerCase();

  if (YT_HOSTS.has(host)) {
    const list = u.searchParams.get("list");
    const v = host === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v") ?? (u.pathname.startsWith("/shorts/") ? u.pathname.split("/")[2] : null);
    if (v && YT_ID.test(v)) return { provider: "youtube", src: `https://www.youtube-nocookie.com/embed/${v}${list && YT_LIST.test(list) ? `?list=${list}` : ""}`, height: 315 };
    if (list && YT_LIST.test(list)) return { provider: "youtube", src: `https://www.youtube-nocookie.com/embed/videoseries?list=${list}`, height: 315 };
    return null;
  }
  if (host === "open.spotify.com") {
    const m = /^\/(?:intl-[a-z]+\/)?(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)$/.exec(u.pathname);
    if (m && SP_ID.test(m[2]!)) return { provider: "spotify", src: `https://open.spotify.com/embed/${m[1]}/${m[2]}`, height: m[1] === "track" || m[1] === "episode" ? 152 : 352 };
    return null;
  }
  if (host === "soundcloud.com" || host === "www.soundcloud.com") {
    if (u.pathname.split("/").filter(Boolean).length < 1) return null;
    return { provider: "soundcloud", src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(`https://soundcloud.com${u.pathname}`)}&visual=false&show_comments=false`, height: 166 };
  }
  return null;
}
