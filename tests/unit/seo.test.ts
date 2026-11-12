import { describe, expect, it } from "vitest";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/format";

describe("multilingual SEO metadata (row 12)", () => {
  const m = buildMetadata({ locale: "ja", path: "/projects/deepsea", title: "T", description: "D" });
  it("sets a self-referencing canonical on the validated site URL", () => {
    expect(m.alternates?.canonical).toBe("https://example.test/ja/projects/deepsea");
  });
  it("declares hreflang for all locales plus x-default → English", () => {
    expect(m.alternates?.languages).toEqual({
      en: "https://example.test/en/projects/deepsea",
      ja: "https://example.test/ja/projects/deepsea",
      vi: "https://example.test/vi/projects/deepsea",
      "x-default": "https://example.test/en/projects/deepsea",
    });
  });
  it("sets locale-specific Open Graph", () => {
    expect(m.openGraph).toMatchObject({ locale: "ja_JP", alternateLocale: ["en_US", "vi_VN"] });
  });
  it("escapes '<' in JSON-LD so it cannot close the script tag", () => {
    expect(jsonLd({ a: "</script><script>alert(1)" })).not.toContain("</script>");
  });
});

describe("localized formatting (row 11)", () => {
  it("formats the same date differently per locale and never shifts the day across timezones", () => {
    expect(formatDate("2026-11-13", "en")).toBe("November 13, 2026");
    expect(formatDate("2026-11-13", "ja")).toBe("2026年11月13日");
    expect(formatDate("2026-11-13", "vi")).toMatch(/13.*2026/);
  });
});
