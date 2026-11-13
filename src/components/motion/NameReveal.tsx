"use client";

import { useEffect, useRef } from "react";
import { animate, reducedMotion, spring, stagger } from "@/lib/motion";

/** The big name: letters spring up one by one (anime.js). The real text stays available to screen readers; the letters are decoration. */
export function NameReveal({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const a = animate(el.querySelectorAll("[data-ch]"), { translateY: [70, 0], rotate: [-6, 0], duration: 900, delay: stagger(75), ease: spring({ stiffness: 140, damping: 11 }) });
    return () => { a.revert(); };
  }, []);
  return (
    <>
      <span className="sr-only">{name}</span>
      <span aria-hidden ref={ref}>
        {[...name].map((c, i) => (<span key={i} data-ch className="inline-block">{c === " " ? " " : c}</span>))}
      </span>
    </>
  );
}
