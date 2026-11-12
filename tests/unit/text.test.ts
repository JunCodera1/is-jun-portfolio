import { describe, expect, it } from "vitest";
import { extractToc, readingMinutes } from "@/lib/text";

describe("extractToc", () => {
  const md = "# Title\n\n## One\n\ntext\n\n```md\n## not a heading\n```\n\n### Sub **bold** `code`\n\n## One\n";
  it("collects h2/h3 only, skips fenced code, strips inline markdown", () => {
    expect(extractToc(md).map((h) => [h.depth, h.text])).toEqual([[2, "One"], [3, "Sub bold code"], [2, "One"]]);
  });
  it("de-duplicates ids exactly like rehype-slug (github-slugger)", () => {
    expect(extractToc(md).map((h) => h.id)).toEqual(["one", "sub-bold-code", "one-1"]);
  });
});

describe("readingMinutes", () => {
  it("is at least 1", () => expect(readingMinutes("hi", "en")).toBe(1));
  it("counts words for en/vi", () => expect(readingMinutes("word ".repeat(600), "en")).toBe(3));
  it("counts characters for ja", () => expect(readingMinutes("あ".repeat(1500), "ja")).toBe(3));
});
