import { describe, expect, it } from "vitest";
import { getEntries, getEntry, listIds } from "@/lib/content";
import { locales } from "@/i18n/routing";

describe("MDX content collections (rows 16, 17, 50)", () => {
  it("every content id has an English source file", () => {
    for (const c of ["garden", "journal"] as const) for (const id of listIds(c)) expect(getEntry(c, id, "en"), `${c}/${id}`).not.toBeNull();
  });

  it("exercises all three translation states on the seed note", () => {
    const en = getEntry("garden", "how-this-space-is-built", "en")!;
    const ja = getEntry("garden", "how-this-space-is-built", "ja")!;
    const vi = getEntry("garden", "how-this-space-is-built", "vi")!;
    expect([en.status, ja.status, vi.status]).toEqual(["translated", "draft", "untranslated"]);
    // fallback is honest: the returned text is English and tagged as such
    expect(vi.lang).toBe("en");
    expect(vi.title).toBe(en.title);
    expect(ja.lang).toBe("ja");
    expect(ja.title).not.toBe(en.title);
  });

  it("shared metadata (date, tags, relations) comes from the English source in every locale", () => {
    const en = getEntry("journal", "three-languages-from-day-one", "en")!;
    for (const l of locales) {
      const e = getEntry("journal", "three-languages-from-day-one", l)!;
      expect([e.date, e.tags]).toEqual([en.date, en.tags]);
    }
  });

  it("computes reading time and a table of contents", () => {
    const e = getEntry("journal", "three-languages-from-day-one", "en")!;
    expect(e.readingMinutes).toBeGreaterThanOrEqual(1);
    expect(e.toc.length).toBeGreaterThanOrEqual(3);
  });

  it("lists newest first", () => {
    const dates = getEntries("garden", "en").map((e) => e.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("related ids point at real entries", () => {
    for (const c of ["garden", "journal"] as const)
      for (const e of getEntries(c, "en")) for (const r of e.related) expect(getEntry(c, r, "en"), `${c}/${e.id} → ${r}`).not.toBeNull();
  });

  it("returns null for unknown ids", () => {
    expect(getEntry("garden", "does-not-exist", "en")).toBeNull();
  });
});
