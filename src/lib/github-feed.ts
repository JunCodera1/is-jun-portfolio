import "server-only";
import { githubSnapshot, type RepoRecord } from "@/content/data/github";
import { github, runIntegration } from "@/core/integrations";

export interface RepoFeed {
  repos: RepoRecord[];
  /** "live" = fresh from the GitHub API (cached ≤ 1 h); "snapshot" = committed fallback (API unreachable / rate-limited). */
  source: "live" | "snapshot";
  asOf: string;
}

/** Most recently pushed, non-fork public repositories, through the Integration SDK (timeouts, retries, rate limit, snapshot fallback). Never throws. */
export async function getRecentRepos(limit = 6): Promise<RepoFeed> {
  const r = await runIntegration(github, { limit });
  const live = r.health.source === "live" || r.health.source === "cache";
  return { repos: r.data ?? [], source: live ? "live" : "snapshot", asOf: live ? r.health.checkedAt : githubSnapshot.fetchedAt };
}
