import "server-only";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { githubSnapshot } from "@/content/data/github";
import { paths } from "@/content/data/graph";
import { log } from "@/content/data/log";
import { projects } from "@/content/data/projects";
import { skills } from "@/content/data/skills";
import { ownerTimeline } from "@/content/data/timeline";
import { concepts, decisions, ideas, mistakes, research, TOPICS } from "@/content/data/vault";
import { getEntries } from "@/lib/content";
import { firstRepoPerLanguage } from "@/lib/derived";
import { resolveText, textOf } from "@/lib/localized";
import { publicOnly, type Edge, type Item, type Knowledge, type Status } from "./types";

/**
 * The one place that knows where content comes from. Everything cross-cutting (search, graph, timeline, feeds, discovery)
 * is a projection of what this returns. Storage is untouched: typed data files and MDX stay the source of truth.
 */
export async function getKnowledgeAll(locale: Locale): Promise<Knowledge> {
  const t = await getTranslations({ locale });
  const items: Item[] = [];
  const edges: Edge[] = [];
  const add = (i: Item) => { items.push(i); return i.id; };
  const link = (from: string, to: string, kind: Edge["kind"], evidence?: string) => { if (!edges.some((e) => e.from === from && e.to === to && e.kind === kind)) edges.push({ from, to, kind, evidence }); };
  const loc = (v: Parameters<typeof resolveText>[0]) => { const r = resolveText(v, locale); return { text: r.text, lang: r.lang, status: r.status as Status }; };

  // ── projects and technologies (evidence: files in the repositories)
  const topicOfProject = (kinds: readonly string[]) => (kinds.includes("ml") ? "ai" : "web");
  for (const p of projects) {
    const s = loc(p.summary);
    add({ id: `project:${p.slug}`, kind: "project", title: p.name, summary: s.text, topic: topicOfProject(p.kinds), tags: [...new Set(p.stack.map((x) => x.name))], href: `/projects/${p.slug}`, source: "github", provenance: { origin: "data/projects.ts", evidence: p.repos[0] }, visibility: p.visibility ?? "public", status: s.status, lang: s.lang });
  }
  for (const sk of skills) {
    add({ id: `tech:${sk.name}`, kind: "tech", title: sk.name, summary: t(`profile.categories.${sk.category}`), tags: [sk.category], href: "/profile", source: "github", provenance: { origin: "data/skills.ts", evidence: sk.usedIn[0]?.evidence }, visibility: "public", status: "translated", lang: locale });
    for (const u of sk.usedIn) link(`project:${u.slug}`, `tech:${sk.name}`, "uses", u.evidence);
  }

  // ── notes and posts (MDX)
  for (const [collection, kind] of [["garden", "note"], ["journal", "post"]] as const) {
    for (const e of getEntries(collection, locale)) {
      add({ id: `${collection}:${e.id}`, kind, title: e.title, summary: e.summary, tags: e.tags, date: e.date, href: `/${collection}/${e.id}`, source: "owner", provenance: { origin: `content/${collection}/${e.id}` }, visibility: e.visibility, status: e.status, lang: e.lang });
    }
  }
  for (const e of [...getEntries("garden", locale), ...getEntries("journal", locale)]) for (const r of e.related) {
    const other = [...getEntries("garden", locale), ...getEntries("journal", locale)].find((x) => x.id === r);
    if (other) link(`${e.collection}:${e.id}`, `${other.collection}:${other.id}`, "related");
  }

  // ── Vault entries (typed data files)
  const vault = <T extends { id: string; topic: string; visibility?: Item["visibility"] }>(list: readonly T[], kind: Item["kind"], href: (x: T) => string, parts: (x: T) => { title: Parameters<typeof resolveText>[0]; summary: Parameters<typeof resolveText>[0]; date?: string }, origin: string) => {
    for (const x of list) {
      const { title, summary, date } = parts(x);
      const ti = loc(title), su = loc(summary);
      add({ id: `${kind}:${x.id}`, kind, title: ti.text, summary: su.text, topic: x.topic, tags: [], date, href: href(x), source: "site", provenance: { origin }, visibility: x.visibility ?? "public", status: ti.status, lang: ti.lang });
    }
  };
  vault(concepts, "concept", (x) => `/vault/concepts/${x.id}`, (x) => ({ title: x.title, summary: x.summary }), "data/vault/concepts.ts");
  vault(research, "research", (x) => `/vault/research#${x.id}`, (x) => ({ title: x.title, summary: x.question, date: x.date }), "data/vault/research.ts");
  vault(mistakes, "mistake", (x) => `/vault/mistakes#${x.id}`, (x) => ({ title: x.title, summary: x.lesson, date: x.date }), "data/vault/mistakes.ts");
  vault(decisions, "decision", (x) => `/vault/decisions#${x.id}`, (x) => ({ title: x.title, summary: x.decision, date: x.date }), "data/vault/decisions.ts");
  vault(ideas, "idea", (x) => `/vault/ideas#${x.id}`, (x) => ({ title: x.title, summary: x.pitch, date: x.since }), "data/vault/ideas.ts");
  for (const d of decisions) if (d.supersededBy) link(`decision:${d.id}`, `decision:${d.supersededBy}`, "supersedes");

  // ── learning paths: steps in order
  for (const p of paths) {
    p.steps.forEach((s, i) => {
      const ti = loc(s.label), su = s.note ? loc(s.note) : { text: textOf(p.title, locale), status: "translated" as Status };
      add({ id: s.id, kind: "path", title: ti.text, summary: su.text, topic: "japanese", tags: [], href: s.href ?? "/vault/roadmap", source: "owner", provenance: { origin: "data/graph.ts", evidence: p.id }, visibility: "public", status: ti.status, lang: ti.lang });
      if (i > 0) link(p.steps[i - 1]!.id, s.id, "next");
    });
  }

  // ── site log and timeline events
  for (const l of log) {
    const x = loc(l.text);
    add({ id: `log:${l.id}`, kind: "log", title: x.text, summary: "", tags: [l.tag], date: l.date, href: `/timeline#log-${l.id}`, source: "site", provenance: { origin: "data/log.ts" }, visibility: l.visibility ?? "public", status: x.status, lang: x.lang });
  }
  add({ id: "event:github-account", kind: "event", title: t("timeline.accountCreated"), summary: "", tags: [], date: githubSnapshot.user.createdAt.slice(0, 10), href: `https://github.com/${githubSnapshot.user.login}`, source: "github", provenance: { origin: "data/github-snapshot.json" }, visibility: "public", status: "translated", lang: locale });
  for (const f of firstRepoPerLanguage(githubSnapshot.repos)) {
    add({ id: `event:first-repo-${f.language}`, kind: "event", title: t("timeline.firstRepo", { language: f.language, repo: f.repo }), summary: "", tags: [], date: f.createdAt.slice(0, 10), href: f.url, source: "github", provenance: { origin: "data/github-snapshot.json", evidence: f.repo }, visibility: "public", status: "translated", lang: locale });
  }
  for (const o of ownerTimeline) {
    const x = loc(o.title);
    add({ id: `event:owner-${o.id}`, kind: "event", title: x.text, summary: "", tags: [o.kind], date: o.date, href: o.url ?? "/timeline", source: "owner", provenance: { origin: "data/timeline.ts" }, visibility: "public", status: x.status, lang: x.lang });
  }

  // ── topic hubs: one per topic that has at least one item
  for (const topic of TOPICS) {
    const members = items.filter((i) => i.topic === topic);
    if (members.length === 0) continue;
    const label = t(`vault.topics.${topic}`);
    add({ id: `topic:${topic}`, kind: "topic", title: label, summary: "", tags: [], href: `/search?q=${encodeURIComponent(label)}`, source: "site", provenance: { origin: "vault topics" }, visibility: "public", status: "translated", lang: locale });
    for (const m of members) link(m.id, `topic:${topic}`, "topic");
  }

  return { items, edges };
}

/** What may leave the site: public items only, and only edges between them. */
export async function getKnowledge(locale: Locale): Promise<Knowledge> {
  return publicOnly(await getKnowledgeAll(locale));
}
