import { beforeEach, describe, expect, it } from "vitest";
import { anilist, deezer, github, newsAdapters, openlibrary, listIntegrations, resetState, runIntegration, type Deps } from "@/core/integrations";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
function route(routes: Record<string, (url: string, init?: RequestInit) => Response>) {
  const seen: { url: string; init?: RequestInit }[] = [];
  const deps: Partial<Deps> = { env: {}, sleep: async () => {}, random: () => 0, now: () => Date.now(), fetch: (async (u: string | URL | Request, init?: RequestInit) => {
    const url = String(u); seen.push({ url, init });
    const hit = Object.entries(routes).find(([p]) => url.startsWith(p));
    if (!hit) throw new Error(`unrouted ${url}`);
    return hit[1](url, init);
  }) as typeof fetch };
  return { deps, seen };
}
beforeEach(() => resetState());

describe("registry", () => {
  it("every shipped adapter declares what the owner needs to know: scopes, hosts, rate limit, attribution, privacy, and only public-data / keyless unless stated", () => {
    const all = listIntegrations();
    expect(all.length).toBe(1 + 9 + 3);
    for (const i of all) {
      expect(i.scopes.length).toBeGreaterThan(0); expect(i.allowedHosts.length).toBeGreaterThan(0); expect(i.rateLimit.max).toBeGreaterThan(0);
      expect(i.attribution.url).toMatch(/^https:\/\//); expect(i.privacy).toBe("public-data");
      for (const h of i.allowedHosts) expect(h).not.toMatch(/^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[)/);
    }
    expect(all.filter((i) => i.auth.type !== "none").map((i) => i.id)).toEqual(["github.repos"]);
    expect(github.auth).toEqual({ type: "apiKey", env: "GITHUB_TOKEN", optional: true });
  });
});

describe("GitHub adapter", () => {
  it("maps live repositories (forks dropped) and sends the optional token only as a bearer header", async () => {
    const r = route({ "https://api.github.com/users/": () => json([
      { name: "a", html_url: "https://github.com/x/a", description: null, language: "TypeScript", fork: false, archived: false, created_at: "2024-01-01T00:00:00Z", pushed_at: "2026-01-01T00:00:00Z", homepage: "" },
      { name: "f", html_url: "https://github.com/x/f", description: null, language: null, fork: true, archived: false, created_at: "2024-01-01T00:00:00Z", pushed_at: "2026-02-01T00:00:00Z", homepage: null },
    ]) });
    const res = await runIntegration(github, { limit: 5 }, { ...r.deps, env: { GITHUB_TOKEN: "ghp_abcdefghijklmnopqrstuvwxyz0123" } });
    expect(res.data!.map((x) => x.name)).toEqual(["a"]);
    expect(new Headers(r.seen[0]!.init?.headers).get("authorization")).toContain("Bearer ");
    expect(JSON.stringify(res.health)).not.toContain("ghp_");
  });
  it("a rate-limited or failing API degrades to the committed snapshot instead of breaking", async () => {
    const r = route({ "https://api.github.com/": () => json({ message: "rate limit" }, 403) });
    const res = await runIntegration(github, { limit: 3 }, r.deps);
    expect(res.health).toMatchObject({ status: "degraded", source: "fallback" });
    expect(res.data!.length).toBeGreaterThan(0);
  });
});

describe("news adapters", () => {
  const byId = (id: string) => newsAdapters.find((a) => a.id === `news.${id}`)!;
  it("Hacker News: reads the id list, then each story, dropping failures", async () => {
    const r = route({
      "https://hacker-news.firebaseio.com/v0/topstories.json": () => json([1, 2, 3]),
      "https://hacker-news.firebaseio.com/v0/item/1.json": () => json({ id: 1, type: "story", title: "One", url: "https://x.test/1", score: 5, time: 1700000000 }),
      "https://hacker-news.firebaseio.com/v0/item/2.json": () => json({}, 500),
      "https://hacker-news.firebaseio.com/v0/item/3.json": () => json({ id: 3, type: "story", title: "Three", url: "javascript:alert(1)" }),
    });
    const res = await runIntegration(byId("hn"), { limit: 3 }, r.deps);
    expect(res.data!.map((i) => i.title)).toEqual(["One", "Three"]);
    expect(res.data![1]!.url).toContain("news.ycombinator.com"); // unsafe link replaced by the discussion URL
  });
  it("an RSS source with no parseable items is a failure, not an empty success", async () => {
    const r = route({ "https://feeds.bbci.co.uk/": () => new Response("<rss></rss>") });
    expect((await runIntegration(byId("bbc"), { limit: 5 }, r.deps)).health.status).toBe("failed");
  });
  it("Atom feeds parse, and sources carry their group and language", async () => {
    const r = route({ "https://www.theverge.com/": () => new Response(`<feed><entry><title>T</title><link rel="alternate" href="https://www.theverge.com/a"/><published>2026-01-01T00:00:00Z</published></entry></feed>`) });
    expect((await runIntegration(byId("verge"), { limit: 5 }, r.deps)).data![0]!.title).toBe("T");
    expect(newsAdapters.map((a) => `${a.meta!.group}/${a.meta!.lang}`).sort()).toEqual(["dev/en", "dev/en", "dev/en", "ja/ja", "ja/ja", "vi/vi", "world/en", "world/en", "world/en"]);
  });
  it("a source can never contact a host it did not declare", async () => {
    const evil = { ...byId("bbc"), fetch: async (ctx: { getText(u: string): Promise<string> }) => { await ctx.getText("https://evil.example/steal"); return []; } };
    const r = route({});
    const res = await runIntegration(evil as never, { limit: 1 } as never, r.deps);
    expect(r.seen).toHaveLength(0); expect(res.health.status).toBe("failed");
  });
});

describe("library adapters", () => {
  it("AniList: POSTs a GraphQL body (never interpolating the search term into the query) and normalises entries", async () => {
    const r = route({ "https://graphql.anilist.co": () => json({ data: { Page: { media: [{ id: 1, title: { english: "X", native: "エックス" }, siteUrl: "https://anilist.co/anime/1", seasonYear: 2011, averageScore: 90, genres: ["A"], coverImage: { medium: "https://s4.anilist.co/c.jpg" } }] } } }) });
    const res = await runIntegration(anilist, { op: "lookup", search: 'x"){ evil }' }, r.deps);
    expect(res.data![0]).toMatchObject({ title: "X", image: "https://s4.anilist.co/c.jpg" });
    const sent = JSON.parse(String(r.seen[0]!.init!.body));
    expect(sent.variables).toEqual({ s: 'x"){ evil }' }); expect(sent.query).not.toContain("evil");
    expect(r.seen[0]!.init!.method).toBe("POST");
  });
  it("Open Library and Deezer: normalise, validate, and reject empty results as failures", async () => {
    const ol = route({ "https://openlibrary.org/trending/weekly.json": () => json({ works: [{ key: "/works/OL1W", title: "B", cover_i: 5 }, { key: "../bad", title: "C" }] }) });
    expect((await runIntegration(openlibrary, { op: "trending", n: 5 }, ol.deps)).data!.map((b) => b.title)).toEqual(["B"]);
    const dz = route({ "https://api.deezer.com/chart": () => json({ data: [] }) });
    expect((await runIntegration(deezer, { op: "chart", n: 5 }, dz.deps)).health.status).toBe("failed");
  });
});
