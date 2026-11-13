"use client";

import { useEffect, useState } from "react";
import { pop, staggerIn } from "@/lib/motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "@/components/ui/Icons";

export interface CaseFile {
  slug: string; name: string; kinds: string; summary: string; lang?: string; highlights: string[];
  stack: { name: string; evidence: string; repo: string }[]; repos: string[]; demo?: string; lastPush?: string; status?: string;
}

/** Projects as case files: pick a folder, read the findings, inspect the evidence. Everything shown is traceable to a file in the repository. */
export function CaseBoard({ cases }: { cases: CaseFile[] }) {
  const t = useTranslations("lab");
  const [i, setI] = useState(0);
  const c = cases[i]!;
  // switching folders: findings and evidence cards slide in one after another, the chosen tab pops
  useEffect(() => {
    const panel = document.getElementById("case-panel");
    if (!panel) return;
    const a = staggerIn([...panel.querySelectorAll("header, ol > li, ul > li")], { from: 18, step: 45 });
    pop(document.getElementById(`case-tab-${i}`), 1.04);
    return () => { a?.revert(); };
  }, [i]);
  return (
    <div className="page mt-10 grid gap-8 lg:grid-cols-[17rem_1fr]">
      <div
        className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible" role="tablist" aria-label={t("folders")} aria-orientation="vertical"
        onKeyDown={(e) => {
          const move = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
          if (!move && e.key !== "Home" && e.key !== "End") return;
          e.preventDefault();
          const n = e.key === "Home" ? 0 : e.key === "End" ? cases.length - 1 : (i + move + cases.length) % cases.length;
          setI(n);
          document.getElementById(`case-tab-${n}`)?.focus();
        }}
      >
        {cases.map((x, k) => (
          <button
            key={x.slug} type="button" role="tab" id={`case-tab-${k}`} aria-selected={i === k} aria-controls="case-panel" tabIndex={i === k ? 0 : -1}
            onClick={() => setI(k)}
            className={`relative isolate shrink-0 px-4 py-3 text-left font-mono text-sm font-bold uppercase tracking-wide lg:w-full ${i === k ? "text-accent-ink" : "text-fg-2 hover:text-fg"}`}
          >
            <span aria-hidden className={`absolute inset-0 -z-10 -skew-x-12 border-2 border-outline transition-colors ${i === k ? "bg-accent" : "bg-surface"}`} />
            {t("case")} {String(k + 1).padStart(2, "0")}
            <span className="block font-display text-lg normal-case tracking-tight">{x.name}</span>
          </button>
        ))}
      </div>

      <article id="case-panel" role="tabpanel" aria-labelledby={`case-tab-${i}`} className="min-w-0 border-2 border-outline bg-surface p-5 shadow-[8px_8px_0_var(--accent)] md:p-8">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-outline pb-4">
          <div>
            <p className="label">{t("case")} {String(i + 1).padStart(2, "0")} · {c.kinds}</p>
            <h2 className="stage-title mt-1 text-4xl md:text-6xl">{c.name}</h2>
          </div>
          <p className="border-2 border-accent-fg px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-accent-fg -rotate-3">{c.status ?? t("statusUnset")}</p>
        </header>

        <p lang={c.lang} className="mt-5 text-lg">{c.summary}</p>
        {c.lastPush && <p className="label mt-2">{t("lastPush")}: {c.lastPush}</p>}

        <h3 className="label mb-3 mt-8 !text-fg-2">{t("findings")}</h3>
        <ol className="space-y-3">
          {c.highlights.map((h, k) => (
            <li key={k} lang={c.lang} className="grid grid-cols-[2rem_1fr] gap-3 border-l-4 border-accent pl-3"><span className="font-mono text-sm text-accent-fg">{String(k + 1).padStart(2, "0")}</span><span>{h}</span></li>
          ))}
        </ol>

        <h3 className="label mb-1 mt-8 !text-fg-2">{t("evidence")}</h3>
        <p className="mb-3 text-sm text-fg-2">{t("evidenceNote")}</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {c.stack.map((s) => (
            <li key={`${s.repo}-${s.name}`} className="relative border-2 border-outline bg-surface-2 p-3 pt-4">
              <span aria-hidden className="absolute -top-2 left-3 h-3 w-3 rounded-full bg-accent ring-2 ring-[#0a0a0c]" />
              <p className="font-display text-lg">{s.name}</p>
              <p className="mt-1 break-words font-mono text-[0.75rem] text-fg-2">{s.evidence}</p>
              <p className="label mt-1 !normal-case !tracking-normal">{s.repo}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          {c.repos.map((r) => <a key={r} className="btn" href={`https://github.com/${r}`} target="_blank" rel="noopener noreferrer">{r.split("/")[1]}<ArrowUpRight width={14} height={14} /><span className="sr-only"> ({t("newTab")})</span></a>)}
          {c.demo && <a className="btn btn-primary" href={c.demo} target="_blank" rel="noopener noreferrer">{t("demo")}<ArrowUpRight width={14} height={14} /><span className="sr-only"> ({t("newTab")})</span></a>}
          <Link className="btn" href={`/projects/${c.slug}`}>{t("fullFile")}</Link>
        </div>
      </article>
    </div>
  );
}
