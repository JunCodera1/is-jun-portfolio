import { L, type Source, type VaultTopic, type Visible } from "./types";
import type { LocalizedText } from "@/lib/localized";

/** Research Notes: a question, what was found, the conclusion, and the sources. Every finding was checked on the date shown. */
export interface Research extends Visible { id: string; date: string; topic: VaultTopic; title: LocalizedText; question: LocalizedText; findings: LocalizedText[]; conclusion: LocalizedText; sources: Source[] }

export const research: Research[] = [
  {
    id: "keyless-news-sources", date: "2026-11-13", topic: "web",
    title: L("Tech news sources that need no API key", "APIキー不要のテックニュース情報源", "Nguồn tin công nghệ không cần API key"),
    question: L("Which public feeds can a static site read on the server without registering for anything?"),
    findings: [
      L("The Verge (Atom), Ars Technica and BBC Technology (RSS 2.0) all answered with 200 and a parseable feed."),
      L("Hacker News (Firebase JSON), Lobsters (hottest.json) and DEV (articles API) answer with plain JSON."),
      L("Zenn and GIGAZINE cover Japanese; VnExpress covers Vietnamese, after one redirect."),
      L("The Atom feed needs a different parser from RSS: entries use <link href=\"…\"/> instead of <link>text</link>."),
    ],
    conclusion: L("Nine sources work today without keys. Each must be fetched independently with its own timeout, because any of them can disappear."),
    sources: [{ label: "Hacker News API", url: "https://github.com/HackerNews/API" }, { label: "DEV API", url: "https://developers.forem.com/api" }],
  },
  {
    id: "public-media-apis", date: "2026-11-13", topic: "web",
    title: L("Public APIs for anime, books and music", "アニメ・本・音楽の公開API", "API công khai cho anime, sách và nhạc"),
    question: L("Where can a personal library pull cover art and metadata from, without keys or accounts?"),
    findings: [
      L("AniList's GraphQL endpoint answers anonymous queries for trending anime, with cover images and scores."),
      L("Jikan (MyAnimeList) did not answer on the day of testing, so it cannot be the only source."),
      L("Open Library offers trending lists and search with cover ids; its cover images redirect through archive.org."),
      L("Deezer's chart endpoint returns tracks, album covers and 30-second previews. The preview links are signed and expire."),
    ],
    conclusion: L("AniList, Open Library and Deezer are enough. Images and previews need their hosts added to the Content Security Policy, and expiring links must be fetched fresh."),
    sources: [{ label: "AniList API docs", url: "https://docs.anilist.co/" }, { label: "Open Library search API", url: "https://openlibrary.org/dev/docs/api/search" }, { label: "Deezer API", url: "https://developers.deezer.com/api" }],
  },
  {
    id: "browser-speech-japanese", date: "2026-11-13", topic: "japanese",
    title: L("Speaking Japanese in the browser", "ブラウザで日本語を読み上げる", "Đọc tiếng Nhật ngay trên trình duyệt"),
    question: L("Can flashcards read a Japanese word aloud without audio files?"),
    findings: [
      L("The Web Speech API's speechSynthesis can speak with a ja-JP voice, but only if the device has one installed."),
      L("Speech must start from a user action (a button), never automatically."),
      L("Voice quality and availability differ per browser and operating system; this was not tested across devices."),
    ],
    conclusion: L("Offer a Listen button only when speech synthesis exists, label it as the browser's voice, and treat it as a stopgap until real recordings exist."),
    sources: [{ label: "MDN: SpeechSynthesis", url: "https://developer.mozilla.org/docs/Web/API/SpeechSynthesis" }],
  },
];
