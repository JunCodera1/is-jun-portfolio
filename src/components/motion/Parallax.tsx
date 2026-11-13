"use client";

import { useEffect, useRef } from "react";
import { animate, reducedMotion } from "@/lib/motion";

/** Moves its children a few pixels against the pointer for depth (anime.js). Pointer devices only; never under reduced motion. */
export function Parallax({ strength = 14, className, children }: { strength?: number; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !window.matchMedia("(hover: hover)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2, y = (e.clientY / window.innerHeight - 0.5) * 2;
        animate(el, { translateX: -x * strength, translateY: -y * strength, duration: 700, ease: "outQuad" });
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, [strength]);
  return <div ref={ref} className={className}>{children}</div>;
}
