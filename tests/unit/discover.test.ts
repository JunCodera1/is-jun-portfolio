import { describe, expect, it } from "vitest";
import { pickDiscovery } from "@/lib/discover";
import type { SearchEntry } from "@/lib/search";

const e = (href: string, related: string[] = []): SearchEntry => ({ id: href, type: "page", title: href, summary: "", tags: [], href, lang: "en", status: "translated", related });

describe("discovery engine", () => {
  const all = [e("/a", ["/b"]), e("/b", ["/a"]), e("/c"), e("/d"), e("/e")];
  it("never returns the page you are on (locale prefix and #fragment ignored)", () => {
    for (let i = 0; i < 30; i++) expect(pickDiscovery(all, "/en/a")!.href).not.toBe("/a");
    expect(pickDiscovery([e("/a#x")], "/ja/a")).toBeNull();
  });
  it("follows a real connection most of the time when one exists", () => {
    let seed = 7;
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let followed = 0;
    const N = 2000;
    for (let i = 0; i < N; i++) if (pickDiscovery(all, "/en/a", rng)!.href === "/b") followed++;
    expect(followed / N).toBeGreaterThan(0.6); // 60% by design, plus the chance draws of /b from the open pool
    expect(followed / N).toBeLessThan(0.8);
  });
  it("also follows connections that point at the current page", () => {
    const k = [e("/a"), e("/b", ["/a"]), e("/c"), e("/d")];
    let hit = 0;
    for (let i = 0; i < 200; i++) if (pickDiscovery(k, "/en/a", () => 0.1)!.href === "/b") hit++;
    expect(hit).toBe(200);
  });
  it("falls back to anything when there are no connections, and is deterministic for a given rng", () => {
    expect(pickDiscovery(all, "/en/c", () => 0)!.href).toBe("/a");
    expect(pickDiscovery(all, "/en/c", () => 0.99999)!.href).toBe("/e");
    expect(pickDiscovery([], "/en")).toBeNull();
  });
});
