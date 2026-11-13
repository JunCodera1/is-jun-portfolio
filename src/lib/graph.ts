/** Knowledge-graph helpers: pure and deterministic (no randomness), so layout is testable and identical on every build. */
export type NodeKind = "tech" | "project" | "note" | "path";
export interface GEdge { from: string; to: string }
export interface Pos { x: number; y: number }

/** Approximate on-screen footprint of a node in a 16 × 10 unit board: wide labels take more room. */
export const nodeBox = (label: string): { w: number; h: number } => ({ w: Math.min(3.4, 0.9 + [...label].length * 0.105), h: 0.62 });

export const BOARD = { w: 16, h: 10 } as const;

/**
 * Force-directed layout (Fruchterman–Reingold) followed by a label-collision pass.
 * Returns positions in 0..1 for the node ids, deterministically.
 */
export function layoutGraph(nodes: { id: string; label: string }[], edges: GEdge[], iterations = 320): Record<string, Pos> {
  const n = nodes.length;
  if (n === 0) return {};
  const { w: W, h: H } = BOARD;
  const index = new Map(nodes.map((nd, i) => [nd.id, i]));
  const px = new Float64Array(n), py = new Float64Array(n);
  // golden-angle spiral start: spread out, deterministic
  for (let i = 0; i < n; i++) {
    const r = Math.sqrt((i + 0.5) / n), a = i * 2.399963;
    px[i] = W / 2 + Math.cos(a) * r * (W / 2 - 1.2);
    py[i] = H / 2 + Math.sin(a) * r * (H / 2 - 0.8);
  }
  const k = Math.sqrt((W * H) / n) * 0.82;
  const links = edges.map((e) => [index.get(e.from), index.get(e.to)] as const).filter((l): l is readonly [number, number] => l[0] !== undefined && l[1] !== undefined && l[0] !== l[1]);
  let temp = W / 8;
  for (let it = 0; it < iterations; it++) {
    const dx = new Float64Array(n), dy = new Float64Array(n);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      let ex = px[i]! - px[j]!, ey = py[i]! - py[j]!;
      let d = Math.hypot(ex, ey);
      if (d < 0.01) { ex = 0.01 * ((i % 3) - 1 || 1); ey = 0.01 * ((j % 3) - 1 || 1); d = Math.hypot(ex, ey); }
      const f = (k * k) / d;
      dx[i]! += (ex / d) * f; dy[i]! += (ey / d) * f; dx[j]! -= (ex / d) * f; dy[j]! -= (ey / d) * f;
    }
    for (const [a, b] of links) {
      const ex = px[a]! - px[b]!, ey = py[a]! - py[b]!;
      const d = Math.max(0.01, Math.hypot(ex, ey));
      const f = (d * d) / k;
      dx[a]! -= (ex / d) * f; dy[a]! -= (ey / d) * f; dx[b]! += (ex / d) * f; dy[b]! += (ey / d) * f;
    }
    for (let i = 0; i < n; i++) {
      dx[i]! += (W / 2 - px[i]!) * 0.04; dy[i]! += (H / 2 - py[i]!) * 0.04; // gentle gravity keeps islands together
      const d = Math.max(0.01, Math.hypot(dx[i]!, dy[i]!));
      const m = Math.min(d, temp);
      px[i]! += (dx[i]! / d) * m; py[i]! += (dy[i]! / d) * m;
      px[i] = Math.min(W - 1, Math.max(1, px[i]!)); py[i] = Math.min(H - 0.5, Math.max(0.5, py[i]!));
    }
    temp = Math.max(0.02, temp * 0.985);
  }
  // collision pass: push label boxes apart along the axis of smaller overlap
  const boxes = nodes.map((nd) => nodeBox(nd.label));
  for (let pass = 0; pass < 140; pass++) {
    let moved = false;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const ox = (boxes[i]!.w + boxes[j]!.w) / 2 + 0.15 - Math.abs(px[i]! - px[j]!);
      const oy = (boxes[i]!.h + boxes[j]!.h) / 2 + 0.15 - Math.abs(py[i]! - py[j]!);
      if (ox > 0 && oy > 0) {
        moved = true;
        if (oy <= ox) { const s = py[i]! >= py[j]! ? 1 : -1; py[i]! += (s * oy) / 2; py[j]! -= (s * oy) / 2; }
        else { const s = px[i]! >= px[j]! ? 1 : -1; px[i]! += (s * ox) / 2; px[j]! -= (s * ox) / 2; }
      }
    }
    for (let i = 0; i < n; i++) {
      px[i] = Math.min(W - boxes[i]!.w / 2 - 0.1, Math.max(boxes[i]!.w / 2 + 0.1, px[i]!));
      py[i] = Math.min(H - boxes[i]!.h / 2 - 0.1, Math.max(boxes[i]!.h / 2 + 0.1, py[i]!));
    }
    if (!moved) break;
  }
  return Object.fromEntries(nodes.map((nd, i) => [nd.id, { x: px[i]! / W, y: py[i]! / H }]));
}

export function neighbors(id: string, edges: readonly GEdge[]): string[] {
  const out = new Set<string>();
  for (const e of edges) { if (e.from === id) out.add(e.to); else if (e.to === id) out.add(e.from); }
  return [...out];
}
