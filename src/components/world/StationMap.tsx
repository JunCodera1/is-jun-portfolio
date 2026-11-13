"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, pop, riseIn, reducedMotion, shake, spring, stagger, staggerIn } from "@/lib/motion";
import { useLocale, useTranslations } from "next-intl";
import { lines, type MissionId } from "@/content/data/station";
import { buildMission, passes, type MissionQuestion } from "@/lib/station";
import type { Locale } from "@/i18n/routing";
import { stampStore } from "@/lib/world-store";
import { Panel } from "./Panel";
import { useWorld } from "./WorldProvider";

function Runner({ id, onClose }: { id: MissionId; onClose: () => void }) {
  const t = useTranslations("station");
  const locale = useLocale() as Locale;
  const { sfx, discover } = useWorld();
  const [qs, setQs] = useState<MissionQuestion[]>(() => buildMission(id, locale));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = i >= qs.length;
  const q = qs[i];
  const root = useRef<HTMLDivElement>(null);

  // each question: the options slide in; the result: the score pops
  useEffect(() => {
    const a = staggerIn([...(root.current?.querySelectorAll("[data-opt]") ?? [])], { from: 16, step: 55 });
    return () => { a?.revert(); };
  }, [i, qs]);
  useEffect(() => {
    if (done) pop(root.current?.querySelector("[data-score]"), 1.18);
  }, [done]);

  const pick = (k: number) => {
    if (picked !== null || !q) return;
    setPicked(k);
    const ok = k === q.answer;
    if (ok) setScore((s) => s + 1);
    sfx(ok ? "success" : "fail");
    const el = root.current?.querySelectorAll("[data-opt]")[k];
    if (ok) pop(el, 1.06); else shake(el);
  };
  const next = () => {
    const last = i === qs.length - 1;
    setPicked(null);
    setI(i + 1);
    if (last) {
      discover("mission");
      if (passes(score, qs.length)) { const cur = stampStore.get(); if (!cur.includes(id)) stampStore.set([...cur, id]); }
    }
  };
  const retry = () => { setQs(buildMission(id, locale)); setI(0); setPicked(null); setScore(0); };

  return (
    <div ref={root} onKeyDown={(e) => { const n = Number(e.key) - 1; if (q && n >= 0 && n < q.options.length) { e.preventDefault(); pick(n); } }}>
      {!done && q ? (
        <div>
          <p className="label">{t("question", { n: i + 1, total: qs.length })} · {t("score")}: {score}</p>
          {q.context && <p className="mt-3 text-fg-2">{q.context}</p>}
          <p lang={q.promptLang} className="my-6 text-center font-display text-[clamp(2.2rem,8vw,4.5rem)] leading-tight">{q.prompt}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {q.options.map((o, k) => {
              const state = picked === null ? "" : k === q.answer ? "!bg-accent !text-accent-ink" : k === picked ? "!border-danger !text-danger" : "opacity-60";
              return (
                <button key={k} data-opt type="button" disabled={picked !== null} aria-keyshortcuts={String(k + 1)} onClick={() => pick(k)} className={`btn !justify-start !normal-case !tracking-normal text-base ${state}`}>
                  <span className="opacity-60">{k + 1}</span> <span lang={id === "kaiwa" || id.startsWith("grammar") ? "ja" : undefined}>{o}</span>
                </button>
              );
            })}
          </div>
          <div role="status" aria-live="polite" className="mt-5 min-h-12">
            {picked !== null && (
              <div>
                <p className="font-display text-xl">{picked === q.answer ? `✓ ${t("correct")}` : `✗ ${t("wrong")}`}</p>
                {q.explain && <p className="mt-1 text-sm text-fg-2">{q.explain}</p>}
                <button type="button" className="btn btn-primary mt-4" onClick={next}>{i === qs.length - 1 ? t("finish") : t("next")}</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div role="status" aria-live="polite">
          <p className="label">{t("result")}</p>
          <p data-score className="stage-title my-2 w-fit text-7xl">{score}/{qs.length}</p>
          <p className="text-lg">{passes(score, qs.length) ? t("stamped") : t("notYet")}</p>
          <p className="mt-1 text-sm text-fg-2">{t("localNote")}</p>
          <div className="mt-6 flex gap-3"><button type="button" className="btn btn-primary" onClick={retry}>{t("retry")}</button><button type="button" className="btn" onClick={onClose}>{t("backToMap")}</button></div>
        </div>
      )}
    </div>
  );
}

export function StationMap() {
  const t = useTranslations("station");
  const stamps = useSyncExternalStore(stampStore.subscribe, stampStore.get, stampStore.server);
  const [open, setOpen] = useState<MissionId | null>(null);
  const { sfx } = useWorld();
  const map = useRef<HTMLDivElement>(null);
  // the rail draws itself, then the stops pop onto it
  useEffect(() => {
    if (reducedMotion() || !map.current) return;
    const rails = animate(map.current.querySelectorAll("[data-rail]"), { scaleX: [0, 1], duration: 900, delay: stagger(160), ease: "outExpo" });
    const stops = riseIn([...map.current.querySelectorAll("[data-stop]")], { from: 24, delay: 250, step: 60 });
    return () => { rails.revert(); stops?.revert(); };
  }, []);
  // a freshly earned stamp thuds down
  const prev = useRef(stamps);
  useEffect(() => {
    const fresh = stamps.filter((s) => !prev.current.includes(s));
    prev.current = stamps;
    fresh.forEach((s) => { const el = map.current?.querySelector(`[data-stop="${s}"] span`); if (el && !reducedMotion()) animate(el, { scale: [2.2, 1], rotate: [-18, 0], duration: 600, ease: spring({ stiffness: 260, damping: 12 }) }); });
  }, [stamps]);
  return (
    <div className="page mt-10" ref={map}>
      <div className="space-y-8">
        {lines.map((l) => (
          <section key={l.id} aria-labelledby={`line-${l.id}`}>
            <h2 id={`line-${l.id}`} className="plate !text-xl">{t(`lines.${l.id}.name`)}</h2>
            <p className="mt-2 max-w-[60ch] text-sm text-fg-2">{t(`lines.${l.id}.desc`)}</p>
            <ol className="relative isolate mt-5 flex flex-wrap gap-x-6 gap-y-6">
              <li aria-hidden data-rail className="pointer-events-none absolute left-4 right-4 top-[1.35rem] -z-10 h-2 origin-left bg-accent" />
              {l.stations.map((s, k) => {
                const stamped = stamps.includes(s);
                return (
                  <li key={s} data-stop={s}>
                    <button type="button" onClick={() => { sfx("select"); setOpen(s); }} aria-haspopup="dialog" className="group flex w-44 flex-col items-start gap-2 text-left">
                      <span className={`grid h-11 w-11 place-items-center border-[3px] border-outline font-mono text-sm font-bold ${stamped ? "bg-accent text-accent-ink" : "bg-bg text-fg"}`}>{stamped ? "✓" : k + 1}</span>
                      <span className="stage-title text-xl group-hover:text-accent-fg">{t(`missions.${s}.name`)}</span>
                      <span className="text-sm text-fg-2">{t(`missions.${s}.desc`)}</span>
                      <span className="sr-only">{stamped ? t("stampedSr") : t("notStampedSr")}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
        <section aria-labelledby="line-n1">
          <h2 id="line-n1" className="plate !text-xl opacity-70">{t("lines.n1.name")}</h2>
          <p className="slot mt-4 max-w-[60ch]">{t("lines.n1.desc")}</p>
        </section>
      </div>
      <p className="label mt-10 !normal-case !tracking-normal">{t("localNote")} {t("approx")}</p>
      <Panel open={open !== null} onClose={() => setOpen(null)} title={open ? t(`missions.${open}.name`) : ""}>
        {open && <Runner key={open} id={open} onClose={() => setOpen(null)} />}
      </Panel>
    </div>
  );
}
