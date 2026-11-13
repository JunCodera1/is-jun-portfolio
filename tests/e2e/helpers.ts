import { expect, type Page } from "@playwright/test";

export const LOCALES = ["en", "ja", "vi"] as const;
export const STATIC_PATHS = ["", "/classic", "/city", "/hideout", "/lab", "/station", "/arcade", "/archive", "/about", "/now", "/contact", "/interests", "/timeline", "/projects", "/profile", "/garden", "/journal", "/search", "/terminal", "/recruiter", "/japanese", "/japanese/kana", "/japanese/grammar", "/japanese/review", "/news", "/library", "/log", "/links", "/graph", "/orbit", "/play"];
export const DETAIL_PATHS = ["/projects/green-footprint", "/projects/voiceai", "/garden/how-this-space-is-built", "/journal/three-languages-from-day-one"];
export const ALL_PATHS = [...STATIC_PATHS, ...DETAIL_PATHS];

/** Collect console errors/warnings and uncaught exceptions while a page is exercised. */
export function trackConsole(page: Page) {
  const problems: string[] = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") problems.push(`${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  return { assertClean: () => expect(problems).toEqual([]) };
}
