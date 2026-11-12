/**
 * Writes src/content/data/github-snapshot.json from the public GitHub API.
 *   npm run snapshot:github
 * The snapshot is the *fallback* for the live, cached feed (src/lib/github.ts) and the
 * evidence behind the timeline / profile statistics. It contains only public data.
 * An optional GITHUB_TOKEN (read from the environment, never written to disk) raises rate limits.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const USER = "JunCodera1";
const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "my-digital-space-snapshot" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

type ApiRepo = {
  name: string; description: string | null; language: string | null; fork: boolean; archived: boolean;
  created_at: string; pushed_at: string; homepage: string | null; html_url: string; topics?: string[];
};

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return (await res.json()) as T;
}

const user = await get<{ login: string; name: string | null; created_at: string; public_repos: number }>(
  `https://api.github.com/users/${USER}`,
);
const repos: ApiRepo[] = [];
for (let page = 1; page <= 5; page++) {
  const batch = await get<ApiRepo[]>(`https://api.github.com/users/${USER}/repos?per_page=100&page=${page}&sort=pushed`);
  repos.push(...batch);
  if (batch.length < 100) break;
}
const owned = repos.filter((r) => !r.fork);

const snapshot = {
  fetchedAt: new Date().toISOString(),
  source: `https://api.github.com/users/${USER}`,
  user: { login: user.login, createdAt: user.created_at, publicRepos: user.public_repos },
  forkCount: repos.length - owned.length,
  repos: owned.map((r) => ({
    name: r.name,
    url: r.html_url,
    description: r.description,
    language: r.language,
    createdAt: r.created_at,
    pushedAt: r.pushed_at,
    homepage: r.homepage || null,
    archived: r.archived,
  })),
};

const out = resolve(import.meta.dirname, "../src/content/data/github-snapshot.json");
writeFileSync(out, JSON.stringify(snapshot, null, 1) + "\n");
console.log(`snapshot: ${owned.length} owned repos, ${snapshot.forkCount} forks → ${out}`);
