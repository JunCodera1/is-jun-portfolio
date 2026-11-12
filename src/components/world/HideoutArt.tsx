import { useId } from "react";

const INK = "#0a0a0c";
const BOOKS = ["#d7141f", "#f4f4f0", "#8e8e97", "#d7141f", "#2b2b33", "#f4f4f0", "#b3b3ba", "#d7141f", "#f4f4f0", "#4a4a54"];

/** The Hideout room as flat SVG. Colours follow the day/night variables, so the window and lamp light change with the theme. */
export function HideoutArt({ hot }: { hot: string | null }) {
  const id = useId().replace(/:/g, "");
  const on = (k: string) => (hot === k ? "true" : undefined);
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="none" className="scene absolute inset-0 h-full w-full" aria-hidden focusable="false" strokeLinejoin="round">
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" style={{ stopColor: "var(--sky-top)" }} /><stop offset="1" style={{ stopColor: "var(--sky-bot)" }} /></linearGradient>
        <pattern id={`dots-${id}`} width="11" height="11" patternUnits="userSpaceOnUse"><circle cx="5.5" cy="5.5" r="1.7" fill={INK} opacity="0.3" /></pattern>
        <clipPath id={`win-${id}`}><rect x="870" y="100" width="360" height="280" /></clipPath>
      </defs>
      {/* wall + floor */}
      <rect width="1600" height="900" style={{ fill: "var(--mid)" }} />
      <polygon points="0,0 760,0 420,640 0,640" style={{ fill: "var(--accent)" }} opacity="0.92" />
      <polygon points="0,0 760,0 420,640 0,640" fill={`url(#dots-${id})`} />
      <rect y="640" width="1600" height="260" style={{ fill: "var(--near)" }} />
      <path d="M0 640 H1600" stroke={INK} strokeWidth="6" />
      <ellipse cx="800" cy="790" rx="520" ry="70" style={{ fill: "var(--accent)" }} stroke={INK} strokeWidth="4" opacity="0.85" />

      {/* window */}
      <g data-active={on("window")} stroke={INK} strokeWidth="8">
        <rect x="870" y="100" width="360" height="280" fill={`url(#sky-${id})`} />
        <g clipPath={`url(#win-${id})`} stroke="none">
          <circle cx="1100" cy="190" r="62" style={{ fill: "var(--accent)" }} />
          <g style={{ opacity: "var(--stars)" }}>{[[900, 130], [960, 170], [1010, 120], [1180, 140], [1200, 230]].map(([x, y], i) => <circle key={i} className="twinkle" cx={x} cy={y} r="2.4" fill="#fff" />)}</g>
          <path d="M870 380 V320 H920 V280 H960 V330 H1010 V250 H1060 V320 H1110 V290 H1150 V340 H1230 V380 Z" style={{ fill: "var(--far)" }} />
        </g>
        <path d="M1050 100 V380 M870 240 H1230" fill="none" />
        <rect x="850" y="380" width="400" height="22" style={{ fill: "var(--near)" }} />
      </g>

      {/* bookshelf */}
      <g data-active={on("bookshelf")} stroke={INK} strokeWidth="5">
        <rect x="60" y="120" width="300" height="520" style={{ fill: "var(--near)" }} />
        {[0, 1, 2].map((row) => {
          const y0 = 140 + row * 170;
          let x = 76;
          return (
            <g key={row}>
              {BOOKS.map((c, i) => { const w = 18 + ((i * 7 + row * 5) % 4) * 6; const h = 100 + ((i * 13 + row * 11) % 5) * 10; const el = <rect key={i} x={x} y={y0 + 150 - h} width={w} height={h} fill={c} strokeWidth="3" />; x += w + 3; return el; })}
              <rect x="60" y={y0 + 150} width="300" height="16" style={{ fill: "var(--mid)" }} />
            </g>
          );
        })}
      </g>

      {/* poster */}
      <g stroke={INK} strokeWidth="5"><rect x="430" y="130" width="170" height="240" fill="#0a0a0c" /><circle cx="515" cy="236" r="52" style={{ fill: "var(--accent)" }} /><path d="M515 200 l11 24 26 3 -19 18 5 26 -23 -13 -23 13 5 -26 -19 -18 26 -3 z" fill="#fff" stroke="none" /><rect x="450" y="320" width="130" height="10" fill="#f4f4f0" stroke="none" /></g>

      {/* corkboard */}
      <g data-active={on("board")} stroke={INK} strokeWidth="5">
        <rect x="1300" y="110" width="230" height="220" fill="#d8c9b0" />
        {[[1320, 130, "#fff"], [1410, 138, "#f4f4f0"], [1330, 220, "#f4f4f0"], [1420, 232, "#fff"]].map(([x, y, c], i) => (
          <g key={i} transform={`rotate(${(i % 2 ? 4 : -4)} ${x} ${y})`}><rect x={x as number} y={y as number} width="86" height="74" fill={c as string} strokeWidth="3" /><path d={`M${(x as number) + 12} ${(y as number) + 24} h50 M${(x as number) + 12} ${(y as number) + 40} h60 M${(x as number) + 12} ${(y as number) + 56} h34`} stroke="#d7141f" strokeWidth="4" /><circle cx={(x as number) + 43} cy={(y as number) + 6} r="6" fill="#d7141f" strokeWidth="2" /></g>
        ))}
      </g>

      {/* calendar */}
      <g data-active={on("calendar")} stroke={INK} strokeWidth="5">
        <rect x="1300" y="370" width="210" height="230" fill="#fff" /><rect x="1300" y="370" width="210" height="52" style={{ fill: "var(--accent)" }} />
        {Array.from({ length: 5 }).map((_, r) => Array.from({ length: 7 }).map((_, c) => <rect key={`${r}${c}`} x={1312 + c * 27} y={434 + r * 30} width="20" height="22" fill="#f1f1ee" strokeWidth="2" />))}
        <circle cx="1415" cy="496" r="16" fill="none" stroke="#d7141f" strokeWidth="5" />
      </g>

      {/* desk + computer + notebook */}
      <g stroke={INK} strokeWidth="5">
        <rect x="430" y="590" width="780" height="30" style={{ fill: "var(--accent)" }} />
        <rect x="460" y="620" width="26" height="170" style={{ fill: "var(--near)" }} /><rect x="1150" y="620" width="26" height="170" style={{ fill: "var(--near)" }} />
        <g data-active={on("computer")}>
          <rect x="640" y="400" width="300" height="180" fill="#0a0a0c" /><rect x="656" y="416" width="268" height="140" fill="#f4f4f0" />
          <path d="M676 440 h120 M676 462 h170 M676 484 h90 M676 506 h140 M676 528 h60" stroke="#d7141f" strokeWidth="6" strokeLinecap="round" />
          <text x="840" y="540" fontFamily="monospace" fontSize="34" fontWeight="700" fill="#0a0a0c" stroke="none">{"</>"}</text>
          <rect x="770" y="580" width="40" height="14" fill="#0a0a0c" />
        </g>
        <rect x="640" y="570" width="300" height="20" fill="#2b2b33" />
        <g data-active={on("notebook")}><path d="M1000 576 L1080 560 L1160 576 V592 L1080 576 L1000 592 Z" fill="#fff" /><path d="M1080 560 V576" /><path d="M1016 578 L1070 566 M1090 566 L1146 578" stroke="#d7141f" strokeWidth="3" /></g>
        <path d="M500 590 L520 500 L560 470" fill="none" strokeWidth="7" /><path d="M540 470 H586 L576 500 H550 Z" style={{ fill: "var(--win)" }} />
      </g>

      {/* sleeping cat + hidden card */}
      <g stroke={INK} strokeWidth="4"><ellipse cx="1250" cy="800" rx="64" ry="34" fill="#2b2e3a" /><circle cx="1196" cy="790" r="28" fill="#2b2e3a" /><path d="M1176 770 l-4 -26 l22 14 z M1214 770 l4 -26 l-22 14 z" fill="#2b2e3a" /><path d="M1184 790 q8 5 16 0" fill="none" stroke="#ffe066" strokeWidth="3" /><path d="M1308 798 q40 -4 44 -34" fill="none" stroke="#2b2e3a" strokeWidth="10" /></g>
      <g transform="rotate(12 760 842)" stroke={INK} strokeWidth="3"><rect x="738" y="812" width="44" height="60" rx="4" fill="#fff" /><text x="760" y="852" fontSize="30" textAnchor="middle" fill="#d7141f" stroke="none">♠</text></g>
    </svg>
  );
}
