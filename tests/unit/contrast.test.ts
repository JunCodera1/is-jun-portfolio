import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../../src/styles/globals.css", import.meta.url), "utf8");

function block(selectorStart: string): Record<string, string> {
  const start = css.indexOf(selectorStart);
  if (start < 0) throw new Error(`block not found: ${selectorStart}`);
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1]!, m[2]!]));
}

const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

const themes = { dark: block(":root,\n:root[data-theme=\"dark\"]"), light: block(":root[data-theme=\"light\"]") };

describe("design tokens meet WCAG contrast (parsed from globals.css)", () => {
  it("palette is the owner-directed red / black / white (overrides the spreadsheet's suggested lime, row 36)", () => {
    expect(themes.dark).toMatchObject({ bg: "#0a0a0c", fg: "#f4f4f0", accent: "#d7141f" });
    expect(themes.light).toMatchObject({ bg: "#f4f4f0", fg: "#0a0a0c", accent: "#d7141f" });
  });

  describe.each(Object.entries(themes))("%s theme", (_name, t) => {
    const pairs: [string, string, number][] = [
      ["fg", "bg", 7], ["fg", "surface", 7],
      ["fg-2", "bg", 4.5], ["fg-2", "surface", 4.5], ["fg-2", "surface-2", 4.5],
      ["fg-3", "bg", 4.5], ["fg-3", "surface", 4.5],
      ["accent-fg", "bg", 4.5], ["accent-fg", "surface", 4.5],
      ["accent-ink", "accent", 4.5],
      ["danger", "bg", 4.5],
      ["sakura-fg", "bg", 4.5], ["sakura-fg", "surface", 4.5],
      ["outline", "bg", 7], // the manga ink edge must be clearly visible on the page background
      ["sky", "bg", 3], // decorative accent only (never used for body text)
    ];
    it.each(pairs)("%s on %s ≥ %s:1", (fg, bg, min) => {
      expect(ratio(t[fg]!, t[bg]!)).toBeGreaterThanOrEqual(min);
    });
  });

  it("red as TEXT needs a per-theme variant: the fill red alone fails on dark, the dark-theme text red fails on light", () => {
    expect(ratio(themes.dark.accent!, themes.dark.bg!)).toBeLessThan(4.5);
    expect(ratio(themes.dark["accent-fg"]!, themes.light.bg!)).toBeLessThan(4.5);
    expect(ratio(themes.light["accent-fg"]!, themes.light.bg!)).toBeGreaterThanOrEqual(4.5);
  });
});
