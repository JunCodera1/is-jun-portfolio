"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useWorldOptional } from "@/components/world/WorldProvider";
import { useBest } from "./useBest";

const ROUNDS = 5;

/** Reaction time: wait for the screen to flip, then hit it. Five rounds, average in milliseconds (lower is better). */
export default function Reaction() {
  const t = useTranslations("play");
  const world = useWorldOptional();
  const [phase, setPhase] = useState<"idle" | "wait" | "go" | "early" | "done">("idle");
  const [times, setTimes] = useState<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t0 = useRef(0);
  const { best, submit } = useBest("reaction-best", (a, b) => a < b);
  const [newBest, setNewBest] = useState(false);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const arm = () => {
    setPhase("wait");
    timer.current = setTimeout(() => { t0.current = performance.now(); setPhase("go"); }, 1200 + Math.random() * 2400);
  };
  const press = () => {
    if (phase === "idle" || phase === "early") { if (phase === "idle") { setTimes([]); setNewBest(false); } arm(); return; }
    if (phase === "wait") { if (timer.current) clearTimeout(timer.current); setPhase("early"); return; }
    if (phase === "go") {
      const ms = Math.round(performance.now() - t0.current);
      const all = [...times, ms];
      setTimes(all);
      if (all.length >= ROUNDS) {
        setPhase("done");
        setNewBest(submit(Math.round(all.reduce((a, b) => a + b, 0) / all.length)));
        world?.discover("game");
      } else arm();
    }
  };
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return (
    <div role="group" aria-label={t("reaction.title")} className="border-2 border-outline bg-surface p-5 shadow-[6px_6px_0_var(--accent)] md:p-8">
      {phase === "done" ? (
        <div className="text-center" role="status" aria-live="polite">
          <p className="label">{t("reaction.result")}</p>
          <p className="stage-title my-3 text-7xl tabular-nums">{t("reaction.ms", { ms: avg })}</p>
          <p className="text-fg-2">{newBest ? t("newBest") : best !== null ? `${t("best")}: ${t("reaction.ms", { ms: best })}` : ""}</p>
          <button type="button" className="btn btn-primary mt-6" onClick={() => { setPhase("idle"); setTimes([]); }}>{t("again")}</button>
        </div>
      ) : (
        <div>
          <button
            type="button" onPointerDown={(e) => { e.preventDefault(); press(); }} onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); press(); } }}
            className={`grid h-64 w-full place-items-center border-2 border-outline text-center font-display text-4xl uppercase transition-colors md:h-80 md:text-6xl ${phase === "go" ? "bg-[#f4f4f0] text-[#0a0a0c]" : phase === "wait" ? "bg-accent text-accent-ink" : "bg-surface-2"}`}
          >
            {phase === "idle" && t("reaction.ready")}{phase === "wait" && t("reaction.wait")}{phase === "go" && t("reaction.go")}{phase === "early" && t("reaction.early")}
          </button>
          <p className="mt-4 font-mono text-sm" role="status" aria-live="polite">{t("reaction.round", { n: Math.min(times.length + 1, ROUNDS), total: ROUNDS })}{times.length > 0 && ` · ${t("reaction.last", { ms: times[times.length - 1]! })}`}{best !== null && ` · ${t("best")}: ${t("reaction.ms", { ms: best })}`}</p>
        </div>
      )}
    </div>
  );
}
