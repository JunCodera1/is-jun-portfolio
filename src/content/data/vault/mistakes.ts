import { L, type VaultTopic, type Visible } from "./types";
import type { LocalizedText } from "@/lib/localized";

/** Mistake Archive: things that went wrong while building this site, why, and what to do differently. Newest first. */
export interface Mistake extends Visible { id: string; date: string; topic: VaultTopic; title: LocalizedText; happened: LocalizedText; cause: LocalizedText; fix: LocalizedText; lesson: LocalizedText }

export const mistakes: Mistake[] = [
  {
    id: "daypart-hours", date: "2026-11-13", topic: "web",
    title: L("Midnight counted as daytime", "深夜が昼として扱われた", "Nửa đêm bị tính là ban ngày"),
    happened: L("The unit test for the time-of-day helper failed: hour 4 was reported as 'day'."),
    cause: L("A chain of ternaries (h < 17 ? 'day' : …) never checked the lower bound, so every hour below 5 fell into the wrong branch. The same expression was copied into the inline no-flash script."),
    fix: L("Check both bounds in every branch, in the helper and in the inline script, and add a test that runs the real script for all 24 hours and compares it with the helper."),
    lesson: L("When the same rule exists twice (once in app code, once in an inline script), test them against each other, not just each against an example."),
  },
  {
    id: "terminal-focus", date: "2026-11-13", topic: "web",
    title: L("The terminal opened but could not be typed into", "ターミナルが開いたのに入力できなかった", "Terminal mở ra nhưng không gõ được"),
    happened: L("Opening the terminal dialog left keyboard focus on the Esc button instead of the input."),
    cause: L("A child component focused its input on mount, before the parent called showModal(); a closed dialog cannot take focus, and showModal() then focused the first button."),
    fix: L("Focus the input in the same effect, right after showModal()."),
    lesson: L("Order matters between a child's effects and its parent's. Focus belongs to whoever opens the dialog."),
  },
  {
    id: "deezer-expiring-urls", date: "2026-11-13", topic: "web",
    title: L("Music previews that stop working", "再生できなくなる音楽プレビュー", "Bản nghe thử nhạc hết hạn"),
    happened: L("The first plan embedded Deezer's preview URLs directly in the cached page."),
    cause: L("The preview links are signed and expire quickly, while the page is cached for hours."),
    fix: L("A small endpoint asks Deezer for a fresh link at play time and redirects to it, accepting only numeric ids and Deezer's own CDN host."),
    lesson: L("Signed URLs must never be cached longer than they live. Look for an expiry parameter before storing any third-party link."),
  },
  {
    id: "createspring-deprecated", date: "2026-11-13", topic: "tooling",
    title: L("A deprecation warning broke the test suite", "非推奨警告でテストが失敗した", "Cảnh báo deprecated làm hỏng bộ test"),
    happened: L("Several end-to-end tests failed with 'createSpring() is deprecated, use spring() instead'."),
    cause: L("The tests treat any console warning as a failure; the animation library renamed an API in a minor version."),
    fix: L("Switch to spring(), then check the library's exports directly instead of trusting memory of the API."),
    lesson: L("Failing on console warnings feels strict, and it is exactly how API drift gets caught early."),
  },
  {
    id: "invisible-reveal", date: "2026-11-13", topic: "design",
    title: L("Content hidden by an entrance animation", "入場アニメーションで内容が見えなくなった", "Nội dung bị ẩn bởi hiệu ứng xuất hiện"),
    happened: L("Text that fades in from opacity 0 was captured at low contrast by accessibility checks and screenshots."),
    cause: L("Opacity animation makes text half-transparent for a while, so automated contrast checks see a failure."),
    fix: L("Animate transforms only, never opacity, for anything that carries text."),
    lesson: L("An effect that hides content during its animation is a bug for anyone who looks at the page at that moment."),
  },
  {
    id: "font-layout-shift", date: "2026-11-13", topic: "web",
    title: L("The page jumped when the font loaded", "フォント読み込み時にページが動いた", "Trang giật khi font tải xong"),
    happened: L("Cumulative layout shift measured 0.157 on the Vietnamese garden page and 0.186 on the mobile entrance."),
    cause: L("The fallback font has different metrics from the web font, so text reflowed on swap."),
    fix: L("Local fallback faces with size-adjust and ascent/descent overrides matched to the real font, plus a preload for the display font."),
    lesson: L("Measure layout shift per language: Vietnamese diacritics change line heights, and the problem was invisible in English."),
  },
  {
    id: "theme-erased", date: "2026-11-13", topic: "web",
    title: L("Saved theme erased on every page load", "保存したテーマが毎回消えた", "Theme đã lưu bị xóa mỗi lần tải trang"),
    happened: L("Choosing light or dark worked, but after a reload the site went back to following the system."),
    cause: L("A 'resync on mount' effect applied the system theme through the same function that also writes the preference to storage."),
    fix: L("A resync function that only reads, never writes storage, plus a regression test across the classic site, the city and the hideout."),
    lesson: L("Code that merely observes state must not share a write path with code that records a choice."),
  },
];
