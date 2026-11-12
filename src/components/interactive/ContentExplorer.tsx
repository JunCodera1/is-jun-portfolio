"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { normalize } from "@/lib/search";

export interface ExplorerItem {
  id: string;
  href: string;
  title: string;
  summary: string;
  dateLabel: string;
  tags: { id: string; label: string }[];
  badge?: string;
  lang?: string;
  meta?: string;
  /** Highlighted meta (e.g. garden maturity). */
  accent?: string;
}

/** Client-side filter by text and tag for Journal and Garden lists (row 16/17). */
export function ContentExplorer({ ns, items }: { ns: "garden" | "journal"; items: ExplorerItem[] }) {
  const t = useTranslations(ns);
  const tc = useTranslations("common");
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((i) => i.tags.forEach((x) => map.set(x.id, x.label)));
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const shown = useMemo(() => {
    const nq = normalize(q.trim());
    return items.filter((i) => {
      if (tag && !i.tags.some((x) => x.id === tag)) return false;
      if (!nq) return true;
      return normalize(`${i.title} ${i.summary} ${i.tags.map((x) => x.label).join(" ")}`).includes(nq);
    });
  }, [items, q, tag]);

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-line py-6 md:flex-row md:items-end md:justify-between">
        <div className="md:w-80">
          <label htmlFor={`${ns}-filter`} className="label mb-2 block">{t("searchLabel")}</label>
          <input
            id={`${ns}-filter`}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder")}
            autoComplete="off"
            className="h-11 w-full border border-line-strong bg-transparent px-3 text-base text-fg outline-none placeholder:text-fg-3 focus:border-accent-fg"
          />
        </div>
        {allTags.length > 0 && (
          <div role="group" aria-label={tc("tags")} className="flex flex-wrap gap-2">
            <button type="button" className="chip tap" aria-pressed={tag === null} onClick={() => setTag(null)}>{tc("all")}</button>
            {allTags.map(([id, label]) => (
              <button key={id} type="button" className="chip tap" aria-pressed={tag === id} onClick={() => setTag(tag === id ? null : id)}>#{label}</button>
            ))}
          </div>
        )}
      </div>

      <p className="label py-3" role="status" aria-live="polite">{t("count", { count: shown.length })}</p>

      {shown.length === 0 ? (
        <p className="slot">{items.length === 0 ? t("none") : t("empty")}</p>
      ) : (
        <ul className="border-t border-line-strong">
          {shown.map((i) => (
            <li key={i.id} className="border-b border-line">
              <Link href={i.href} className="index-row grid gap-x-8 gap-y-2 px-2 py-7 md:grid-cols-[9rem_1fr_auto] md:px-4">
                <span className="label pt-2">{i.dateLabel}</span>
                <span>
                  <span lang={i.lang} className="block font-display text-3xl leading-tight tracking-tight md:text-4xl">{i.title}</span>
                  <span lang={i.lang} className="mt-2 block max-w-[62ch] text-fg-2">{i.summary}</span>
                  <span className="mt-3 flex flex-wrap items-center gap-1.5">
                    {i.tags.map((x) => <span key={x.id} className="chip">#{x.label}</span>)}
                    {i.badge && <span className="label border border-line px-1.5 py-px text-[0.62rem]">{i.badge}</span>}
                  </span>
                </span>
                <span className="label hidden self-start pt-2 text-right md:block">
                  {i.accent && <span className="block text-accent-fg">{i.accent}</span>}
                  {i.meta}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
