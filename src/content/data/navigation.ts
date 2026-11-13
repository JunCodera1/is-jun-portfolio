import type { NavItem } from "./types";

/**
 * Site map. Order = order of the Index on the home page (personal first, ~70/30 — row 2).
 * `primary` items appear in the header; everything except "sub" appears in the full-index menu.
 * Chapter numbers (第NN話) are derived from this order, so reordering or adding a page renumbers everything.
 */
export const navigation: NavItem[] = [
  { id: "city", href: "/city", labelKey: "city", group: "utility", primary: true },
  { id: "about", href: "/about", labelKey: "about", group: "personal", primary: true },
  { id: "now", href: "/now", labelKey: "now", group: "personal" },
  { id: "garden", href: "/garden", labelKey: "garden", group: "personal", primary: true },
  { id: "journal", href: "/journal", labelKey: "journal", group: "personal" },
  { id: "japanese", href: "/japanese", labelKey: "japanese", group: "personal" },
  { id: "news", href: "/news", labelKey: "news", group: "personal", primary: true },
  { id: "log", href: "/log", labelKey: "log", group: "personal" },
  { id: "library", href: "/library", labelKey: "library", group: "personal", primary: true },
  { id: "links", href: "/links", labelKey: "links", group: "personal" },
  { id: "interests", href: "/interests", labelKey: "interests", group: "personal" },
  { id: "timeline", href: "/timeline", labelKey: "timeline", group: "personal" },
  { id: "projects", href: "/projects", labelKey: "projects", group: "professional", primary: true },
  { id: "profile", href: "/profile", labelKey: "profile", group: "professional" },
  { id: "contact", href: "/contact", labelKey: "contact", group: "professional", primary: true },
  { id: "hideout", href: "/hideout", labelKey: "hideout", group: "utility" },
  { id: "lab", href: "/lab", labelKey: "lab", group: "utility" },
  { id: "station", href: "/station", labelKey: "station", group: "utility" },
  { id: "arcade", href: "/arcade", labelKey: "arcade", group: "utility" },
  { id: "archive", href: "/archive", labelKey: "archive", group: "utility" },
  { id: "play", href: "/play", labelKey: "play", group: "utility" },
  { id: "recruiter", href: "/recruiter", labelKey: "recruiter", group: "utility" },
  { id: "terminal", href: "/terminal", labelKey: "terminal", group: "utility" },
  { id: "search", href: "/search", labelKey: "search", group: "utility" },
  { id: "review", href: "/japanese/review", labelKey: "review", group: "sub" },
  { id: "kana", href: "/japanese/kana", labelKey: "kana", group: "sub" },
  { id: "grammar", href: "/japanese/grammar", labelKey: "grammar", group: "sub" },
];

/** Entries shown as numbered rows in the home-page Index. */
export const indexEntries = navigation.filter((n) => n.group === "personal" || n.group === "professional");
/** Pages listed in menus and the footer (everything except sub-pages). */
export const listedPages = navigation.filter((n) => n.group !== "sub");
