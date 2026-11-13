"use client";
import { animate, spring, stagger } from "animejs";

export { animate, spring, stagger };

/** True when the visitor asked for less motion. Every anime.js call in this project goes through this check first. */
export const reducedMotion = (): boolean => typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Staggered entrance for a list of elements. Transform-only on purpose (no opacity), so content is always readable
 * and contrast/accessibility checks never see half-transparent text. Total duration is capped for long lists.
 */
export function staggerIn(targets: Element[], opts: { from?: number; step?: number } = {}) {
  if (reducedMotion() || targets.length === 0) return null;
  const step = Math.min(opts.step ?? 40, 480 / targets.length);
  return animate(targets, { translateY: [opts.from ?? 16, 0], duration: 560, delay: stagger(step), ease: "outQuart" });
}

/** A quick scale pop (correct answer, new selection). */
export function pop(el: Element | null | undefined, to = 1.07) {
  if (!el || reducedMotion()) return null;
  return animate(el, { scale: [1, to, 1], duration: 420, ease: "outQuad" });
}
/** A short sideways shake (wrong answer). */
export function shake(el: Element | null | undefined) {
  if (!el || reducedMotion()) return null;
  return animate(el, { translateX: [0, -9, 9, -6, 6, 0], duration: 380, ease: "outQuad" });
}
/** An element rises into place with a springy settle. */
export function riseIn(targets: Element | Element[] | NodeListOf<Element>, opts: { from?: number; delay?: number; step?: number } = {}) {
  if (reducedMotion()) return null;
  return animate(targets as Element[], { translateY: [opts.from ?? 30, 0], duration: 800, delay: stagger(opts.step ?? 70, { start: opts.delay ?? 0 }), ease: spring({ stiffness: 150, damping: 13 }) });
}
