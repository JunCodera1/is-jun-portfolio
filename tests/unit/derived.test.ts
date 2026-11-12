import { describe, expect, it } from "vitest";
import { firstRepoPerLanguage, languageCounts, latestPush } from "@/lib/derived";
import type { RepoRecord } from "@/content/data/github";

const r = (name: string, language: string | null, createdAt: string, pushedAt = createdAt): RepoRecord =>
  ({ name, url: `u/${name}`, description: null, language, createdAt, pushedAt, homepage: null, archived: false });

const repos = [r("a", "Java", "2023-12-01"), r("b", "Java", "2023-10-01"), r("c", "TypeScript", "2024-09-01"), r("d", "HTML", "2023-01-01"), r("e", null, "2023-02-01")];

describe("derived GitHub statistics", () => {
  it("counts repositories per primary language, ignoring null", () => {
    expect(languageCounts(repos)).toEqual([
      { language: "Java", count: 2 }, { language: "HTML", count: 1 }, { language: "TypeScript", count: 1 },
    ]);
  });
  it("finds the earliest repo per language and excludes markup like HTML/CSS", () => {
    expect(firstRepoPerLanguage(repos).map((x) => [x.language, x.repo])).toEqual([["Java", "b"], ["TypeScript", "c"]]);
  });
  it("latestPush picks the newest across named repos", () => {
    expect(latestPush([r("a", "Java", "2020-01-01", "2026-01-01"), r("b", "Java", "2020-01-01", "2025-01-01")], ["a", "b"])).toBe("2026-01-01");
  });
});
