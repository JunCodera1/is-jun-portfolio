"use client";

import { useEffect, useRef } from "react";
import { animate, reducedMotion } from "@/lib/motion";

/** A gentle idle float (anime.js) for decorative art. Static under reduced motion. */
export function Float({ className, amount = 8, children }: { className?: string; amount?: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const a = animate(el, { translateY: [0, -amount], rotate: [-1.5, 1.5], duration: 2800, alternate: true, loop: true, ease: "inOutSine" });
    return () => { a.revert(); };
  }, [amount]);
  return <div ref={ref} className={className}>{children}</div>;
}
