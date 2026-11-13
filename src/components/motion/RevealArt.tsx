"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const FINE = "(hover: hover) and (pointer: fine)";
const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const a = window.matchMedia(FINE), b = window.matchMedia(REDUCED);
  a.addEventListener("change", cb); b.addEventListener("change", cb);
  return () => { a.removeEventListener("change", cb); b.removeEventListener("change", cb); };
};
const enabled = () => window.matchMedia(FINE).matches && !window.matchMedia(REDUCED).matches;

/**
 * An illustration veiled in a grey halftone. Move the pointer over it and a circle of full colour opens under the cursor.
 * Only for mouse-like pointers; on touch and under reduced motion the art is simply shown in full colour (no veil, no hidden content).
 */
export function RevealArt({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const on = useSyncExternalStore(subscribe, enabled, () => false);
  const box = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!on) return;
    let raf = 0, x = -999, y = -999, r = 0, targetR = 0;
    const draw = () => {
      raf = 0;
      r += (targetR - r) * 0.2;
      const v = veil.current;
      if (v) { v.style.setProperty("--rx", `${x}px`); v.style.setProperty("--ry", `${y}px`); v.style.setProperty("--rr", `${r.toFixed(1)}px`); }
      if (Math.abs(targetR - r) > 0.5) raf = requestAnimationFrame(draw);
    };
    const onMove = (e: PointerEvent) => {
      const b = box.current?.getBoundingClientRect();
      if (!b) return;
      x = e.clientX - b.left; y = e.clientY - b.top;
      const near = e.clientX > b.left - 40 && e.clientX < b.right + 40 && e.clientY > b.top - 40 && e.clientY < b.bottom + 40;
      targetR = near ? 84 : 0;
      if (!raf) raf = requestAnimationFrame(draw);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", onMove); };
  }, [on]);

  return (
    <div ref={box} className={`relative ${className}`} data-cursor="media">
      {children}
      {on && <div ref={veil} aria-hidden className="reveal-veil" />}
    </div>
  );
}
