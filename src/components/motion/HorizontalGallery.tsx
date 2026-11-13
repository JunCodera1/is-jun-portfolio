"use client";

import { Children, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

const PIN = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const a = window.matchMedia(PIN), b = window.matchMedia(REDUCED);
  a.addEventListener("change", cb); b.addEventListener("change", cb);
  return () => { a.removeEventListener("change", cb); b.removeEventListener("change", cb); };
};
const canPin = () => window.matchMedia(PIN).matches && !window.matchMedia(REDUCED).matches;

/**
 * An exhibition: on a desktop with a mouse, vertical scrolling slides the cards sideways while the section stays pinned;
 * anywhere else (touch, small screens, reduced motion) it is a normal swipeable row with arrow buttons.
 * Focusing a card with the keyboard brings it into view in both modes, and every card stays a real, reachable element.
 */
export function HorizontalGallery({ label, prev, next, children }: { label: string; prev: string; next: string; children: React.ReactNode }) {
  const pinned = useSyncExternalStore(subscribe, canPin, () => false);
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [dist, setDist] = useState(0); // how far the track travels in pinned mode
  const cards = Children.toArray(children);

  // pinned mode: measure, then keep the transform in step with the scroll position
  useLayoutEffect(() => {
    if (!pinned || !track.current) return;
    const measure = () => setDist(Math.max(0, track.current!.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [pinned, cards.length]);

  const progress = useCallback(() => {
    const o = outer.current, t = track.current;
    if (!o || !t) return 0;
    const scrollable = o.offsetHeight - window.innerHeight;
    return scrollable > 0 ? Math.min(1, Math.max(0, (window.scrollY - (o.getBoundingClientRect().top + window.scrollY)) / scrollable)) : 0;
  }, []);

  useEffect(() => {
    if (!pinned) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = progress();
      if (track.current) track.current.style.transform = `translate3d(${(-p * dist).toFixed(1)}px, 0, 0)`;
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [pinned, dist, progress]);

  // keyboard: focusing a card scrolls the page so that card is on screen
  const onFocus = (e: React.FocusEvent) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>("[data-card]");
    if (!card) return;
    if (pinned && outer.current && track.current && dist > 0) {
      const left = card.offsetLeft, width = card.offsetWidth, cur = -progress() * dist;
      const visibleStart = -cur, visibleEnd = -cur + window.innerWidth;
      if (left >= visibleStart + 24 && left + width <= visibleEnd - 24) return;
      const wanted = Math.min(dist, Math.max(0, left - (window.innerWidth - width) / 2));
      const scrollable = outer.current.offsetHeight - window.innerHeight;
      window.scrollTo({ top: outer.current.getBoundingClientRect().top + window.scrollY + (wanted / dist) * scrollable });
    } else if (!pinned && strip.current) {
      card.scrollIntoView({ inline: "center", block: "nearest" });
    }
  };

  const slide = (dir: 1 | -1) => strip.current?.scrollBy({ left: dir * Math.min(strip.current.clientWidth * 0.8, 420), behavior: "smooth" });
  const onStripScroll = () => {
    const s = strip.current;
    if (s && bar.current) bar.current.style.transform = `scaleX(${(s.scrollWidth > s.clientWidth ? s.scrollLeft / (s.scrollWidth - s.clientWidth) : 1).toFixed(4)})`;
  };

  if (pinned) {
    return (
      <div ref={outer} role="region" aria-label={label} onFocusCapture={onFocus} style={{ height: `calc(100dvh + ${dist}px)` }} className="relative">
        <div className="sticky top-16 flex h-[calc(100dvh-4rem)] flex-col justify-center overflow-clip">
          <div ref={track} className="flex w-max items-stretch gap-8 px-[max(2rem,calc((100vw-80rem)/2))] will-change-transform">{children}</div>
          <div aria-hidden className="mx-[max(2rem,calc((100vw-80rem)/2))] mt-8 h-1 bg-line"><span ref={bar} className="block h-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} /></div>
        </div>
      </div>
    );
  }
  return (
    <div role="region" aria-label={label} onFocusCapture={onFocus}>
      <div ref={strip} tabIndex={0} onScroll={onStripScroll} className="flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-4 [scrollbar-width:thin]">{children}</div>
      <div className="mt-3 flex items-center gap-3">
        <button type="button" className="chip tap" onClick={() => slide(-1)}>← {prev}</button>
        <button type="button" className="chip tap" onClick={() => slide(1)}>{next} →</button>
        <div aria-hidden className="h-1 flex-1 bg-line"><span ref={bar} className="block h-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} /></div>
      </div>
    </div>
  );
}
