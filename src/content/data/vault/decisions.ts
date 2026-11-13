import { L, type VaultTopic, type Visible } from "./types";
import type { LocalizedText } from "@/lib/localized";

/** Decision Journal: what was decided, why, and what it cost. Newest first. Superseded decisions stay, with what replaced them. */
export interface Decision extends Visible { id: string; date: string; topic: VaultTopic; status: "active" | "superseded"; title: LocalizedText; context: LocalizedText; decision: LocalizedText; why: LocalizedText; cost: LocalizedText; supersededBy?: string }

export const decisions: Decision[] = [
  {
    id: "csp-no-nonce", date: "2026-11-13", topic: "web", status: "active",
    title: L("Content Security Policy without nonces", "ノンスなしの Content Security Policy", "Content Security Policy không dùng nonce"),
    context: L("The site is statically generated. Nonce-based CSP forces every page to render dynamically."),
    decision: L("Allow 'unsafe-inline' for scripts, and lock everything else down: same-origin by default, no framing, no plugins, and an explicit allow-list for the few third-party hosts that are needed (cover images, music players)."),
    why: L("Static pages are faster and simpler to host. The exposure is small: there is no user-generated content and no third-party script is loaded."),
    cost: L("Inline script injection is not blocked by CSP alone. Every new third-party host has to be added to the policy deliberately, which is also a feature."),
  },
  {
    id: "anime-js", date: "2026-11-13", topic: "design", status: "active",
    title: L("Use anime.js for motion", "モーションに anime.js を使う", "Dùng anime.js cho chuyển động"),
    context: L("Decision 'CSS-only motion' (below) worked for reveals, but the owner asked for richer, interactive animation."),
    decision: L("Add anime.js 4 for sequences, springs and interactive effects. Keep every effect transform-only and switched off under prefers-reduced-motion, through one helper module."),
    why: L("Springs, staggers and pointer-driven motion are awkward in plain CSS. One helper module (reducedMotion, staggerIn, pop, shake, riseIn) keeps the rules in one place."),
    cost: L("A new dependency, and a deprecation to track: createSpring() became spring() and the old name printed console warnings that broke tests."),
  },
  {
    id: "css-only-motion", date: "2026-11-13", topic: "design", status: "superseded", supersededBy: "anime-js",
    title: L("Motion without a JavaScript animation library", "JS アニメーションライブラリなしのモーション", "Chuyển động không dùng thư viện JS"),
    context: L("The first version only needed reveal-on-scroll and hover transitions."),
    decision: L("Use CSS scroll-driven animation and transitions. The 'motion' package was installed, found unnecessary and removed."),
    why: L("Less JavaScript, no dependency, and transform-only reveals can never leave text half-transparent."),
    cost: L("Limited to what CSS can express. Replaced once the owner wanted springs and interactive effects."),
  },
  {
    id: "local-progress", date: "2026-11-13", topic: "web", status: "active",
    title: L("Learning progress stays in the browser", "学習の進捗はブラウザ内だけに保存", "Tiến độ học chỉ lưu trong trình duyệt"),
    context: L("Stamps, flashcard boxes, streaks and game scores need to persist between visits."),
    decision: L("Store them in localStorage behind small external stores, label them as 'only in this browser', and never mix them with the owner's real-life milestones."),
    why: L("No accounts, no database, no privacy questions, and nothing can be mistaken for a verified achievement."),
    cost: L("Progress does not follow a visitor across devices, and clearing site data resets it."),
  },
  {
    id: "third-party-feeds", date: "2026-11-13", topic: "web", status: "active",
    title: L("Third-party news and library data are fetched on the server, as data only", "外部のニュースとライブラリは、サーバー側でデータのみ取得", "Tin tức và dữ liệu thư viện bên thứ ba chỉ lấy ở phía server, dưới dạng dữ liệu"),
    context: L("The site shows headlines, anime, books and music from public APIs."),
    decision: L("Fetch on the server with bounded timeouts and caching; parse as hostile input (titles as plain text, http(s) links only, allow-listed image hosts); never put headlines into search or the sitemap; one failing source must not affect the others."),
    why: L("It keeps secrets and CORS out of the browser, makes failures an empty state instead of an error, and keeps third-party text away from anything that could execute it."),
    cost: L("Content is up to 30 minutes to 6 hours old, depending on the page, and sources can disappear without notice."),
  },
  {
    id: "world-not-portfolio", date: "2026-11-13", topic: "design", status: "active",
    title: L("A world, not a portfolio", "ポートフォリオではなく「世界」", "Một thế giới, không phải portfolio"),
    context: L("The first brief was a conventional personal site. The owner then asked for an explorable world, and later for a personal space rather than a showcase."),
    decision: L("Two modes under one i18n shell using route groups: (world) for the immersive places and (site) for classic pages. Everything is reachable from both."),
    why: L("Exploration is the experience, but a plain site must always remain one click away for people who want to read, search or print."),
    cost: L("Two navigation systems to keep in sync, and the original spreadsheet's palette and 'minimalist' rows were overridden."),
  },
  {
    id: "contrast-tested", date: "2026-11-13", topic: "design", status: "active",
    title: L("Contrast is a tested property", "コントラストをテストで保証する", "Độ tương phản là thứ được kiểm thử"),
    context: L("A bold red accent is a fine fill but a poor text colour on a light background."),
    decision: L("Parse globals.css in a unit test and enforce WCAG ratios for every text/background pair in both themes; use a separate, darker accent for text on the light theme."),
    why: L("Visual taste drifts; a failing test does not."),
    cost: L("New colour tokens must be added to the test's pairs, otherwise they are unchecked."),
  },
  {
    id: "typescript-5-9", date: "2026-11-13", topic: "tooling", status: "active",
    title: L("Pin TypeScript 5.9", "TypeScript 5.9 に固定", "Ghim TypeScript 5.9"),
    context: L("npm's 'latest' TypeScript is a native rewrite that the installed Next.js does not declare support for."),
    decision: L("Stay on 5.9 until the framework supports the newer major version."),
    why: L("A build tool that merely compiles is not worth a compatibility gamble."),
    cost: L("Newer language tooling has to wait."),
  },
];
