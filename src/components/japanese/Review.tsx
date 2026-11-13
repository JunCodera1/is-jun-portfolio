"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buildSession, counts, review, today } from "@/lib/srs";
import { deckStore, markStudiedToday } from "@/lib/world-store";
import { hasSpeechSnapshot } from "./speech-support";
import { speakJa } from "@/lib/speech";
import { animate, pop, reducedMotion, riseIn } from "@/lib/motion";
import { useWorldOptional } from "@/components/world/WorldProvider";
import { StudyStats } from "./StudyStats";

export interface ReviewCard { id: string; kind: "vocab" | "kanji"; front: string; reading: string; meaning?: string; level: "n3" | "n2" }

export function Review({ cards }: { cards: ReviewCard[] }) {
  const t = useTranslations("review");
  const deck = useSyncExternalStore(deckStore.subscribe, deckStore.get, deckStore.server);
  const canSpeak = useSyncExternalStore(hasSpeechSnapshot.subscribe, hasSpeechSnapshot.get, hasSpeechSnapshot.server);
  const world = useWorldOptional();
  const [session, setSession] = useState<string[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(false);
  const [known, setKnown] = useState(0);
  const card = useRef<HTMLDivElement>(null);
  const byId = new Map(cards.map((c) => [c.id, c]));
  const day = today();
  const c = counts(cards.map((x) => x.id), deck, day);
  const queueSize = Math.min(10, c.due + c.fresh);

  const start = () => { setSession(buildSession(cards.map((x) => x.id), deck, today(), 10)); setIdx(0); setShown(false); setKnown(0); };
  const current = session && idx < session.length ? byId.get(session[idx]!) : undefined;
  const done = session !== null && idx >= session.length;

  // each new card slides in; the answer rises when revealed; the result pops
  useEffect(() => { if (current && !reducedMotion() && card.current) { const a = animate(card.current, { translateX: [44, 0], duration: 450, ease: "outQuart" }); return () => { a.revert(); }; } }, [current]);
  useEffect(() => { if (shown && card.current) { const a = riseIn([...card.current.querySelectorAll("[data-answer]")], { from: 14, step: 60 }); return () => { a?.revert(); }; } }, [shown]);
  useEffect(() => { if (done) pop(document.querySelector("[data-result]"), 1.15); }, [done]);

  const grade = (ok: boolean) => {
    if (!current) return;
    deckStore.set({ ...deckStore.get(), [current.id]: review(deckStore.get()[current.id], ok, today()) });
    markStudiedToday();
    world?.sfx(ok ? "success" : "fail");
    if (ok) setKnown((k) => k + 1);
    setShown(false);
    setIdx((i) => i + 1);
  };

  // keys work wherever focus is (after "Start" the button is gone and focus falls to the page)
  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && el.closest("input, textarea, select, [contenteditable=true]")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (!shown && e.key === " ") { e.preventDefault(); setShown(true); }
      else if (shown && (e.key === "ArrowRight" || e.key === "1")) { e.preventDefault(); grade(true); }
      else if (shown && (e.key === "ArrowLeft" || e.key === "2")) { e.preventDefault(); grade(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- grade is recreated every render and only reads `current`
  }, [current, shown]);

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div>
        {session === null ? (
          <div className="border-2 border-outline bg-surface p-6 shadow-[6px_6px_0_var(--accent)] md:p-8">
            <dl className="grid grid-cols-3 gap-4">
              {([["due", c.due], ["new", c.fresh], ["learned", c.learned]] as const).map(([k, n]) => (
                <div key={k}><dt className="label">{t(k)}</dt><dd className="font-display text-5xl leading-none">{n}</dd></div>
              ))}
            </dl>
            {queueSize === 0 ? (
              <p className="mt-6 text-lg">{t("caughtUp")}</p>
            ) : (
              <button type="button" className="btn btn-primary mt-6" onClick={start}>{t("start", { n: queueSize })}</button>
            )}
            <p className="label mt-4 !normal-case !tracking-normal">{t("how")}</p>
          </div>
        ) : done ? (
          <div className="border-2 border-outline bg-surface p-6 shadow-[6px_6px_0_var(--accent)] md:p-8" role="status" aria-live="polite">
            <p className="label">{t("done")}</p>
            <p data-result className="stage-title my-2 w-fit text-7xl">{known}/{session!.length}</p>
            <p className="text-lg">{t("result", { ok: known, total: session!.length })}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="btn btn-primary" onClick={() => setSession(null)}>{t("back")}</button>
              <Link href="/station" className="btn">{t("toStation")}</Link>
            </div>
          </div>
        ) : current ? (
          <div>
            <p className="label" aria-live="polite">{t("counter", { n: idx + 1, total: session!.length })} · {t(current.kind)} · {current.level.toUpperCase()}</p>
            <div ref={card} className="mt-3 border-2 border-outline bg-surface p-6 shadow-[6px_6px_0_var(--accent)] md:p-10">
              <p lang="ja" className="text-center font-display text-[clamp(3.5rem,14vw,7rem)] leading-tight">{current.front}</p>
              {shown ? (
                <div className="mt-6 text-center" role="status" aria-live="polite">
                  <p data-answer lang="ja" className="font-display text-3xl">{current.reading}</p>
                  {current.meaning && <p data-answer className="mt-1 text-xl text-fg-2">{current.meaning}</p>}
                </div>
              ) : <p className="mt-6 text-center text-fg-2">{t("think")}</p>}
              {canSpeak && (
                <div className="mt-4 text-center">
                  <button type="button" className="chip tap" onClick={() => speakJa(current.reading)}>{t("listen")}</button>
                </div>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {!shown ? (
                <button type="button" className="btn btn-primary" aria-keyshortcuts="Space" onClick={() => setShown(true)}>{t("reveal")}</button>
              ) : (
                <>
                  <button type="button" className="btn btn-primary" aria-keyshortcuts="ArrowRight 1" onClick={() => grade(true)}>{t("gotIt")}</button>
                  <button type="button" className="btn" aria-keyshortcuts="ArrowLeft 2" onClick={() => grade(false)}>{t("again")}</button>
                </>
              )}
            </div>
            <p className="label mt-4 !normal-case !tracking-normal">{t("keys")}{canSpeak ? ` · ${t("listenNote")}` : ""}</p>
          </div>
        ) : null}
      </div>
      <StudyStats />
    </div>
  );
}
