"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { shuffle } from "@/lib/kana-games";
import { typingMatches, type TypingWord } from "@/lib/station";
import { useWorldOptional } from "@/components/world/WorldProvider";
import { useBest } from "./useBest";

const DURATION = 30;
const w = (kana: string, ...romaji: string[]): TypingWord => ({ kana, romaji, meaning: "" });
const WORDS: TypingWord[] = [
  w("ありがとう", "arigatou", "arigato"), w("こんにちは", "konnichiwa"), w("さくら", "sakura"), w("ねこ", "neko"), w("やま", "yama"),
  w("みず", "mizu"), w("ともだち", "tomodachi"), w("がっこう", "gakkou", "gakko"), w("にほん", "nihon", "nippon"), w("すし", "sushi"),
  w("おはよう", "ohayou", "ohayo"), w("ひこうき", "hikouki", "hikoki"), w("せんせい", "sensei"), w("たべもの", "tabemono"), w("おんがく", "ongaku"),
];

/** Typing sprint: type the romaji of each kana word as fast as you can for 30 seconds. */
export default function TypingSprint() {
  const t = useTranslations("play");
  const world = useWorldOptional();
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [left, setLeft] = useState(DURATION);
  const [deck, setDeck] = useState<TypingWord[]>([]);
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [count, setCount] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const countRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { best, submit } = useBest("typing-sprint-best", (a, b) => a > b);
  const word = deck[i % Math.max(deck.length, 1)];

  const start = () => { countRef.current = 0; setCount(0); setLeft(DURATION); setI(0); setValue(""); setDeck(shuffle(WORDS)); setNewBest(false); setPhase("playing"); setTimeout(() => inputRef.current?.focus(), 0); };

  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => setLeft((s) => {
      if (s <= 1) { clearInterval(id); setPhase("done"); setNewBest(submit(countRef.current * 2)); world?.discover("game"); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [phase, submit, world]);

  const onChange = (v: string) => {
    setValue(v);
    if (word && typingMatches(v, word)) { countRef.current += 1; setCount((c) => c + 1); setI((n) => n + 1); setValue(""); }
  };

  return (
    <div role="group" aria-label={t("typing.title")} className="border-2 border-outline bg-surface p-5 shadow-[6px_6px_0_var(--accent)] md:p-8">
      {phase === "idle" && (<div><p className="text-fg-2">{t("typing.hint")}</p><button type="button" className="btn btn-primary mt-5" onClick={start}>{t("start")}</button>{best !== null && <p className="label mt-4">{t("best")}: {best} {t("typing.wpm")}</p>}</div>)}
      {phase === "playing" && word && (
        <div>
          <div className="flex justify-between font-mono text-sm"><span aria-hidden>{t("time")}: <b className="tabular-nums">{left}</b></span><span>{t("typing.words")}: <b className="tabular-nums">{count}</b></span></div>
          <p lang="ja" className="my-8 text-center font-display text-[clamp(3rem,12vw,6rem)] leading-none">{word.kana}</p>
          <label htmlFor="typing-input" className="label mb-2 block">{t("typing.prompt")}</label>
          <input id="typing-input" ref={inputRef} value={value} onChange={(e) => onChange(e.target.value)} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} className="h-14 w-full border-2 border-outline bg-transparent px-4 font-mono text-2xl outline-none focus:border-accent-fg" />
        </div>
      )}
      {phase === "done" && (<div className="text-center" role="status" aria-live="polite"><p className="label">{t("gameOver")}</p><p className="stage-title my-3 text-7xl tabular-nums">{count * 2}</p><p className="text-fg-2">{t("typing.wpm")} · {newBest ? t("newBest") : best !== null ? `${t("best")}: ${best}` : ""}</p><button type="button" className="btn btn-primary mt-6" onClick={() => setPhase("idle")}>{t("again")}</button></div>)}
    </div>
  );
}
