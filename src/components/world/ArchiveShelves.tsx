"use client";

import { useEffect, useRef, useState } from "react";
import { pop, riseIn } from "@/lib/motion";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "@/components/ui/Icons";

export interface ShelfView { id: string; title: string; items: { id: string; title: string; note: string; lang?: string; source: "owner" | "github" | "public"; url?: string; color: "red" | "white" | "gray" }[] }

const COLORS = { red: "bg-accent text-accent-ink", white: "bg-[#f4f4f0] text-[#0a0a0c]", gray: "bg-[#4a4a54] text-white" } as const;

export function ArchiveShelves({ shelves }: { shelves: ShelfView[] }) {
  const t = useTranslations("archive");
  const [sel, setSel] = useState<{ shelf: string; id: string } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLElement>(null);
  // books slide up onto the shelf one after another
  useEffect(() => {
    const a = riseIn([...(root.current?.querySelectorAll("[data-spine]") ?? [])], { from: 70, step: 28 });
    return () => { a?.revert(); };
  }, []);
  useEffect(() => { if (sel) pop(card.current, 1.02); }, [sel]);
  const current = sel ? shelves.find((s) => s.id === sel.shelf)?.items.find((i) => i.id === sel.id) : null;
  return (
    <div className="page mt-10" ref={root}>
      <div className="space-y-10">
        {shelves.map((s) => (
          <section key={s.id} aria-labelledby={`shelf-${s.id}`}>
            <h2 id={`shelf-${s.id}`} className="plate !text-lg">{s.title}</h2>
            <ul className="mt-3 flex min-h-[10rem] flex-wrap items-end gap-2 border-b-[10px] border-outline px-3 pb-0 pt-4">
              {s.items.length === 0 && <li className="slot mb-3 w-full max-w-md">{t("empty")}</li>}
              {s.items.map((it, k) => (
                <li key={it.id} data-spine>
                  <button
                    type="button" aria-pressed={sel?.id === it.id && sel.shelf === s.id}
                    onClick={() => setSel({ shelf: s.id, id: it.id })}
                    lang={it.lang}
                    className={`border-2 border-outline px-2 py-3 whitespace-nowrap font-display text-lg leading-tight transition-transform hover:-translate-y-2 focus-visible:-translate-y-2 aria-pressed:-translate-y-3 aria-pressed:ring-4 aria-pressed:ring-accent-fg ${COLORS[it.color]}`}
                    style={{ writingMode: "vertical-rl", height: `${Math.min(17, 5.5 + it.title.length * 0.62 + ((k * 7) % 3) * 0.8)}rem` }}
                  >{it.title}</button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="mt-10 min-h-40" role="status" aria-live="polite">
        {current ? (
          <article ref={card} className="max-w-2xl border-2 border-outline bg-surface p-6 shadow-[6px_6px_0_var(--accent)]">
            <p className="label">{t(`source.${current.source}`)}</p>
            <h3 lang={current.lang} className="stage-title mt-1 text-4xl">{current.title}</h3>
            <p lang={current.lang} className="mt-3 text-lg text-fg-2">{current.note}</p>
            {current.url && <a href={current.url} target="_blank" rel="noopener noreferrer" className="btn mt-5">{t("open")}<ArrowUpRight width={14} height={14} /><span className="sr-only"> ({t("newTab")})</span></a>}
          </article>
        ) : <p className="slot max-w-md">{t("pick")}</p>}
      </div>
    </div>
  );
}
