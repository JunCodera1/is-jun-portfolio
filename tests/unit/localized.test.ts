import { describe, expect, it } from "vitest";
import { resolveText, worstStatus, type LocalizedText } from "@/lib/localized";

const text: LocalizedText = { en: "Hello", ja: "こんにちは", vi: { text: "Xin chào", status: "draft" } };

describe("resolveText (row 10: translated / draft / untranslated)", () => {
  it("English is the source and counts as translated", () => {
    expect(resolveText(text, "en")).toEqual({ text: "Hello", lang: "en", status: "translated" });
  });
  it("plain strings are translated", () => {
    expect(resolveText(text, "ja")).toEqual({ text: "こんにちは", lang: "ja", status: "translated" });
  });
  it("draft variants keep their own language but are flagged", () => {
    expect(resolveText(text, "vi")).toEqual({ text: "Xin chào", lang: "vi", status: "draft" });
  });
  it("missing locale falls back to English and says so (lang=en, untranslated)", () => {
    expect(resolveText({ en: "Only EN" }, "ja")).toEqual({ text: "Only EN", lang: "en", status: "untranslated" });
  });
  it("worstStatus ranks untranslated > draft > translated", () => {
    expect(worstStatus(["translated", "draft"])).toBe("draft");
    expect(worstStatus(["translated", "untranslated", "draft"])).toBe("untranslated");
    expect(worstStatus(["translated"])).toBe("translated");
    expect(worstStatus([])).toBe("translated");
  });
});
