import { describe, expect, it } from "vitest";
import { concepts, decisions, glossary, ideas, learning, MODULES, mistakes, reading, research, roadmap, STAGES, TOPICS } from "@/content/data/vault";
import { textOf } from "@/lib/localized";
import en from "../../messages/en.json";

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const unique = (ids: string[]) => new Set(ids).size === ids.length;

describe("Knowledge Vault data", () => {
  it("ids are unique inside every module", () => {
    for (const list of [concepts, decisions, glossary, ideas, learning, mistakes, research] as { id: string }[][]) expect(unique(list.map((x) => x.id))).toBe(true);
    expect(unique(roadmap.flatMap((t) => t.steps.map((s) => s.id)))).toBe(true);
  });
  it("every topic and stage is a known one, and every date is a real ISO day", () => {
    for (const x of [...concepts, ...decisions, ...glossary, ...ideas, ...mistakes, ...research]) expect(TOPICS).toContain(x.topic);
    for (const i of ideas) { expect(STAGES).toContain(i.stage); expect(i.since).toMatch(ISO); }
    for (const d of [...decisions, ...mistakes, ...research]) { expect(d.date).toMatch(ISO); expect(Number.isNaN(new Date(d.date).getTime())).toBe(false); }
  });
  it("superseded decisions point at an existing decision; concepts only reference real glossary terms", () => {
    for (const d of decisions) if (d.supersededBy) expect(decisions.some((x) => x.id === d.supersededBy)).toBe(true);
    expect(decisions.filter((d) => d.status === "superseded").every((d) => d.supersededBy)).toBe(true);
    for (const c of concepts) for (const r of c.related) expect(glossary.some((g) => g.id === r)).toBe(true);
  });
  it("every glossary term is present in all three languages, with a definition", () => {
    for (const g of glossary) { for (const k of ["en", "ja", "vi"] as const) expect(g.term[k].trim().length).toBeGreaterThan(0); expect(g.def.en.length).toBeGreaterThan(10); expect(textOf(g.def, "ja").length).toBeGreaterThan(3); expect(textOf(g.def, "vi").length).toBeGreaterThan(3); expect(textOf(g.def, "ja")).not.toBe(g.def.en); }
  });
  it("research sources are https links; reading items have sane progress", () => {
    for (const r of research) { expect(r.sources.length).toBeGreaterThan(0); for (const s of r.sources) expect(s.url).toMatch(/^https:\/\//); }
    for (const r of reading) if (r.progress) { expect(r.progress.current).toBeGreaterThanOrEqual(0); expect(r.progress.current).toBeLessThanOrEqual(r.progress.total); }
  });
  it("nothing personal is invented: the learning log and reading list start empty, and no step has a made-up date", () => {
    expect(reading).toHaveLength(0);
    for (const l of learning) { expect(l.log).toHaveLength(0); expect(l.started).toBeUndefined(); }
    for (const t of roadmap) for (const s of t.steps) expect(s.date).toBeUndefined();
  });
  it("every module has its name, description and lead in the English messages", () => {
    const m = (en as unknown as { vault: { modules: Record<string, { name: string; desc: string; lead: string }> } }).vault.modules;
    for (const mod of MODULES) { expect(m[mod.id]?.name).toBeTruthy(); expect(m[mod.id]?.desc).toBeTruthy(); expect(m[mod.id]?.lead).toBeTruthy(); }
  });
});
