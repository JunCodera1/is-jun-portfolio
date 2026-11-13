"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight } from "@/components/ui/Icons";

export type Group = "world" | "dev" | "ja" | "vi";
export interface BoardItem { id: string; title: string; url: string; source: string; group: Group; lang: string; meta: string }
export interface BoardLabels { all: string; groups: Record<Group, string>; sources: string; empty: string; opensNewTab: string; shown: string }

export function NewsBoard({ items, labels }: { items: BoardItem[]; labels: BoardLabels }) {
  const [group, setGroup] = useState<Group | "all">("all");
  const [source, setSource] = useState<string>("all");
  const groups = (["world", "dev", "ja", "vi"] as Group[]).filter((g) => items.some((i) => i.group === g));
  const inGroup = useMemo(() => items.filter((i) => group === "all" || i.group === group), [items, group]);
  const sources = useMemo(() => [...new Set(inGroup.map((i) => i.source))], [inGroup]);
  const visible = inGroup.filter((i) => source === "all" || i.source === source);
  const [lead, ...rest] = visible;

  const chip = (active: boolean) => `chip ${active ? "!bg-accent !text-accent-fg" : ""}`;
  return (
    <div>
      <div role="group" aria-label={labels.sources} className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={group === "all"} className={chip(group === "all")} onClick={() => { setGroup("all"); setSource("all"); }}>{labels.all}</button>
        {groups.map((g) => (
          <button key={g} type="button" aria-pressed={group === g} className={chip(group === g)} onClick={() => { setGroup(g); setSource("all"); }}>{labels.groups[g]}</button>
        ))}
      </div>
      {sources.length > 1 && (
        <div role="group" aria-label={labels.sources} className="mt-3 flex flex-wrap gap-2">
          {sources.map((s) => (
            <button key={s} type="button" aria-pressed={source === s} className={`${chip(source === s)} !normal-case`} onClick={() => setSource(source === s ? "all" : s)}>{s}</button>
          ))}
        </div>
      )}
      <p className="label mt-4 !normal-case !tracking-normal" aria-live="polite">{labels.shown.replace("{n}", String(visible.length))}</p>

      {visible.length === 0 ? (
        <p className="slot mt-6">{labels.empty}</p>
      ) : (
        <>
          {lead && (
            <a href={lead.url} target="_blank" rel="noopener noreferrer nofollow" className="slab mt-6 block p-6 sm:p-8">
              <span className="label block !normal-case !tracking-normal">{lead.source} · {lead.meta}</span>
              <span lang={lead.lang} className="mt-3 block font-display text-3xl leading-tight tracking-tight sm:text-4xl">{lead.title}</span>
              <span className="sr-only">({labels.opensNewTab})</span>
            </a>
          )}
          <ol className="mt-6 border-t-2 border-outline">
            {rest.map((n, i) => (
              <li key={n.id} className="border-b border-line">
                <a href={n.url} target="_blank" rel="noopener noreferrer nofollow" className="index-row grid grid-cols-[2rem_1fr_auto] items-baseline gap-x-3 px-2 py-4">
                  <span className="label">{String(i + 2).padStart(2, "0")}</span>
                  <span>
                    <span lang={n.lang} className="block font-display text-lg leading-snug tracking-tight">{n.title}</span>
                    <span className="label mt-1 block !normal-case !tracking-normal">{n.source} · {n.meta}</span>
                  </span>
                  <ArrowUpRight width={16} height={16} className="arrow text-fg-3" />
                  <span className="sr-only">({labels.opensNewTab})</span>
                </a>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

