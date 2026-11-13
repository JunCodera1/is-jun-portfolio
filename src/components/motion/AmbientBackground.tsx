"use client";

import { useEffect, useRef } from "react";
import { syncTimeOfDay } from "@/lib/theme";
import { reducedMotion } from "@/lib/motion";

/** A soft glow that drifts with the pointer and the scroll position; its colour follows the time of day (set on <html data-daypart>). Static under reduced motion. */
export function AmbientBackground() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    syncTimeOfDay();
    const tick = setInterval(() => syncTimeOfDay(), 5 * 60_000);
    if (reducedMotion()) return () => clearInterval(tick);

    let tx = 0.25, ty = 0.2, x = tx, y = ty, scroll = 0, px = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.06; y += (ty - y) * 0.06;
      el.style.setProperty("--ax", x.toFixed(4));
      el.style.setProperty("--ay", Math.min(1, y + scroll * 0.35).toFixed(4));
      raf = Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    const onMove = (e: PointerEvent) => { px = e.clientX; tx = 0.1 + (px / window.innerWidth) * 0.5; ty = 0.1 + (e.clientY / window.innerHeight) * 0.5; kick(); };
    const onScroll = () => { const max = document.documentElement.scrollHeight - window.innerHeight; scroll = max > 0 ? window.scrollY / max : 0; kick(); };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearInterval(tick); cancelAnimationFrame(raf); window.removeEventListener("pointermove", onMove); window.removeEventListener("scroll", onScroll); };
  }, []);
  return <div ref={ref} aria-hidden className="ambient" />;
}
