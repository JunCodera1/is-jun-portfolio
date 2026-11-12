import { afterEach, describe, expect, it, vi } from "vitest";
import { getRecentRepos } from "@/lib/github-feed";
import { githubSnapshot } from "@/content/data/github";

const api = (over: object = {}) => ({
  name: "live-repo", html_url: "https://github.com/x/live-repo", description: "d", language: "TypeScript", fork: false, archived: false,
  created_at: "2026-01-01T00:00:00Z", pushed_at: "2026-11-01T00:00:00Z", homepage: "", ...over,
});

afterEach(() => vi.unstubAllGlobals());

describe("GitHub feed degrades gracefully (row 46: API errors never break the site)", () => {
  it("uses live data when the API answers, dropping forks", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify([api({ name: "forked", fork: true }), api()]), { status: 200 })));
    const feed = await getRecentRepos(5);
    expect(feed.source).toBe("live");
    expect(feed.repos.map((r) => r.name)).toEqual(["live-repo"]);
    expect(feed.repos[0]!.homepage).toBeNull();
  });
  it.each([403, 429, 500])("falls back to the snapshot on HTTP %s (rate limit / outage)", async (status) => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status })));
    const feed = await getRecentRepos(3);
    expect(feed.source).toBe("snapshot");
    expect(feed.repos).toHaveLength(3);
    expect(feed.asOf).toBe(githubSnapshot.fetchedAt);
  });
  it("falls back when the network throws", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("network down"); }));
    expect((await getRecentRepos(1)).source).toBe("snapshot");
  });
  it("falls back on malformed JSON shapes", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ message: "nope" }), { status: 200 })));
    expect((await getRecentRepos(1)).source).toBe("snapshot");
  });
  it("sorts the snapshot by most recent push", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("x"); }));
    const dates = (await getRecentRepos(10)).repos.map((r) => r.pushedAt);
    expect([...dates].sort().reverse()).toEqual(dates);
  });
});
