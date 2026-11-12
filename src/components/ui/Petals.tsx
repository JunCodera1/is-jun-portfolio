/** A few sakura petals drifting down the hero. Decorative: aria-hidden, CSS-only, hidden under prefers-reduced-motion. */
const PETALS = [
  { x: "6%", s: "14px", d: "17s", delay: "-3s" }, { x: "17%", s: "10px", d: "22s", delay: "-11s" },
  { x: "29%", s: "16px", d: "19s", delay: "-7s" }, { x: "44%", s: "9px", d: "24s", delay: "-15s" },
  { x: "58%", s: "13px", d: "18s", delay: "-1s" }, { x: "71%", s: "11px", d: "21s", delay: "-9s" },
  { x: "83%", s: "15px", d: "20s", delay: "-13s" }, { x: "93%", s: "10px", d: "25s", delay: "-5s" },
];

export function Petals() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {PETALS.map((p, i) => (
        <span key={i} className="petal" style={{ "--x": p.x, "--s": p.s, "--d": p.d, "--delay": p.delay } as React.CSSProperties} />
      ))}
    </div>
  );
}
