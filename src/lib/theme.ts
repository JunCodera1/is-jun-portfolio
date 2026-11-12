/** Theme preference: "light" | "dark" | "system". Persisted in localStorage under `theme`. */
export type ThemePref = "light" | "dark" | "system";

/**
 * Runs inline in <head> before first paint so there is no flash of the wrong theme.
 * It only ever writes two data attributes on <html>; no user input reaches it.
 */
export const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem('theme');var pref=(s==='light'||s==='dark')?s:'system';var light=window.matchMedia('(prefers-color-scheme: light)').matches;var r=document.documentElement;r.dataset.theme=pref==='system'?(light?'light':'dark'):pref;r.dataset.themePref=pref;}catch(e){}})();`;

export function applyTheme(pref: ThemePref): void {
  const root = document.documentElement;
  const resolved = pref === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : pref;
  root.dataset.theme = resolved;
  root.dataset.themePref = pref;
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
  if (root.dataset.themePref === "light" || root.dataset.themePref === "dark") return;
  root.dataset.theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function currentThemePref(): ThemePref {
  const v = document.documentElement.dataset.themePref;
  return v === "light" || v === "dark" ? v : "system";
}
