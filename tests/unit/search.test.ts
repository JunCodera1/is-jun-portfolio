import { describe, expect, it } from "vitest";
import { normalize, search, type SearchEntry } from "@/lib/search";

const e = (id: string, title: string, summary = "", tags: string[] = []): SearchEntry =>
  ({ id, type: "garden", title, summary, tags, href: `/${id}`, lang: "en", status: "translated" });

const corpus = [
  e("a", "Nội dung giữ chỗ", "Vì sao một mục còn trống", ["thiết kế"]),
  e("b", "Three languages from day one", "URLs, fallbacks and metadata", ["i18n"]),
  e("c", "最初から三つの言語で", "URL とメタデータ", ["多言語対応"]),
  e("d", "Placeholders, not fiction", "Why an empty section is labelled", ["design"]),
];

describe("normalize", () => {
  it("is case-, width- and diacritic-insensitive; maps đ to d", () => {
    expect(normalize("Việt ĐẸP")).toBe("viet dep");
    expect(normalize("ＴＥＳＴ")).toBe("test");
  });
});

describe("search", () => {
  it("finds Vietnamese text typed without diacritics", () => {
    expect(search(corpus, "noi dung").map((x) => x.id)).toEqual(["a"]);
  });
  it("finds Japanese by substring (no word boundaries)", () => {
    expect(search(corpus, "三つの言語").map((x) => x.id)).toEqual(["c"]);
  });
  it("matches tags and summaries, requires every token", () => {
    expect(search(corpus, "i18n").map((x) => x.id)).toEqual(["b"]);
    expect(search(corpus, "empty section").map((x) => x.id)).toEqual(["d"]);
    expect(search(corpus, "empty banana")).toEqual([]);
  });
  it("ranks title matches above summary matches", () => {
    const r = search([e("s", "Other", "contains languages"), e("t", "Languages", "")], "languages");
    expect(r.map((x) => x.id)).toEqual(["t", "s"]);
  });
  it("returns nothing for an empty query and respects the limit", () => {
    expect(search(corpus, "   ")).toEqual([]);
    expect(search(corpus, "o", 1)).toHaveLength(1);
  });
});
