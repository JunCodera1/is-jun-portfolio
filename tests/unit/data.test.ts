import { describe, expect, it } from "vitest";
import { projects } from "@/content/data/projects";
import { skills } from "@/content/data/skills";
import { profile, socialLinks } from "@/content/data/profile";
import { githubSnapshot } from "@/content/data/github";
import { navigation } from "@/content/data/navigation";
import { resolveText } from "@/lib/localized";
import { locales } from "@/i18n/routing";

describe("content integrity (rows 49, 51)", () => {
  it("project slugs are unique and every skill links to a real project", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of skills) for (const u of s.usedIn) expect(slugs, `${s.name} → ${u.slug}`).toContain(u.slug);
  });
  it("every stack item names the file that proves it (no unevidenced technology)", () => {
    for (const p of projects) {
      expect(p.stack.length, p.slug).toBeGreaterThan(0);
      for (const s of p.stack) expect(s.evidence.trim(), `${p.slug}/${s.name}`).not.toBe("");
    }
  });
  it("every project repo exists in the verified GitHub snapshot", () => {
    const names = new Set(githubSnapshot.repos.map((r) => r.name));
    for (const p of projects) for (const r of p.repos) expect(names, r).toContain(r.split("/")[1]);
  });
  it("every project has English copy and a resolvable text for every locale", () => {
    for (const p of projects) {
      expect(p.summary.en.length).toBeGreaterThan(20);
      for (const l of locales) expect(resolveText(p.summary, l).text.length).toBeGreaterThan(0);
    }
  });
  it("demo links are https and carry the date they were last checked", () => {
    for (const p of projects) if (p.demo) {
      expect(p.demo.url).toMatch(/^https:\/\//);
      expect(p.demo.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it("only the confirmed GitHub link is published; no e-mail is invented", () => {
    expect(socialLinks.map((s) => s.id)).toEqual(["github"]);
    expect(socialLinks[0]!.url).toBe(`https://github.com/${profile.githubHandle}`);
    expect(profile.email).toBeUndefined();
  });
  it("navigation ids are unique and locale-less paths", () => {
    expect(new Set(navigation.map((n) => n.id)).size).toBe(navigation.length);
    for (const n of navigation) expect(n.href).toMatch(/^\/[a-z-]*$/);
  });
  it("no secrets or tokens sneaked into the committed GitHub snapshot", () => {
    const raw = JSON.stringify(githubSnapshot);
    expect(raw).not.toMatch(/ghp_|github_pat_|Bearer |password|secret/i);
  });
});
