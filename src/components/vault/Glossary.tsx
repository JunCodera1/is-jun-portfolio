"use client";

import { useMemo, useState } from "react";
import { normalize } from "@/lib/search";

export interface GTerm { id: string; topic: string; topicLabel: string; en: string; ja: string; vi: string; def: string; defLang?: string }

/** Searchable in any language: typing "ハイドレーション", "hydration" or "trợ từ" finds the entry. */
export function Glossary({ terms, label, placeholder, count, none }: { terms: GTerm[]; label: string; placeholder: string; count: string; none: string }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const n = normalize(q.trim());
    return n ? terms.filter((t) => normalize(`${t.en} ${t.ja} ${t.vi} ${t.def}`).includes(n)) : terms;
  }, [q, terms]);
  return (
    <div>
      <label htmlFor="glossary-q" className="label block">{label}</label>
      <input id="glossary-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} autoComplete="off" className="mt-2 h-12 w-full max-w-md border border-line-strong bg-transparent px-3 text-base text-fg outline-none placeholder:text-fg-3 focus:border-accent-fg" />
      <p className="label mt-3 !normal-case !tracking-normal" aria-live="polite">{count.replace("{n}", String(shown.length))}</p>
      {shown.length === 0 ? <p className="slot mt-6">{none}</p> : (
        <dl className="mt-4 border-t-2 border-outline">
          {shown.map((t) => (
            <div key={t.id} id={t.id} className="grid gap-x-6 gap-y-1 border-b border-line py-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)]">
              <dt>
                <span className="block font-display text-xl leading-snug">{t.en}</span>
                <span lang="ja" className="block text-fg-2">{t.ja}</span>
                <span lang="vi" className="block text-fg-2">{t.vi}</span>
                <span className="label mt-1 block">{t.topicLabel}</span>
              </dt>
              <dd lang={t.defLang} className="text-fg-2">{t.def}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
