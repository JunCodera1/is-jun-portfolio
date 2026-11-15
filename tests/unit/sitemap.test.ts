import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/content", () => ({
  // getEntries is the visibility-aware lister; listIds (all directories, including private ones) must NOT be used by the sitemap
  getEntries: (c: string) => (c === "garden" ? [{ id: "public-note", date: "2026-01-01", updated: "2026-02-02" }] : [{ id: "public-post", date: "2026-03-03" }]),
  listIds: () => ["public-note", "secret-note"],
  getEntry: () => null,
}));

describe("sitemap", () => {
  it("lists listed content only, every Vault concept page, every project, and hreflang alternates in all three languages", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const { concepts } = await import("@/content/data/vault");
    const { projects } = await import("@/content/data/projects");
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.includes("secret-note"))).toBe(false);
    for (const l of ["en", "ja", "vi"]) {
      expect(urls).toContain(`https://example.test/${l}/garden/public-note`);
      expect(urls).toContain(`https://example.test/${l}/journal/public-post`);
      for (const c of concepts) expect(urls).toContain(`https://example.test/${l}/vault/concepts/${c.id}`);
      for (const p of projects) expect(urls).toContain(`https://example.test/${l}/projects/${p.slug}`);
    }
    for (const e of sitemap()) expect(Object.keys(e.alternates!.languages!)).toEqual(expect.arrayContaining(["en", "ja", "vi", "x-default"]));
    expect(sitemap().find((e) => e.url.endsWith("/en/garden/public-note"))!.lastModified).toEqual(new Date("2026-02-02T00:00:00Z"));
  });
  it("never lists the owner console, the API, or the secret room", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    for (const u of sitemap().map((e) => e.url)) expect(u).not.toMatch(/\/owner|\/api\/|backstage/);
  });
});
