import "server-only";
import { env } from "@/lib/env";
import { githubSnapshot, type RepoRecord } from "@/content/data/github";
import { profile } from "@/content/data/profile";

export interface RepoFeed {
  repos: RepoRecord[];
  /** "live" = fresh from the GitHub API (cached ≤ 1 h); "snapshot" = committed fallback (API unreachable / rate-limited). */
  source: "live" | "snapshot";
  asOf: string;
}

interface ApiRepo {
  name: string; html_url: string; description: string | null; language: string | null; fork: boolean; archived: boolean;
  created_at: string; pushed_at: string; homepage: string | null;
}

const snapshotFeed = (limit: number): RepoFeed => ({
  repos: [...githubSnapshot.repos].sort((a, b) => (a.pushedAt < b.pushedAt ? 1 : -1)).slice(0, limit),
  source: "snapshot",
  asOf: githubSnapshot.fetchedAt,
});

/**
 * Most recently pushed, non-fork public repositories.
 * Never throws: any failure (network, 403/429 rate limit, bad JSON) degrades to the committed snapshot,
 * so an API outage can never break a page (row 46).
 */
export async function getRecentRepos(limit = 6): Promise<RepoFeed> {
  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "my-digital-space" };
    if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
    const res = await fetch(
      `https://api.github.com/users/${profile.githubHandle}/repos?sort=pushed&per_page=30`,
      { headers, next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return snapshotFeed(limit);
    const data = (await res.json()) as ApiRepo[];
    if (!Array.isArray(data)) return snapshotFeed(limit);
    const repos = data
      .filter((r) => !r.fork)
      .slice(0, limit)
      .map<RepoRecord>((r) => ({
        name: r.name, url: r.html_url, description: r.description, language: r.language,
        createdAt: r.created_at, pushedAt: r.pushed_at, homepage: r.homepage || null, archived: r.archived,
      }));
    if (repos.length === 0) return snapshotFeed(limit);
    return { repos, source: "live", asOf: new Date().toISOString() };
  } catch {
    return snapshotFeed(limit);
  }
}
