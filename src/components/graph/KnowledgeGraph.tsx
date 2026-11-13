"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BOARD, UNIT_PX, neighbors, type NodeKind, type Pos } from "@/lib/graph";
import type { Edge as GEdge } from "@/lib/knowledge/types";
import { animate, pop, reducedMotion, spring, stagger, staggerIn } from "@/lib/motion";

export interface GraphNode { id: string; label: string; kind: NodeKind; href?: string; summary?: string; lines?: string[]; lang?: string; deg?: number; date?: string; origin?: string }

const KINDS: NodeKind[] = ["project", "tech", "note", "vault", "path", "topic"];
const STYLE: Record<NodeKind, string> = {
  tech: "border-outline bg-surface text-fg",
  project: "border-outline bg-accent text-accent-ink",
  note: "border-outline bg-[#0a0a0c] text-white",
  path: "border-dashed border-outline bg-surface-2 text-fg",
  vault: "border-outline bg-[#ffd23f] text-[#1a1c24]",
  topic: "border-outline bg-accent text-accent-ink",
};

/** Clickable map of what is connected to what. Nodes are real buttons laid over an aria-hidden SVG of edges; a plain list below is the non-visual twin. */
export function KnowledgeGraph({ nodes, edges, pos }: { nodes: GraphNode[]; edges: GEdge[]; pos: Record<string, Pos> }) {
  const t = useTranslations("graph");
  const [sel, setSel] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState<Set<NodeKind>>(() => new Set(KINDS));
  const board = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const visible = nodes.filter((n) => shown.has(n.kind));
  const visibleIds = new Set(visible.map((n) => n.id));
  const nb = new Set(sel ? neighbors(sel, edges) : []);
  const q = query.trim().toLowerCase();
  const hits = q.length < 2 ? [] : nodes.filter((n) => n.label.toLowerCase().includes(q)).slice(0, 6);
  const node = sel ? byId.get(sel) : undefined;

  // nodes pop onto the board one after another
  useEffect(() => {
    if (reducedMotion() || !board.current) return;
    const a = animate(board.current.querySelectorAll("[data-node]"), { scale: [0.5, 1], duration: 650, delay: stagger(6), ease: spring({ stiffness: 200, damping: 14 }) });
    return () => { a.revert(); };
  }, []);
  useEffect(() => {
    if (!sel) return;
    const el = board.current?.querySelector(`[data-node="${CSS.escape(sel)}"]`);
    pop(el, 1.12);
    const a = staggerIn([...(panel.current?.querySelectorAll("[data-in]") ?? [])], { from: 12, step: 50 });
    return () => { a?.revert(); };
  }, [sel]);

  const toggle = (k: NodeKind) => setShown((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n.size === 0 ? new Set(KINDS) : n; });
  const select = (id: string) => setSel(id === sel ? null : id);

  return (
    <div>
      <div role="group" aria-label={t("filter")} className="flex flex-wrap gap-2">
        {KINDS.map((k) => (<button key={k} type="button" aria-pressed={shown.has(k)} className="chip" onClick={() => toggle(k)}>{t(`kinds.${k}`)}</button>))}
        <a href="#graph-list" className="link ml-auto self-center text-sm">{t("jumpToList")}</a>
      </div>

      <div className="mt-4 max-w-md">
        <label htmlFor="graph-find" className="label block">{t("find")}</label>
        <input id="graph-find" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("findPlaceholder")} autoComplete="off" className="mt-1 h-11 w-full border border-line-strong bg-transparent px-3 text-base text-fg outline-none placeholder:text-fg-3 focus:border-accent-fg" />
        {hits.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2" aria-label={t("findResults")}>
            {hits.map((h) => (<li key={h.id}><button type="button" className="chip !normal-case" onClick={() => { setSel(h.id); setShown(new Set(KINDS)); setQuery(""); requestAnimationFrame(() => board.current?.querySelector(`[data-node="${CSS.escape(h.id)}"]`)?.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" })); }}>{h.label} <span className="opacity-60">· {t(`kinds.${h.kind}`)}</span></button></li>))}
          </ul>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 overflow-x-auto overscroll-x-contain border-2 border-outline bg-surface">
          <div ref={board} className="relative" style={{ width: `max(${BOARD.w * UNIT_PX}px, 100%)`, aspectRatio: `${BOARD.w} / ${BOARD.h}` }}>
            <svg aria-hidden focusable="false" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              {edges.filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to)).map((e) => {
                const a = pos[e.from], b = pos[e.to];
                if (!a || !b) return null;
                const on = sel === e.from || sel === e.to;
                return <line key={`${e.from}>${e.to}`} x1={a.x * 100} y1={a.y * 100} x2={b.x * 100} y2={b.y * 100} vectorEffect="non-scaling-stroke" style={{ stroke: on ? "var(--accent)" : "var(--line-strong)", strokeWidth: on ? 3 : 1.5 }} />;
              })}
            </svg>
            {visible.map((n) => {
              const p = pos[n.id];
              if (!p) return null;
              const active = sel === n.id, near = nb.has(n.id);
              return (
                <button
                  key={n.id} type="button" data-node={n.id} lang={n.lang} aria-pressed={active} onClick={() => select(n.id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap border-2 ${(n.deg ?? 0) >= 5 ? "px-3.5 py-1.5 text-[0.92rem] font-bold" : "px-2.5 py-1 text-[0.78rem] font-medium"} leading-tight shadow-[2px_2px_0_var(--outline)] transition-shadow hover:shadow-[4px_4px_0_var(--accent)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-accent-fg ${STYLE[n.kind]} ${active ? "z-20 ring-4 ring-accent-fg" : near ? "z-10 ring-2 ring-accent-fg" : ""}`}
                  style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                >
                  <span className="sr-only">{t(`kinds.${n.kind}`)}: </span>{n.label}
                </button>
              );
            })}
          </div>
        </div>

        <aside ref={panel} aria-live="polite" className="min-w-0 border-2 border-outline bg-surface p-5 shadow-[6px_6px_0_var(--accent)] lg:self-start">
          {node ? (
            <div>
              <p data-in className="label">{t(`kinds.${node.kind}`)}{node.date ? ` · ${node.date}` : ""}</p>
              <h2 data-in lang={node.lang} className="stage-title mt-1 text-3xl [overflow-wrap:anywhere]">{node.label}</h2>
              {node.summary && <p data-in lang={node.lang} className="mt-3 text-fg-2">{node.summary}</p>}
              {node.lines && node.lines.length > 0 && (
                <ul data-in className="mt-3 space-y-1 text-sm text-fg-2">{node.lines.map((l) => (<li key={l} className="[overflow-wrap:anywhere]">{l}</li>))}</ul>
              )}
              {nb.size > 0 && (
                <div data-in className="mt-5">
                  <p className="label mb-2">{t("connected")}</p>
                  <ul className="flex flex-wrap gap-2">
                    {[...nb].map((id) => byId.get(id)).filter((x): x is GraphNode => !!x).map((x) => (<li key={x.id}><button type="button" className="chip !normal-case" onClick={() => setSel(x.id)}>{x.label}</button></li>))}
                  </ul>
                </div>
              )}
              {node.origin && <p data-in className="label mt-4 !normal-case !tracking-normal">{t("provenance")}: {node.origin}</p>}
              {node.href && <p data-in className="mt-5"><Link href={node.href} className="btn btn-primary">{t(`open.${node.kind}`)}</Link></p>}
            </div>
          ) : (
            <p className="text-fg-2">{t("pick")}</p>
          )}
        </aside>
      </div>

      <section id="graph-list" aria-labelledby="graph-list-title" className="mt-14">
        <h2 id="graph-list-title" className="text-3xl">{t("listTitle")}</h2>
        <p className="label mt-1 !normal-case !tracking-normal">{t("listLead")}</p>
        <div className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {KINDS.map((k) => (
            <div key={k}>
              <h3 className="label mb-2 !text-fg-2">{t(`kinds.${k}`)}</h3>
              <ul className="border-t-2 border-outline">
                {nodes.filter((n) => n.kind === k).map((n) => {
                  const c = neighbors(n.id, edges).map((id) => byId.get(id)?.label).filter(Boolean);
                  return (
                    <li key={n.id} className="border-b border-line py-2">
                      <button type="button" className="link text-left font-display text-lg [overflow-wrap:anywhere]" lang={n.lang} onClick={() => { setSel(n.id); document.getElementById("graph-top")?.scrollIntoView({ block: "center" }); }}>{n.label}</button>
                      {c.length > 0 && <p className="label !normal-case !tracking-normal [overflow-wrap:anywhere]">→ {c.join(", ")}</p>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
