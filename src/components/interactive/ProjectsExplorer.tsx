"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export interface ProjectItem {
  slug: string;
  name: string;
  kinds: { id: string; label: string }[];
  summary: string;
  lang?: string;
  badge?: string;
  stack: string[];
  meta?: string;
}

/** Filter by kind (row 15). Buttons use aria-pressed, the result count is announced politely. */
export function ProjectsExplorer({ items }: { items: ProjectItem[] }) {
  const t = useTranslations("projects");
  const tc = useTranslations("common");
  const [kind, setKind] = useState<string | null>(null);

  const kinds = useMemo(() => {
    const m = new Map<string, string>();
    items.forEach((i) => i.kinds.forEach((k) => m.set(k.id, k.label)));
    return [...m.entries()];
  }, [items]);
  const shown = useMemo(() => (kind ? items.filter((i) => i.kinds.some((k) => k.id === kind)) : items), [items, kind]);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-line py-6 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label={t("filterKind")} className="flex flex-wrap gap-2">
          <button type="button" className="chip tap" aria-pressed={kind === null} onClick={() => setKind(null)}>{tc("all")}</button>
          {kinds.map(([id, label]) => (
            <button key={id} type="button" className="chip tap" aria-pressed={kind === id} onClick={() => setKind(kind === id ? null : id)}>{label}</button>
          ))}
        </div>
        <p className="label" role="status" aria-live="polite">{t("count", { shown: shown.length, total: items.length })}</p>
      </div>

      <ol className="border-t border-line-strong">
        {shown.map((p, i) => (
          <li key={p.slug} className="border-b border-line">
            <Link href={`/projects/${p.slug}`} className="index-row grid gap-x-8 gap-y-3 px-2 py-8 md:grid-cols-[4rem_1.1fr_1.4fr] md:px-4 md:py-10">
              <span className="label pt-3">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="block font-display text-4xl leading-none tracking-[-0.03em] md:text-5xl">{p.name}</span>
                <span className="mt-3 flex flex-wrap gap-1.5">
                  {p.kinds.map((k) => <span key={k.id} className="chip">{k.label}</span>)}
                </span>
                {p.meta && <span className="label mt-3 block">{p.meta}</span>}
              </span>
              <span>
                <span lang={p.lang} className="block max-w-[60ch] text-fg-2 md:text-lg">{p.summary}</span>
                <span className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.75rem] text-fg-3">
                  {p.stack.map((s) => <span key={s}>{s}</span>)}
                  {p.badge && <span className="label border border-line px-1.5 py-px text-[0.62rem]">{p.badge}</span>}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
