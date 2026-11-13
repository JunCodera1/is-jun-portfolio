"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Stagger } from "@/components/motion/Stagger";
import { riseIn } from "@/lib/motion";

// Each game's code is fetched only when its Play button is pressed.
const KanaBlitz = dynamic(() => import("./KanaBlitz"), { ssr: false, loading: () => <p className="label">…</p> });
const KanaMatch = dynamic(() => import("./KanaMatch"), { ssr: false, loading: () => <p className="label">…</p> });
const VocabSpeedrun = dynamic(() => import("./VocabSpeedrun"), { ssr: false, loading: () => <p className="label">…</p> });
const Reaction = dynamic(() => import("./Reaction"), { ssr: false, loading: () => <p className="label">…</p> });
const TypingSprint = dynamic(() => import("./TypingSprint"), { ssr: false, loading: () => <p className="label">…</p> });

type GameId = "blitz" | "match" | "vocab" | "reaction" | "typing";

export function GamesHub() {
  const t = useTranslations("play");
  const [active, setActive] = useState<GameId | null>(null);
  const games = [
    { id: "blitz" as const, no: "01" },
    { id: "match" as const, no: "02" },
    { id: "vocab" as const, no: "03" },
    { id: "reaction" as const, no: "04" },
    { id: "typing" as const, no: "05" },
  ];
  const stage = useRef<HTMLDivElement>(null);
  // the opened game slides up into view
  useEffect(() => {
    if (!active || !stage.current) return;
    const a = riseIn(stage.current, { from: 36 });
    return () => { a?.revert(); };
  }, [active]);
  return (
    <div>
      <Stagger as="ul" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => (
          <li key={g.id} data-stagger className="border-2 border-outline bg-surface p-6 shadow-[5px_5px_0_var(--outline)]">
            <span className="chapter">{g.no}</span>
            <h2 className="mt-4 text-3xl">{t(`${g.id}.title`)}</h2>
            <p className="mt-2 text-fg-2">{t(`${g.id}.desc`)}</p>
            <button type="button" className="btn btn-primary mt-5" aria-expanded={active === g.id} onClick={() => setActive(active === g.id ? null : g.id)}>
              {active === g.id ? t("close") : t("play")}
            </button>
          </li>
        ))}
      </Stagger>
      <div className="mt-10" ref={stage}>{active === "blitz" && <KanaBlitz />}{active === "match" && <KanaMatch />}{active === "vocab" && <VocabSpeedrun />}{active === "reaction" && <Reaction />}{active === "typing" && <TypingSprint />}</div>
    </div>
  );
}
