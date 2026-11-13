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
