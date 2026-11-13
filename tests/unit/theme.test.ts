import { afterEach, describe, expect, it, vi } from "vitest";
import { daypartOf, THEME_SCRIPT, themeForHour } from "@/lib/theme";

describe("time-of-day theme", () => {
  it("light from 06:00 to 17:59, dark otherwise", () => {
    expect([5, 6, 12, 17, 18, 23, 0].map(themeForHour)).toEqual(["dark", "light", "light", "light", "dark", "dark", "dark"]);
  });
  it("four dayparts cover all 24 hours", () => {
    const seen = new Set(Array.from({ length: 24 }, (_, h) => daypartOf(h)));
    expect([...seen].sort()).toEqual(["day", "evening", "morning", "night"]);
    expect([4, 5, 10, 11, 16, 17, 19, 20].map(daypartOf)).toEqual(["night", "morning", "morning", "day", "day", "evening", "evening", "night"]);
  });
});

describe("the inline no-flash script agrees with the helpers for every hour and preference", () => {
  afterEach(() => vi.useRealTimers());
  const run = (stored: string | null, hour: number, osLight: boolean) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 13, hour, 30));
    const root = { dataset: {} as Record<string, string> };
    const win = { matchMedia: () => ({ matches: osLight }) };
    const doc = { documentElement: root };
    new Function("localStorage", "window", "document", THEME_SCRIPT)({ getItem: () => stored }, win, doc);
    return root.dataset;
  };
  it("auto follows the clock", () => {
    for (let h = 0; h < 24; h++) {
      const d = run("auto", h, true);
      expect(d.theme).toBe(themeForHour(h));
      expect(d.themePref).toBe("auto");
      expect(d.daypart).toBe(daypartOf(h));
    }
  });
  it("light/dark lock the theme; unknown or missing means system", () => {
    expect(run("dark", 12, true).theme).toBe("dark");
    expect(run("light", 23, false).theme).toBe("light");
    expect(run(null, 12, false)).toMatchObject({ theme: "dark", themePref: "system" });
    expect(run("bogus", 12, true)).toMatchObject({ theme: "light", themePref: "system" });
  });
});
