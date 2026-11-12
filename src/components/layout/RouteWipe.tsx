"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * A light page-change cue, played AFTER a client-side navigation (never on first load, never under reduced motion):
 *  1. a thin accent line sweeps along the top edge (`.wipe`, 3 px, decorative, pointer-events: none);
 *  2. the new page settles in with a 260 ms, 6 px ease-out (Web Animations API on <main>).
 * Neither can delay or block navigation or input.
 * The play counter is updated while rendering ("adjust state while rendering"), the DOM animation runs in an effect.
 */
export function RouteWipe() {
  const pathname = usePathname();
  const [prev, setPrev] = useState(pathname);
  const [plays, setPlays] = useState(0);
  if (prev !== pathname) {
    setPrev(pathname);
    setPlays((n) => n + 1);
  }

  useEffect(() => {
    if (plays === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.getElementById("main")?.animate(
      [{ opacity: 0.82, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
      { duration: 260, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" },
    );
  }, [plays]);

  return plays > 0 ? <div key={plays} aria-hidden className="wipe" /> : null;
}
