import type { NavItem } from "./types";

/**
 * Site map. Order = order of the Index on the home page (personal first, ~70/30 — row 2).
 * `primary` items appear in the header; everything appears in the full-index menu.
 */
export const navigation: NavItem[] = [
  { id: "about", href: "/about", labelKey: "about", group: "personal", primary: true },
  { id: "now", href: "/now", labelKey: "now", group: "personal", primary: true },
  { id: "garden", href: "/garden", labelKey: "garden", group: "personal", primary: true },
  { id: "journal", href: "/journal", labelKey: "journal", group: "personal", primary: true },
  { id: "interests", href: "/interests", labelKey: "interests", group: "personal" },
  { id: "timeline", href: "/timeline", labelKey: "timeline", group: "personal" },
  { id: "projects", href: "/projects", labelKey: "projects", group: "professional", primary: true },
  { id: "profile", href: "/profile", labelKey: "profile", group: "professional" },
  { id: "contact", href: "/contact", labelKey: "contact", group: "professional", primary: true },
  { id: "terminal", href: "/terminal", labelKey: "terminal", group: "utility" },
  { id: "search", href: "/search", labelKey: "search", group: "utility" },
];

/** Entries shown as numbered rows in the home-page Index. */
export const indexEntries = navigation.filter((n) => n.group !== "utility");
