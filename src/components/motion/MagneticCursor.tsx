"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const FINE = "(hover: hover) and (pointer: fine)";
const REDUCED = "(prefers-reduced-motion: reduce)";
const INTERACTIVE = 'a[href], button, [role="button"], [role="tab"], [role="radio"], [role="option"], summary, select, label[for], .hotspot';
const TEXTY = 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]), textarea, [contenteditable="true"]';
const MEDIA = 'img, [data-cursor="media"]';
const PULL = ".btn, .chip";

function subscribe(cb: () => void) {
  const a = window.matchMedia(FINE), b = window.matchMedia(REDUCED);
  a.addEventListener("change", cb); b.addEventListener("change", cb);
  return () => { a.removeEventListener("change", cb); b.removeEventListener("change", cb); };
}
const enabled = () => window.matchMedia(FINE).matches && !window.matchMedia(REDUCED).matches;

/**
 * A ring that follows the pointer, and:
 *  - over buttons and links it morphs into a frame around the element and gently pulls the element toward the pointer (magnetic),
 *  - over text fields it becomes a thin bar, over images a larger ring.
 * It is additive: the real cursor stays visible, nothing is hidden, and it only exists for mouse-like pointers without reduced motion.
 */
export function MagneticCursor() {
  const on = useSyncExternalStore(subscribe, enabled, () => false);
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const r = ring.current, d = dot.current;
    if (!on || !r || !d) return;
    let mx = -100, my = -100;                      // pointer
    let x = -100, y = -100, w = 28, h = 28;        // ring (current)
    let target: HTMLElement | null = null;
    let mode: "idle" | "link" | "text" | "media" = "idle";
    let raf = 0, visible = false, pulled: HTMLElement | null = null;

    const setPull = (el: HTMLElement | null, dx = 0, dy = 0) => {
      if (pulled && pulled !== el) pulled.style.translate = "";
      pulled = el;
      if (el) el.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
    };

    const frame = () => {
      let tx = mx, ty = my, tw = 28, th = 28, radius = "999px";
      if (mode === "link" && target && target.isConnected) {
        const b = target.getBoundingClientRect();
        tx = b.left + b.width / 2; ty = b.top + b.height / 2; tw = b.width + 10; th = b.height + 10;
        const br = getComputedStyle(target).borderRadius;
        radius = br && br !== "0px" ? br : "3px";
      } else if (mode === "text") { tw = 3; th = 24; radius = "2px"; }
      else if (mode === "media") { tw = 64; th = 64; }
      const k = mode === "link" ? 0.28 : 0.22;
      x += (tx - x) * k; y += (ty - y) * k; w += (tw - w) * 0.25; h += (th - h) * 0.25;
      r.style.transform = `translate3d(${(x - w / 2).toFixed(1)}px, ${(y - h / 2).toFixed(1)}px, 0)`;
      r.style.width = `${w.toFixed(1)}px`; r.style.height = `${h.toFixed(1)}px`; r.style.borderRadius = radius;
      d.style.transform = `translate3d(${(mx - 3).toFixed(1)}px, ${(my - 3).toFixed(1)}px, 0)`;
      const settled = Math.abs(tx - x) < 0.3 && Math.abs(ty - y) < 0.3 && Math.abs(tw - w) < 0.3 && Math.abs(th - h) < 0.3;
      raf = settled && mode !== "link" ? 0 : requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      mx = e.clientX; my = e.clientY;
      if (!visible) { visible = true; x = mx; y = my; r.dataset.show = "1"; d.dataset.show = "1"; }
      const el = e.target instanceof Element ? e.target : null;
      const link = el?.closest<HTMLElement>(INTERACTIVE) ?? null;
      const next: typeof mode = el?.closest(TEXTY) ? "text" : link && !(link as HTMLButtonElement).disabled ? "link" : el?.closest(MEDIA) ? "media" : "idle";
      if (next !== mode || (next === "link" && link !== target)) {
        mode = next; target = next === "link" ? link : null;
        r.dataset.mode = mode;
        if (next !== "link") setPull(null);
      }
      if (mode === "link" && target?.matches(PULL)) {
        const b = target.getBoundingClientRect();
        const dx = Math.max(-8, Math.min(8, (mx - (b.left + b.width / 2)) * 0.18)), dy = Math.max(-6, Math.min(6, (my - (b.top + b.height / 2)) * 0.18));
        setPull(target, dx, dy);
      }
      kick();
    };
    const onLeave = () => { visible = false; delete r.dataset.show; delete d.dataset.show; setPull(null); };
    const onDown = () => { r.dataset.down = "1"; };
    const onUp = () => { delete r.dataset.down; };
    const onScroll = () => { if (mode === "link") kick(); };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("pointerdown", onDown); window.addEventListener("pointerup", onUp);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf); setPull(null);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("pointerdown", onDown); window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
    };
  }, [on]);

  if (!on) return null;
  return (<><div ref={ring} aria-hidden className="cursor-ring" data-mode="idle" /><div ref={dot} aria-hidden className="cursor-dot" /></>);
}
