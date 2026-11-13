import { describe, expect, it, vi } from "vitest";
import en from "../../messages/en.json";
import ja from "../../messages/ja.json";
import vi_ from "../../messages/vi.json";

// next-intl's server API is not available outside a Next.js request; a tiny stand-in that reads the real message files is enough here.
vi.mock("next-intl/server", () => {
  const all: Record<string, unknown> = { en, ja, vi: vi_ };
  return {
    getTranslations: async ({ locale, namespace }: { locale: string; namespace?: string }) => {
      const dig = (key: string) => `${namespace ? `${namespace}.` : ""}${key}`.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), all[locale]);
      const t = (key: string, p: Record<string, unknown> = {}) => String(dig(key) ?? key).replace(/\{(\w+)[^}]*\}/g, (_m, k) => String(p[k] ?? ""));
      t.has = (key: string) => dig(key) !== undefined;
      return t;
    },
  };
});
import { locales } from "@/i18n/routing";
import { getKnowledge, getKnowledgeAll } from "@/lib/knowledge/build";
import { degree, publicOnly, suggestConnections, type Knowledge } from "@/lib/knowledge/types";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

describe("unified data layer", () => {
  it("builds for every locale with the same ids (ids never depend on language)", async () => {
    const ids = await Promise.all(locales.map(async (l) => (await getKnowledgeAll(l)).items.map((i) => i.id).sort()));
    expect(ids[1]).toEqual(ids[0]);
    expect(ids[2]).toEqual(ids[0]);
    expect(ids[0]!.length).toBeGreaterThan(40);
  });
  it("ids are unique, every edge points at existing items, every item has provenance and a real href", async () => {
    const k = await getKnowledgeAll("en");
    expect(new Set(k.items.map((i) => i.id)).size).toBe(k.items.length);
    const ids = new Set(k.items.map((i) => i.id));
    for (const e of k.edges) { expect(ids.has(e.from), e.from).toBe(true); expect(ids.has(e.to), e.to).toBe(true); expect(e.from).not.toBe(e.to); }
    for (const i of k.items) { expect(i.provenance.origin.length).toBeGreaterThan(2); expect(i.href).toMatch(/^(\/|https:\/\/)/); expect(i.title.trim().length).toBeGreaterThan(0); if (i.date) expect(i.date).toMatch(ISO); }
  });
  it("dates are only ever real: log, vault, notes and github events carry ISO days; nothing is invented for undated items", async () => {
    const k = await getKnowledgeAll("en");
    for (const i of k.items.filter((x) => x.kind === "tech" || x.kind === "topic" || x.kind === "path" || x.kind === "project" || x.kind === "concept")) expect(i.date).toBeUndefined();
    for (const i of k.items.filter((x) => ["log", "decision", "mistake", "research", "idea", "note", "post"].includes(x.kind))) expect(i.date, i.id).toMatch(ISO);
  });
  it("every project→technology edge carries the repository evidence", async () => {
    const k = await getKnowledgeAll("en");
    const uses = k.edges.filter((e) => e.kind === "uses");
    expect(uses.length).toBeGreaterThan(10);
    for (const e of uses) expect((e.evidence ?? "").length, `${e.from}→${e.to}`).toBeGreaterThan(2);
  });
  it("a superseded decision links to what replaced it", async () => {
    const k = await getKnowledgeAll("en");
    expect(k.edges).toContainEqual(expect.objectContaining({ from: "decision:css-only-motion", to: "decision:anime-js", kind: "supersedes" }));
  });
  it("the public projection of the real data equals the data (everything is public today) and has no dangling edges", async () => {
    const all = await getKnowledgeAll("en"), pub = await getKnowledge("en");
    expect(pub.items).toHaveLength(all.items.length);
    expect(pub.edges).toHaveLength(all.edges.length);
  });
});

describe("visibility is enforced at one choke point", () => {
  const k: Knowledge = {
    items: [
      { id: "a", kind: "note", title: "A", summary: "", tags: [], href: "/a", source: "owner", provenance: { origin: "t" }, visibility: "public", status: "translated", lang: "en" },
      { id: "b", kind: "note", title: "B", summary: "", tags: [], href: "/b", source: "owner", provenance: { origin: "t" }, visibility: "private", status: "translated", lang: "en" },
      { id: "c", kind: "note", title: "C", summary: "", tags: [], href: "/c", source: "owner", provenance: { origin: "t" }, visibility: "unlisted", status: "translated", lang: "en" },
    ],
    edges: [{ from: "a", to: "b", kind: "related" }, { from: "a", to: "c", kind: "related" }, { from: "b", to: "c", kind: "related" }],
  };
  it("private and unlisted items, and every edge touching them, disappear", () => {
    const p = publicOnly(k);
    expect(p.items.map((i) => i.id)).toEqual(["a"]);
    expect(p.edges).toEqual([]);
  });
});

describe("rule-based connection suggestions", () => {
  const mk = (id: string, title: string, tags: string[]): Knowledge["items"][number] => ({ id, kind: "note", title, summary: "", tags, href: `/${id}`, source: "owner", provenance: { origin: "t" }, visibility: "public", status: "translated", lang: "en" });
  const k: Knowledge = { items: [mk("a", "Static rendering notes", ["web", "rendering"]), mk("b", "Rendering pipeline", ["web", "rendering"]), mk("c", "Cooking", ["food"]), mk("d", "Another rendering note", ["web", "rendering"])], edges: [{ from: "a", to: "b", kind: "related" }] };
  it("suggests unlinked pairs that share enough, never already-linked ones, deterministically", () => {
    const s = suggestConnections(k, 2);
    const pairs = s.map((x) => `${x.a.id}-${x.b.id}`);
    expect(pairs).not.toContain("a-b");
    expect(pairs).toContain("a-d");
    expect(pairs.join()).not.toContain("c");
    expect(suggestConnections(k, 2)).toEqual(s);
  });
  it("degree counts both directions", () => { expect(degree("a", k.edges)).toBe(1); expect(degree("b", k.edges)).toBe(1); expect(degree("c", k.edges)).toBe(0); });
});

import { BOARD, layoutGraph, nodeBox } from "@/lib/graph";

describe("the knowledge graph layout on the real data", () => {
  for (const locale of ["en", "ja", "vi"] as const) {
    it(`no two labels overlap and every node stays on the board (${locale})`, async () => {
      const k = await getKnowledge(locale);
      const nodes = k.items.filter((i) => !["log", "event"].includes(i.kind));
      const ids = new Set(nodes.map((n) => n.id));
      const edges = k.edges.filter((e) => ids.has(e.from) && ids.has(e.to));
      const big = (id: string) => degree(id, edges) >= 5;
      const pos = layoutGraph(nodes.map((n) => ({ id: n.id, label: n.title, big: big(n.id) })), edges);
      const bad: string[] = [];
      for (let i = 0; i < nodes.length; i++) {
        const p = pos[nodes[i]!.id]!;
        expect(p.x).toBeGreaterThanOrEqual(0); expect(p.x).toBeLessThanOrEqual(1); expect(p.y).toBeGreaterThanOrEqual(0); expect(p.y).toBeLessThanOrEqual(1);
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodeBox(nodes[i]!.title, big(nodes[i]!.id)), b = nodeBox(nodes[j]!.title, big(nodes[j]!.id)), q = pos[nodes[j]!.id]!;
          const dx = Math.abs(p.x - q.x) * BOARD.w, dy = Math.abs(p.y - q.y) * BOARD.h;
          if (dx < (a.w + b.w) / 2 - 0.05 && dy < (a.h + b.h) / 2 - 0.05) bad.push(`${nodes[i]!.title} / ${nodes[j]!.title}`);
        }
      }
      expect(bad).toEqual([]);
    });
  }
});

import { buildJsonFeed } from "@/lib/jsonfeed";
describe("JSON Feed", () => {
  it("has the JSON Feed 1.1 shape, newest first, real dates only", () => {
    const f = buildJsonFeed({ title: "T", homeUrl: "https://x.test/en", feedUrl: "https://x.test/en/feed.json", description: "d", language: "en", items: [
      { id: "a", url: "https://x.test/en/a", title: "A", summary: "", date: "2026-01-02", tags: ["note"], language: "en" },
      { id: "b", url: "https://x.test/en/b", title: "B", summary: "s", date: "2026-03-04", tags: [], language: "en" },
    ] });
    expect(f.version).toBe("https://jsonfeed.org/version/1.1");
    expect(f.items.map((i) => i.id)).toEqual(["b", "a"]);
    expect(f.items[0]!.date_published).toBe("2026-03-04T00:00:00Z");
    expect(f.items[1]!.summary).toBeUndefined();
  });
});
