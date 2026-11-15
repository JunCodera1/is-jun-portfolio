import { githubSnapshot, type RepoRecord } from "@/content/data/github";
import { profile } from "@/content/data/profile";
import { defineIntegration } from "../sdk";

interface ApiRepo { name: string; html_url: string; description: string | null; language: string | null; fork: boolean; archived: boolean; created_at: string; pushed_at: string; homepage: string | null }

/** Public repositories of the owner's GitHub account. The committed snapshot is the fallback, so an outage never breaks a page. */
export const github = defineIntegration<{ limit: number }, RepoRecord[]>({
  id: "github.repos", name: "GitHub", kind: "development",
  auth: { type: "apiKey", env: "GITHUB_TOKEN", optional: true }, scopes: ["public:read"],
  allowedHosts: ["api.github.com"], rateLimit: { max: 30, perMs: 60_000 }, ttlMs: 3_600_000,
  attribution: { label: "GitHub REST API", url: "https://docs.github.com/rest" }, privacy: "public-data", probe: { limit: 1 },
  async fetch(ctx, { limit }) {
    const data = await ctx.getJson(`https://api.github.com/users/${profile.githubHandle}/repos?sort=pushed&per_page=30`, { headers: { Accept: "application/vnd.github+json" } });
    if (!Array.isArray(data)) throw new Error("unexpected response shape");
    const repos = (data as ApiRepo[]).filter((r) => !r.fork).slice(0, limit).map<RepoRecord>((r) => ({ name: r.name, url: r.html_url, description: r.description, language: r.language, createdAt: r.created_at, pushedAt: r.pushed_at, homepage: r.homepage || null, archived: r.archived }));
    if (repos.length === 0) throw new Error("no repositories returned");
    return repos;
  },
  fallback: ({ limit }) => [...githubSnapshot.repos].sort((a, b) => (a.pushedAt < b.pushedAt ? 1 : -1)).slice(0, limit),
});
