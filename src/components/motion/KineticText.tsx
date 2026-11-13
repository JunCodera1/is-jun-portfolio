"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "@/lib/motion";

/**
 * Big type with a pulse: as the block scrolls into view, every character rises, straightens and settles one after another;
 * as it scrolls out the top, they drift apart slightly. Transform only. The real sentence stays in the page for screen readers
 * (the letters are decoration), and under reduced motion it is just text.
 */
export function KineticText({ text, className = "", lang }: { text: string; className?: string; lang?: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const words = text.split(/(\s+)/).filter((w) => w.length > 0);
  let n = 0;

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    const chars = [...el.querySelectorAll<HTMLElement>("[data-ch]")];
    const total = chars.length;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      const enter = Math.min(1, Math.max(0, (vh * 0.92 - r.top) / (vh * 0.55)));   // 0 → 1 while it rises into view
      const exit = Math.min(1, Math.max(0, (vh * 0.12 - r.bottom) / (vh * 0.3)));   // 0 → 1 while it leaves through the top
      for (let i = 0; i < total; i++) {
        const s = Math.min(1, Math.max(0, enter * 2.2 - (i / total) * 1.2));
        const dir = i % 2 ? 1 : -1;
        const y = (1 - s) * 46 - exit * 18 * (1 + (i % 3));
        const rot = (1 - s) * 9 * dir + exit * 5 * dir;
        chars[i]!.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${(0.88 + 0.12 * s).toFixed(3)})`;
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [text]);

  return (
    <span className={className} lang={lang}>
      <span className="sr-only">{text}</span>
      <span ref={root} aria-hidden>
        {words.map((w, wi) => {
          if (/^\s+$/.test(w)) return " ";
          const chars = [...w].map((c) => (<span key={n++} data-ch className="inline-block will-change-transform">{c}</span>));
          // short words stay together; long unspaced runs (Japanese) must be allowed to wrap between characters
          return [...w].length <= 16 ? <span key={wi} className="inline-block whitespace-nowrap">{chars}</span> : <span key={wi}>{chars}</span>;
        })}
      </span>
    </span>
  );
}
