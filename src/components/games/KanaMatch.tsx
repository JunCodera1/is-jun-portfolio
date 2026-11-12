"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ALL_KANA, type Script } from "@/content/data/kana";
import { isMatch, makeDeck, type Card } from "@/lib/kana-games";
import { useBest } from "./useBest";
import { useWorldOptional } from "@/components/world/WorldProvider";

/** Kana Match: flip two cards to pair each kana with its romaji. Fewest moves wins. */
export default function KanaMatch() {
  const t = useTranslations("play");
  const [script, setScript] = useState<Script>("hiragana");
  const [deck, setDeck] = useState<Card[]>(() => makeDeck(ALL_KANA, "hiragana"));
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const lock = useRef(false);
  const world = useWorldOptional();
  const { best, submit } = useBest("kana-match-best", (a, b) => a < b);
  const won = matched.length === deck.length;

  const deal = (s: Script) => {
    setScript(s); setDeck(makeDeck(ALL_KANA, s)); setOpen([]); setMatched([]); setMoves(0); setNewBest(false); lock.current = false;
  };

  const flip = (c: Card) => {
    if (lock.current || open.includes(c.id) || matched.includes(c.id)) return;
    const next = [...open, c.id];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next.map((id) => deck.find((d) => d.id === id)!) as [Card, Card];
    if (isMatch(a, b)) {
      const all = [...matched, a.id, b.id];
      setMatched(all); setOpen([]);
      if (all.length === deck.length) { setNewBest(submit(moves + 1)); world?.discover("game"); }
    } else {
      lock.current = true;
      setTimeout(() => { setOpen([]); lock.current = false; }, 700);
    }
  };

  return (
    <div role="group" aria-label={t("match.title")} className="border-2 border-outline bg-surface p-5 shadow-[6px_6px_0_var(--outline)] md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("script")}>
          {(["hiragana", "katakana", "both"] as const).map((s) => (
            <button key={s} type="button" className="chip tap" aria-pressed={script === s} onClick={() => deal(s)}>{t(`scripts.${s}`)}</button>
          ))}
        </div>
        <p className="font-mono text-sm">{t("moves")}: <b className="tabular-nums">{moves}</b>{best !== null && <> · {t("best")}: {best}</>}</p>
      </div>

      <ul className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {deck.map((c) => {
          const shown = open.includes(c.id) || matched.includes(c.id);
          const done = matched.includes(c.id);
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => flip(c)}
                aria-pressed={shown}
                aria-label={shown ? c.face : t("match.hidden", { n: c.id + 1 })}
                disabled={done}
                lang={shown && c.kind === "kana" ? "ja" : undefined}
                className={`grid aspect-[4/3] w-full place-items-center border-2 border-outline font-display text-3xl transition-transform duration-200 sm:text-4xl ${
                  done ? "bg-accent text-accent-ink" : shown ? "bg-surface-2" : "bg-bg hover:-translate-y-0.5"
                } focus-visible:outline-2`}
              >
                {shown ? c.face : <span aria-hidden className="text-fg-3">?</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 min-h-12" role="status" aria-live="polite">
        {won && <p className="font-display text-2xl">{t("match.won", { moves })} {newBest && <span className="text-accent-fg">· {t("newBest")}</span>}</p>}
      </div>
      <button type="button" className="btn mt-2" onClick={() => deal(script)}>{won ? t("again") : t("match.reshuffle")}</button>
    </div>
  );
}
