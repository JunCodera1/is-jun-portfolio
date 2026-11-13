/**
 * Theme preference: "light" | "dark" | "system" | "auto". Persisted in localStorage under `theme`.
 * "auto" follows the visitor's local time of day (light 06:00–18:00, dark otherwise); picking light or dark locks the theme manually.
 */
export type ThemePref = "light" | "dark" | "system" | "auto";
export type Daypart = "morning" | "day" | "evening" | "night";

/** Pure helpers (unit-tested). THEME_SCRIPT below repeats the same rules inline and a test checks the two agree for every hour. */
export const themeForHour = (h: number): "light" | "dark" => (h >= 6 && h < 18 ? "light" : "dark");
export const daypartOf = (h: number): Daypart => (h >= 5 && h < 11 ? "morning" : h >= 11 && h < 17 ? "day" : h >= 17 && h < 20 ? "evening" : "night");

/**
 * Runs inline in <head> before first paint so there is no flash of the wrong theme.
 * It only ever writes data attributes on <html>; no user input reaches it.
 */
export const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem('theme');var pref=(s==='light'||s==='dark'||s==='auto')?s:'system';var light=window.matchMedia('(prefers-color-scheme: light)').matches;var h=new Date().getHours();var r=document.documentElement;r.dataset.theme=pref==='system'?(light?'light':'dark'):pref==='auto'?((h>=6&&h<18)?'light':'dark'):pref;r.dataset.themePref=pref;r.dataset.daypart=h>=5&&h<11?'morning':h>=11&&h<17?'day':h>=17&&h<20?'evening':'night';}catch(e){}})();`;

function resolve(pref: ThemePref, now = new Date()): "light" | "dark" {
  if (pref === "system") return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  if (pref === "auto") return themeForHour(now.getHours());
  return pref;
}

export function applyTheme(pref: ThemePref): void {
  const root = document.documentElement;
  root.dataset.theme = resolve(pref);
  root.dataset.themePref = pref;
  root.dataset.daypart = daypartOf(new Date().getHours());
  try {
    if (pref === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", pref);
  } catch {
    /* storage can be blocked (private mode); the theme still applies for this page view */
  }
}

/** Follow the OS only while the REAL preference is "system". Never writes storage, so it can never clobber a saved choice. */
export function syncSystemTheme(): void {
  const root = document.documentElement;
  if (root.dataset.themePref !== "system" && root.dataset.themePref !== undefined) return;
  root.dataset.theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/** Re-evaluate the time of day: updates the daypart always, and the theme only while the preference is "auto". Never writes storage. */
export function syncTimeOfDay(now = new Date()): void {
  const root = document.documentElement;
  root.dataset.daypart = daypartOf(now.getHours());
  if (root.dataset.themePref === "auto") root.dataset.theme = themeForHour(now.getHours());
}

export function currentThemePref(): ThemePref {
  const v = document.documentElement.dataset.themePref;
  return v === "light" || v === "dark" || v === "auto" ? v : "system";
}
