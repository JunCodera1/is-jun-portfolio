"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pop, reducedMotion } from "@/lib/motion";

export interface Planet { id: string; href: string; glyph: string; color: string; ring: number; size: number; speed: number; phase: number; label: string; desc: string }

/**
 * The site as a small solar system: the sun is the home page, each planet is a part of the site. Planets drift slowly on their orbits;
 * touching or focusing one stops the motion so it is easy to click. Under reduced motion they stand still. Planets are real buttons,
 * and a plain list below repeats every destination.
 */
export function SolarSystem({ planets, sun }: { planets: Planet[]; sun: { href: string; label: string; desc: string } }) {
  const t = useTranslations("orbit");
  const [sel, setSel] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const board = useRef<HTMLDivElement>(null);
  const angles = useRef(planets.map((p) => p.phase));
  const pausedRef = useRef(false);
  const cur = planets.find((p) => p.id === sel);

  useEffect(() => { pausedRef.current = paused || sel !== null; }, [paused, sel]);

  // place planets on their orbits; keep moving unless paused or reduced motion
  useEffect(() => {
    const root = board.current;
    if (!root) return;
    const els = [...root.querySelectorAll<HTMLElement>("[data-planet]")];
    const place = () => els.forEach((el, i) => {
      const p = planets[i]!, a = angles.current[i]!;
      el.style.left = `${50 + Math.cos(a) * p.ring}%`;
      el.style.top = `${50 + Math.sin(a) * p.ring}%`;
    });
    place();
    if (reducedMotion()) return;
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(64, now - last); last = now;
      if (!pausedRef.current && !document.hidden) { planets.forEach((p, i) => { angles.current[i]! += p.speed * dt * 0.00006; }); place(); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [planets]);

  useEffect(() => { if (sel) pop(board.current?.querySelector(`[data-planet="${sel}"]`), 1.25); }, [sel]);

  return (
    <div>
      <div ref={board} onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} className="relative mx-auto aspect-square w-full max-w-[44rem] select-none">
        <svg aria-hidden focusable="false" viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          {[...new Set(planets.map((p) => p.ring))].map((r) => (<circle key={r} cx="50" cy="50" r={r} fill="none" strokeDasharray="1.2 2.2" style={{ stroke: "var(--line-strong)", strokeWidth: 0.35 }} />))}
        </svg>
        <Link href={sun.href} aria-label={`${sun.label}. ${sun.desc}`} className="absolute left-1/2 top-1/2 grid h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-outline bg-accent text-center font-display text-[clamp(0.7rem,2.6vw,1.2rem)] leading-tight text-accent-ink shadow-[0_0_0_6px_color-mix(in_srgb,var(--accent)_25%,transparent)] transition-transform hover:scale-105">
          <span aria-hidden>{sun.label}</span>
        </Link>
        {planets.map((p) => (
          <button
            key={p.id} type="button" data-planet={p.id} aria-pressed={sel === p.id}
            onClick={() => setSel(sel === p.id ? null : p.id)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
            className="group absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-outline font-display leading-none shadow-[2px_2px_0_var(--outline)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-3 focus-visible:outline-accent-fg aria-pressed:ring-4 aria-pressed:ring-accent-fg"
            style={{ width: `${p.size}%`, height: `${p.size}%`, minWidth: 40, minHeight: 40, background: p.color, color: p.color === "var(--surface)" ? "var(--fg)" : "#fff", left: `${50 + p.ring}%`, top: "50%", fontSize: `clamp(0.9rem, ${p.size * 0.28}vw, 1.6rem)` }}
          >
            <span aria-hidden lang="ja">{p.glyph}</span>
            <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap bg-[#0a0a0c] px-2 py-0.5 font-mono text-[0.68rem] uppercase tracking-wider text-white max-md:sr-only">{p.label}</span>
            <span className="sr-only">. {p.desc}</span>
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mx-auto mt-10 max-w-2xl border-2 border-outline bg-surface p-5 shadow-[6px_6px_0_var(--accent)]">
        {cur ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0"><p className="label">{t("planet")}</p><h2 className="stage-title text-3xl">{cur.label}</h2><p className="mt-1 text-fg-2">{cur.desc}</p></div>
            <Link href={cur.href} className="btn btn-primary">{t("visit", { name: cur.label })}</Link>
          </div>
        ) : <p className="text-fg-2">{t("pick")}</p>}
      </div>

      <ul className="mx-auto mt-8 grid max-w-2xl gap-x-8 gap-y-1 sm:grid-cols-2" aria-label={t("list")}>
        {planets.map((p) => (<li key={p.id}><Link href={p.href} className="link">{p.label}</Link><span className="label ml-2 !normal-case !tracking-normal">{p.desc}</span></li>))}
      </ul>
    </div>
  );
}
