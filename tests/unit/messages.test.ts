import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import ja from "../../messages/ja.json";
import vi from "../../messages/vi.json";

type Tree = { [k: string]: string | Tree };
const flatten = (o: Tree, p = ""): Record<string, string> =>
  Object.entries(o).reduce<Record<string, string>>((acc, [k, v]) => {
    const key = p ? `${p}.${k}` : k;
    return typeof v === "string" ? { ...acc, [key]: v } : { ...acc, ...flatten(v, key) };
  }, {});

const base = flatten(en as Tree);
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)/g)].map((m) => m[1]).sort().join(",");

describe.each([["ja", ja], ["vi", vi]] as const)("messages/%s.json", (_name, catalog) => {
  const flat = flatten(catalog as Tree);
  it("has exactly the same keys as English (no silent fallback in UI chrome)", () => {
    expect(Object.keys(flat).sort()).toEqual(Object.keys(base).sort());
  });
  it("has no empty strings", () => {
    expect(Object.entries(flat).filter(([, v]) => v.trim() === "")).toEqual([]);
  });
  it("uses the same ICU placeholders as English for every key", () => {
    const bad = Object.keys(base).filter((k) => placeholders(base[k]!) !== placeholders(flat[k]!));
    expect(bad).toEqual([]);
  });
});

describe("translations are not just copied English", () => {
  it.each([["ja", ja], ["vi", vi]] as const)("%s differs from English for most keys", (_n, catalog) => {
    const flat = flatten(catalog as Tree);
    const same = Object.keys(base).filter((k) => flat[k] === base[k]);
    // Brand names / code identifiers legitimately repeat (e.g. "GitHub", "Next.js"); anything beyond that is a smell.
    expect(same.length / Object.keys(base).length).toBeLessThan(0.1);
  });
});
