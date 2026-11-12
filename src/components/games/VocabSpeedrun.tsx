"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { vocab } from "@/content/data/station";
import { choices } from "@/lib/station";
import { resolveText } from "@/lib/localized";
import type { Locale } from "@/i18n/routing";
import { useWorldOptional } from "@/components/world/WorldProvider";
import { useBest } from "./useBest";

const DURATION = 45;
type Q = { prompt: string; options: string[]; answer: number };

/** Vocabulary speedrun: N3/N2-level words, 45 seconds. Meanings in en/vi, readings in ja. Keys 1–4. */
export default function VocabSpeedrun() {
  const t = useTranslations("play");
  const locale = useLocale() as Locale;
  const world = useWorldOptional();
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [left, setLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState<Q | null>(null);
  const [fb, setFb] = useState<boolean | null>(null);
  const [newBest, setNewBest] = useState(false);
  const scoreRef = useRef(0);
  const { best, submit } = useBest("vocab-speedrun-best", (a, b) => a > b);

  const label = useCallback((v: (typeof vocab)[number]) => (locale === "ja" ? v.reading : resolveText(v.meaning, locale).text), [locale]);
  const nextQ = useCallback(() => {
    const v = vocab[Math.floor(Math.random() * vocab.length)]!;
    const c = choices(label(v), vocab.map(label), Math.random);
    setQ({ prompt: v.word, ...c });
  }, [label]);

  const start = () => { scoreRef.current = 0; setScore(0); setLeft(DURATION); setFb(null); setNewBest(false); nextQ(); setPhase("playing"); };

  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => setLeft((s) => {
      if (s <= 1) { clearInterval(id); setPhase("done"); setNewBest(submit(scoreRef.current)); world?.discover("game"); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [phase, submit, world]);

  const answer = useCallback((k: number) => {
    if (!q) return;
    const ok = k === q.answer;
    setFb(ok);
    if (ok) { scoreRef.current += 1; setScore((s) => s + 1); }
    nextQ();
  }, [q, nextQ]);

  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => { const k = Number(e.key) - 1; if (q && k >= 0 && k < q.options.length && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); answer(k); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, q, answer]);

  return (
    <div role="group" aria-label={t("vocab.title")} className="border-2 border-outline bg-surface p-5 shadow-[6px_6px_0_var(--accent)] md:p-8">
      {phase === "idle" && (<div><p className="text-fg-2">{t("vocab.hint")}</p><button type="button" className="btn btn-primary mt-5" onClick={start}>{t("start")}</button>{best !== null && <p className="label mt-4">{t("best")}: {best}</p>}</div>)}
      {phase === "playing" && q && (
        <div>
          <div className="flex justify-between font-mono text-sm"><span aria-hidden>{t("time")}: <b className="tabular-nums">{left}</b></span><span>{t("score")}: <b className="tabular-nums">{score}</b></span></div>
          <div aria-hidden className="mt-3 h-2 border border-outline"><div className="h-full bg-accent transition-[width] duration-1000 ease-linear" style={{ width: `${(left / DURATION) * 100}%` }} /></div>
          <p lang="ja" className="my-8 text-center font-display text-[clamp(3.5rem,14vw,7rem)] leading-none">{q.prompt}</p>
          <div className="grid gap-3 sm:grid-cols-2">{q.options.map((o, k) => <button key={k} type="button" className="btn !justify-start !normal-case !tracking-normal text-base" aria-keyshortcuts={String(k + 1)} onClick={() => answer(k)}><span className="opacity-60">{k + 1}</span> {o}</button>)}</div>
          <p className="mt-4 min-h-6 text-center" role="status" aria-live="polite">{fb === null ? "" : fb ? <span className="text-accent-fg">✓ {t("correct")}</span> : <span className="text-danger">✗</span>}</p>
        </div>
      )}
      {phase === "done" && (<div className="text-center" role="status" aria-live="polite"><p className="label">{t("gameOver")}</p><p className="stage-title my-3 text-7xl tabular-nums">{score}</p><p className="text-fg-2">{newBest ? t("newBest") : best !== null ? `${t("best")}: ${best}` : ""}</p><button type="button" className="btn btn-primary mt-6" onClick={() => setPhase("idle")}>{t("again")}</button></div>)}
    </div>
  );
}
