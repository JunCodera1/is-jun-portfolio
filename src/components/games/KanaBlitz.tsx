"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ALL_KANA, BASIC_KANA, type Script } from "@/content/data/kana";
import { makeQuestion, type Question } from "@/lib/kana-games";
import { useBest } from "./useBest";
import { useWorldOptional } from "@/components/world/WorldProvider";

const DURATION = 45;

/** Kana Blitz: name the romaji for as many kana as you can in 45 seconds. Keys 1–4 answer. */
export default function KanaBlitz() {
  const t = useTranslations("play");
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [script, setScript] = useState<Script>("hiragana");
  const [pool, setPool] = useState<"basic" | "all">("basic");
  const [left, setLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [q, setQ] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; answer: string } | null>(null);
  const [newBest, setNewBest] = useState(false);
  const { best, submit } = useBest("kana-blitz-best", (a, b) => a > b);
  const scoreRef = useRef(0);
  const world = useWorldOptional();

  const nextQ = useCallback(() => setQ(makeQuestion(pool === "basic" ? BASIC_KANA : ALL_KANA, script)), [pool, script]);

  const start = () => {
    scoreRef.current = 0;
    setScore(0); setStreak(0); setLeft(DURATION); setFeedback(null); setNewBest(false);
    nextQ();
    setPhase("playing");
  };

  // countdown: state changes happen in the interval callback, not synchronously in the effect body
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setPhase("done");
          setNewBest(submit(scoreRef.current));
          world?.discover("game");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, submit, world]);

  const answer = useCallback((choice: string) => {
    if (!q || phase !== "playing") return;
    const ok = choice === q.answer;
    setFeedback({ ok, answer: q.answer });
    if (ok) { scoreRef.current += 1; setScore((s) => s + 1); setStreak((s) => s + 1); } else setStreak(0);
    nextQ();
  }, [q, phase, nextQ]);

  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const i = Number(e.key) - 1;
      if (q && i >= 0 && i < q.options.length && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); answer(q.options[i]!); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, q, answer]);

  return (
    <div role="group" aria-label={t("blitz.title")} className="border-2 border-outline bg-surface p-5 shadow-[6px_6px_0_var(--outline)] md:p-8">
      {phase === "idle" && (
        <div className="grid gap-6 md:grid-cols-2">
          <fieldset>
            <legend className="label mb-2">{t("script")}</legend>
            <div className="flex flex-wrap gap-2">
              {(["hiragana", "katakana", "both"] as const).map((s) => (
                <button key={s} type="button" className="chip tap" aria-pressed={script === s} onClick={() => setScript(s)}>{t(`scripts.${s}`)}</button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="label mb-2">{t("pool")}</legend>
            <div className="flex flex-wrap gap-2">
              {(["basic", "all"] as const).map((p) => (
                <button key={p} type="button" className="chip tap" aria-pressed={pool === p} onClick={() => setPool(p)}>{t(`pools.${p}`)}</button>
              ))}
            </div>
          </fieldset>
          <div className="md:col-span-2">
            <button type="button" className="btn btn-primary" onClick={start}>{t("start")}</button>
            <p className="label mt-4 !normal-case !tracking-normal">{t("blitz.hint")} {best !== null && <>· {t("best")}: {best}</>}</p>
          </div>
        </div>
      )}

      {phase === "playing" && q && (
        <div>
          <div className="flex items-center justify-between font-mono text-sm">
            <span aria-hidden>{t("time")}: <b className="tabular-nums">{left}</b></span>
            <span>{t("score")}: <b className="tabular-nums">{score}</b></span>
            <span>{t("streak")}: <b className="tabular-nums">{streak}</b></span>
          </div>
          <div aria-hidden className="mt-3 h-2 border border-outline"><div className="h-full bg-accent transition-[width] duration-1000 ease-linear" style={{ width: `${(left / DURATION) * 100}%` }} /></div>
          <p lang="ja" className="my-8 text-center font-display text-[clamp(5rem,20vw,9rem)] leading-none" aria-label={t("blitz.question")}>{q.prompt}</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {q.options.map((o, i) => (
              <button key={o} type="button" className="btn justify-center text-base" aria-keyshortcuts={String(i + 1)} onClick={() => answer(o)}>
                <span className="opacity-60">{i + 1}</span> {o}
              </button>
            ))}
          </div>
          <p className="mt-4 min-h-6 text-center" role="status" aria-live="polite">
            {feedback && (feedback.ok ? <span className="text-accent-fg">✓ {t("correct")}</span> : <span className="text-danger">✗ {t("wrong", { answer: feedback.answer })}</span>)}
          </p>
        </div>
      )}

      {phase === "done" && (
        <div className="text-center" role="status" aria-live="polite">
          <p className="label">{t("gameOver")}</p>
          <p className="my-3 font-display text-7xl tabular-nums">{score}</p>
          <p className="text-fg-2">{newBest ? t("newBest") : best !== null ? `${t("best")}: ${best}` : ""}</p>
          <button type="button" className="btn btn-primary mt-6" onClick={() => setPhase("idle")}>{t("again")}</button>
        </div>
      )}
    </div>
  );
}
