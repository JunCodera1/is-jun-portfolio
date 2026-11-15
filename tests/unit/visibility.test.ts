import { afterEach, describe, expect, it, vi } from "vitest";
import { allProjects, projects } from "@/content/data/projects";
import * as vault from "@/content/data/vault";
import { isListed, type Visible } from "@/content/data/vault/types";

vi.mock("next-intl/server", async () => (await import("./helpers/intl-mock")).intlServerMock);

describe("visibility is enforced where public pages read their data, not only in the data layer", () => {
  it("isListed treats omitted as public and everything else as not listed", () => {
    expect(isListed({})).toBe(true); expect(isListed({ visibility: "public" })).toBe(true);
    for (const v of ["unlisted", "private", "restricted"] as const) expect(isListed({ visibility: v })).toBe(false);
  });
  it("every list a public page can import is exactly the listed subset of its unfiltered twin", () => {
    expect(projects).toEqual(allProjects.filter((p) => (p.visibility ?? "public") === "public"));
    for (const [pub, all] of [[vault.concepts, vault.conceptsAll], [vault.decisions, vault.decisionsAll], [vault.ideas, vault.ideasAll], [vault.mistakes, vault.mistakesAll], [vault.research, vault.researchAll]] as const) {
      expect(pub).toEqual((all as readonly Visible[]).filter(isListed));
      for (const x of pub as readonly Visible[]) expect(isListed(x)).toBe(true);
    }
  });
  it("module counts shown on the hub count only listed entries", () => {
    expect(vault.moduleCounts.decisions).toBe(vault.decisions.length);
    expect(vault.moduleCounts.concepts).toBe(vault.concepts.length);
  });
});

describe("end to end: a private entry reaches the owner's data layer and nothing public", () => {
  afterEach(() => { vi.resetModules(); vi.doUnmock("@/content/data/vault/decisions"); });
  it("a private decision is invisible to pages, search, feeds-by-knowledge, the assistant and discovery, but present for the owner and agents", async () => {
    vi.resetModules();
    const real = await vi.importActual<typeof import("@/content/data/vault/decisions")>("@/content/data/vault/decisions");
    const secret = { ...real.decisions[0]!, id: "secret-plan", visibility: "private" as const, title: { en: "SECRET LAUNCH PLAN ZEBRA" }, summary: undefined, decision: { en: "zebra zebra zebra" } };
    vi.doMock("@/content/data/vault/decisions", () => ({ decisions: [secret, ...real.decisions] }));

    const v = await import("@/content/data/vault");
    expect(v.decisions.some((d) => d.id === "secret-plan")).toBe(false);   // what pages import
    expect(v.decisionsAll.some((d) => d.id === "secret-plan")).toBe(true); // what the data layer imports

    const { getKnowledge, getKnowledgeAll } = await import("@/lib/knowledge/build");
    const all = await getKnowledgeAll("en"), pub = await getKnowledge("en");
    expect(all.items.find((i) => i.id === "decision:secret-plan")).toMatchObject({ visibility: "private" });
    expect(pub.items.some((i) => i.id === "decision:secret-plan")).toBe(false);
    expect(JSON.stringify(pub)).not.toContain("ZEBRA");

    const { buildSearchIndex } = await import("@/lib/search-index");
    expect(JSON.stringify(await buildSearchIndex("en"))).not.toMatch(/ZEBRA|zebra/);

    const { publicDocs } = await import("@/core/ai/runtime");
    const docs = await publicDocs("en");
    expect(JSON.stringify(docs)).not.toMatch(/ZEBRA|zebra/);
    const { retrieve } = await import("@/core/retrieval");
    expect(retrieve(docs, "secret launch plan zebra", { type: "visitor" }).hits.some((h) => h.doc.id.includes("secret"))).toBe(false);

    // the owner's side can still read it through the policy engine
    const { readable } = await import("@/core/policy");
    expect(readable({ type: "owner" }, all.items).some((i) => i.id === "decision:secret-plan")).toBe(true);
    expect(readable({ type: "agent", id: "a", level: 1 }, all.items).some((i) => i.id === "decision:secret-plan")).toBe(true);
    expect(readable({ type: "visitor" }, all.items).some((i) => i.id === "decision:secret-plan")).toBe(false);
  });
});
