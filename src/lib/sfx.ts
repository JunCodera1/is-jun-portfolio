"use client";

/** Tiny synthesized sound effects (Web Audio). No files, no autoplay: only runs after a user gesture AND when the visitor turned sound on. */
export type Sfx = "tick" | "select" | "back" | "success" | "fail" | "whoosh";
let ctx: AudioContext | null = null;

function tone(c: AudioContext, t0: number, freq: number, dur: number, type: OscillatorType, vol: number, to?: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export function playSfx(name: Sfx): void {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    switch (name) {
      case "tick": tone(ctx, t, 1100, 0.04, "square", 0.025); break;
      case "select": tone(ctx, t, 660, 0.07, "square", 0.04, 990); break;
      case "back": tone(ctx, t, 520, 0.09, "square", 0.035, 330); break;
      case "whoosh": tone(ctx, t, 180, 0.16, "sawtooth", 0.03, 900); break;
      case "success": [660, 880, 1320].forEach((f, i) => tone(ctx!, t + i * 0.08, f, 0.12, "square", 0.04)); break;
      case "fail": tone(ctx, t, 220, 0.2, "sawtooth", 0.04, 110); break;
    }
  } catch { /* audio is a nicety, never a dependency */ }
}
