import { describe, expect, it } from "vitest";
import { BOARD, layoutGraph, neighbors, nodeBox } from "@/lib/graph";
import { paths } from "@/content/data/graph";
import { skills } from "@/content/data/skills";
import { projects } from "@/content/data/projects";

const real = () => {
  const nodes = [
    ...projects.map((p) => ({ id: `p:${p.slug}`, label: p.name })),
    ...skills.map((s) => ({ id: `t:${s.name}`, label: s.name })),
    ...paths.flatMap((p) => p.steps.map((s) => ({ id: s.id, label: s.label.en }))),
  ];
  const edges = [
    ...skills.flatMap((s) => s.usedIn.map((u) => ({ from: `p:${u.slug}`, to: `t:${s.name}` }))),
    ...paths.flatMap((p) => p.steps.slice(1).map((s, i) => ({ from: p.steps[i]!.id, to: s.id }))),
  ];
  return { nodes, edges };
};

describe("graph layout", () => {
  it("is deterministic and keeps every node on the board", () => {
    const { nodes, edges } = real();
    const a = layoutGraph(nodes, edges), b = layoutGraph(nodes, edges);
    expect(a).toEqual(b);
    for (const p of Object.values(a)) { expect(p.x).toBeGreaterThanOrEqual(0); expect(p.x).toBeLessThanOrEqual(1); expect(p.y).toBeGreaterThanOrEqual(0); expect(p.y).toBeLessThanOrEqual(1); }
  });
  it("keeps node labels from overlapping on the real data", () => {
    const { nodes, edges } = real();
    const pos = layoutGraph(nodes, edges);
    const bad: string[] = [];
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodeBox(nodes[i]!.label), b = nodeBox(nodes[j]!.label);
      const dx = Math.abs(pos[nodes[i]!.id]!.x - pos[nodes[j]!.id]!.x) * BOARD.w, dy = Math.abs(pos[nodes[i]!.id]!.y - pos[nodes[j]!.id]!.y) * BOARD.h;
      if (dx < (a.w + b.w) / 2 - 0.05 && dy < (a.h + b.h) / 2 - 0.05) bad.push(`${nodes[i]!.label} / ${nodes[j]!.label}`);
    }
    expect(bad).toEqual([]);
  });
  it("handles empty input and unknown edge ids", () => {
    expect(layoutGraph([], [])).toEqual({});
    expect(Object.keys(layoutGraph([{ id: "a", label: "A" }], [{ from: "a", to: "zzz" }]))).toEqual(["a"]);
  });
  it("neighbors works in both directions", () => {
    expect(neighbors("b", [{ from: "a", to: "b" }, { from: "b", to: "c" }]).sort()).toEqual(["a", "c"]);
  });
});

describe("learning paths data", () => {
  it("step ids are unique across paths and every href is a local path", () => {
    const ids = paths.flatMap((p) => p.steps.map((s) => s.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of paths.flatMap((p) => p.steps)) if (s.href) expect(s.href).toMatch(/^\/[a-z0-9/-]*$/);
  });
});
