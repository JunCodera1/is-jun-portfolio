import { describe, expect, it } from "vitest";
import { pickSurprise } from "@/lib/surprise";
import type { SearchEntry } from "@/lib/search";

const e = (href: string): SearchEntry => ({ id: href, type: "page", title: href, summary: "", tags: [], href, lang: "en", status: "translated" });

describe("surprise me", () => {
  const all = [e("/about"), e("/news"), e("/projects/voiceai")];
  it("never returns the page you are on (locale prefix ignored)", () => {
    for (let i = 0; i < 20; i++) expect(pickSurprise(all, "/en/news", () => Math.random())!.href).not.toBe("/news");
  });
  it("is deterministic for a given rng and stays in range at the edges", () => {
    expect(pickSurprise(all, "/en/about", () => 0)!.href).toBe("/news");
    expect(pickSurprise(all, "/en/about", () => 0.9999999)!.href).toBe("/projects/voiceai");
  });
  it("returns null when there is nothing else to show", () => {
    expect(pickSurprise([e("/about")], "/ja/about")).toBeNull();
    expect(pickSurprise([], "/en")).toBeNull();
  });
});
