"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Answer } from "@/core/ai/ask";

type State = { phase: "idle" } | { phase: "loading" } | { phase: "done"; answer: Answer } | { phase: "error"; code: string };

/** Ask the site a question. The answer shows what it is made of: quoted facts, inferred relations, suggestions, and who wrote the text. */
export function AskForm() {
  const t = useTranslations("ask");
  const locale = useLocale();
  const [q, setQ] = useState("");
  const [s, setS] = useState<State>({ phase: "idle" });
  const out = useRef<HTMLDivElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 3) return;
    setS({ phase: "loading" });
    try {
      const res = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q, locale }) });
      if (!res.ok) { setS({ phase: "error", code: res.status === 429 ? "rate_limited" : "error" }); return; }
      setS({ phase: "done", answer: (await res.json()) as Answer });
      requestAnimationFrame(() => out.current?.focus());
    } catch { setS({ phase: "error", code: "error" }); }
  };

  const a = s.phase === "done" ? s.answer : null;
  return (
    <div>
      <form onSubmit={submit} className="max-w-2xl">
        <label htmlFor="ask-q" className="label block">{t("label")}</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input id="ask-q" value={q} onChange={(e) => setQ(e.target.value)} maxLength={300} placeholder={t("placeholder")} autoComplete="off" className="h-12 w-full border border-line-strong bg-transparent px-3 text-base text-fg outline-none placeholder:text-fg-3 focus:border-accent-fg" />
          <button type="submit" className="btn btn-primary shrink-0" disabled={s.phase === "loading" || q.trim().length < 3}>{s.phase === "loading" ? t("thinking") : t("ask")}</button>
        </div>
        <p className="label mt-2 !normal-case !tracking-normal">{t("examples")}</p>
      </form>

      <div ref={out} tabIndex={-1} aria-live="polite" className="mt-10 max-w-3xl outline-none">
        {s.phase === "error" && <p className="slot">{s.code === "rate_limited" ? t("rateLimited") : t("error")}</p>}
        {a && (
          <div className="card-ink p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className="chip" data-label={a.label}>{t(`label_${a.label}`)}</span>
              <span className="label !normal-case !tracking-normal">{t("confidence", { n: Math.round(a.confidence * 100) })}</span>
              <span className="h-2 w-24 border border-outline bg-surface-2" role="presentation"><span className="block h-full bg-accent" style={{ width: `${a.confidence * 100}%` }} /></span>
            </div>
            {a.text ? <p className="mt-4 whitespace-pre-wrap text-lg [overflow-wrap:anywhere]">{a.text}</p> : <p className="mt-4 text-lg">{t("nothing")}</p>}
            {a.notices.length > 0 && <ul className="label mt-3 space-y-1 !normal-case !tracking-normal">{a.notices.map((n) => (<li key={n}>{t(`notice_${n}`)}</li>))}</ul>}

            {a.sources.length > 0 && (
              <section className="mt-6" aria-labelledby="ask-sources">
                <h2 id="ask-sources" className="label !text-fg-2">{t("sources")}</h2>
                <ol className="mt-2 space-y-2">
                  {a.sources.map((x) => (
                    <li key={x.id} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2">
                      <span className="label">[{x.n}]</span>
                      <span><Link href={x.href} lang={x.lang !== locale ? x.lang : undefined} className="link [overflow-wrap:anywhere]">{x.title}</Link><span className="label block !normal-case !tracking-normal">{t(`kind_${x.kind}`)} · {t("origin")}: {x.origin}{x.evidence ? ` · ${x.evidence}` : ""} · {t(`by_${x.authorship}`)}{a.mode === "generated" && !x.cited ? ` · ${t("notCited")}` : ""}</span></span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {a.inferred.length > 0 && (<section className="mt-5"><h2 className="label !text-fg-2">{t("inferred")}</h2><p className="label !normal-case !tracking-normal">{t("inferredNote")}</p><ul className="mt-1 flex flex-wrap gap-2">{a.inferred.map((x) => (<li key={x.id}><Link href={x.href} className="chip !normal-case">{x.title}</Link></li>))}</ul></section>)}
            {a.suggestions.length > 0 && (<section className="mt-5"><h2 className="label !text-fg-2">{t("suggestions")}</h2><ul className="mt-1 flex flex-wrap gap-2">{a.suggestions.map((x) => (<li key={x.id}><Link href={x.href} className="chip !normal-case">{x.title}</Link></li>))}</ul></section>)}
          </div>
        )}
      </div>
    </div>
  );
}
