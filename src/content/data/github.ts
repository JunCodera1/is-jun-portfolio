import snapshot from "./github-snapshot.json";

export interface RepoRecord {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  createdAt: string;
  pushedAt: string;
  homepage: string | null;
  archived: boolean;
}

export interface GithubSnapshot {
  fetchedAt: string;
  source: string;
  user: { login: string; createdAt: string; publicRepos: number };
  forkCount: number;
  repos: RepoRecord[];
}

export const githubSnapshot = snapshot as GithubSnapshot;
