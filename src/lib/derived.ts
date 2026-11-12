import type { RepoRecord } from "@/content/data/github";

/** Languages that describe markup/build output rather than something a person "writes software in". */
export const NON_LANGUAGE = new Set(["HTML", "CSS", "Makefile", "Jupyter Notebook", "Dockerfile", "Shell"]);

export interface LanguageCount { language: string; count: number }

/** Count of repositories per primary language (as reported by GitHub). A repository count — not a skill rating. */
export function languageCounts(repos: RepoRecord[]): LanguageCount[] {
  const map = new Map<string, number>();
  for (const r of repos) if (r.language) map.set(r.language, (map.get(r.language) ?? 0) + 1);
  return [...map.entries()]
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count || a.language.localeCompare(b.language));
}

export interface FirstRepo { language: string; repo: string; url: string; createdAt: string }

/** Earliest-created public repository for each programming language. */
export function firstRepoPerLanguage(repos: RepoRecord[]): FirstRepo[] {
  const first = new Map<string, RepoRecord>();
  for (const r of repos) {
    if (!r.language || NON_LANGUAGE.has(r.language)) continue;
    const prev = first.get(r.language);
    if (!prev || r.createdAt < prev.createdAt) first.set(r.language, r);
  }
  return [...first.entries()]
    .map(([language, r]) => ({ language, repo: r.name, url: r.url, createdAt: r.createdAt }))
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
}

/** Most recent push across a set of repositories (by name). */
export function latestPush(repos: RepoRecord[], names: string[]): string | undefined {
  const dates = repos.filter((r) => names.includes(r.name)).map((r) => r.pushedAt);
  return dates.sort().at(-1);
}

export function earliestCreated(repos: RepoRecord[], names: string[]): string | undefined {
  const dates = repos.filter((r) => names.includes(r.name)).map((r) => r.createdAt);
  return dates.sort().at(0);
}
