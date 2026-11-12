import { useId } from "react";

/** Deterministic pseudo-random so the skyline is identical on server and client. */
function rng(seed: number) {
  let s = (seed * 2654435761) >>> 0;
  const next = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  next(); next(); // discard the first outputs: small seeds correlate
  return next;
}

function Skyline({ seed, y, minH, maxH, wMin, wMax, fill, windows }: { seed: number; y: number; minH: number; maxH: number; wMin: number; wMax: number; fill: string; windows?: boolean }) {
  const r = rng(seed);
  const out: React.ReactNode[] = [];
  let x = -20;
  let i = 0;
  while (x < 1620) {
    const w = wMin + r() * (wMax - wMin);
    const h = minH + r() * (maxH - minH);
    out.push(<rect key={`b${i}`} x={x} y={y - h} width={w} height={h + 400} fill={fill} />);
    if (windows) {
      for (let wy = y - h + 14; wy < y - 10; wy += 22) for (let wx = x + 8; wx < x + w - 10; wx += 16) {
        if (r() > 0.62) out.push(<rect key={`w${i}-${wx}-${wy}`} x={wx} y={wy} width={6} height={9} style={{ fill: "var(--win)", opacity: "var(--win-o)" }} />);
      }
    }
    x += w + 2;
    i++;
  }
  return <g>{out}</g>;
}

const INK = "#0a0a0c";

/** The city, drawn as flat SVG in the world's red/black/white language. Colours switch with day/night via CSS variables. */
export function CityArt({ active }: { active: string | null }) {
  const id = useId().replace(/:/g, "");
  const a = (p: string) => (active === p ? "true" : undefined);
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="none" className="scene absolute inset-0 h-full w-full" aria-hidden focusable="false" strokeLinejoin="round">
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--sky-top)" }} /><stop offset="1" style={{ stopColor: "var(--sky-bot)" }} />
        </linearGradient>
        <pattern id={`dots-${id}`} width="11" height="11" patternUnits="userSpaceOnUse"><circle cx="5.5" cy="5.5" r="1.7" fill={INK} opacity="0.38" /></pattern>
      </defs>
      <rect width="1600" height="900" fill={`url(#sky-${id})`} />
      <g style={{ opacity: "var(--stars)" }}>
        {Array.from({ length: 40 }).map((_, i) => { const r = rng(i + 7); return <circle key={i} className="twinkle" cx={r() * 1600} cy={r() * 360} r={1 + r() * 1.6} fill="#fff" opacity={0.7} style={{ animationDelay: `${(i % 7) * 0.4}s` }} />; })}
      </g>
      <circle cx="1170" cy="250" r="170" style={{ fill: "var(--accent)" }} />
      <circle cx="1170" cy="250" r="170" fill={`url(#dots-${id})`} />
      <Skyline seed={3} y={640} minH={80} maxH={260} wMin={30} wMax={90} fill="var(--far)" />
      <Skyline seed={11} y={700} minH={60} maxH={200} wMin={40} wMax={110} fill="var(--mid)" windows />

      {/* ── Hideout ── */}
      <g data-active={a("hideout")} stroke={INK} strokeWidth="4">
        <rect x="130" y="570" width="200" height="190" style={{ fill: "var(--mid)" }} />
        <path d="M108 572 L230 470 L352 572 Z" style={{ fill: "var(--accent)" }} />
        <rect x="290" y="480" width="26" height="60" style={{ fill: "var(--near)" }} />
        <rect x="158" y="606" width="56" height="56" style={{ fill: "var(--win)" }} /><path d="M186 606 V662 M158 634 H214" strokeWidth="3" />
        <rect x="246" y="650" width="52" height="110" fill={INK} /><circle cx="286" cy="708" r="3" fill="#fff" />
        <rect x="196" y="516" width="50" height="34" fill={INK} /><circle cx="221" cy="533" r="8" style={{ fill: "var(--win)" }} />
        <path d="M130 760 H330" />
      </g>

      {/* ── Lab ── */}
      <g data-active={a("lab")} stroke={INK} strokeWidth="4">
        <rect x="440" y="400" width="200" height="360" style={{ fill: "var(--mid)" }} />
        <rect x="480" y="340" width="120" height="62" style={{ fill: "var(--near)" }} />
        <path d="M500 340 Q540 268 600 330" fill="none" stroke="#f4f4f0" strokeWidth="7" /><path d="M550 308 L550 340" strokeWidth="5" />
        <path d="M540 340 V252" strokeWidth="5" /><circle className="beacon" cx="540" cy="246" r="9" style={{ fill: "var(--accent)" }} stroke={INK} />
        {[0, 1, 2, 3, 4].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={462 + c * 62} y={424 + r * 62} width="38" height="38" style={{ fill: "var(--win)", opacity: (r * 3 + c) % 4 === 0 ? 0.25 : "var(--win-o)" as unknown as number }} />))}
        <rect x="602" y="560" width="26" height="200" style={{ fill: "var(--near)" }} />
        <rect x="440" y="740" width="200" height="22" style={{ fill: "var(--accent)" }} />
      </g>

      {/* ── Station ── */}
      <g data-active={a("station")} stroke={INK} strokeWidth="4">
        <rect x="700" y="630" width="310" height="130" style={{ fill: "var(--mid)" }} />
        <path d="M676 632 L855 566 L1034 632 Z" fill="#f4f4f0" />
        <circle cx="855" cy="604" r="30" fill="#fff" /><path d="M855 604 V584 M855 604 L870 612" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        {[0, 1, 2].map((i) => <path key={i} d={`M${738 + i * 96} 760 V690 Q${768 + i * 96} 654 ${798 + i * 96} 690 V760 Z`} fill={INK} />)}
        <rect x="700" y="640" width="310" height="14" style={{ fill: "var(--accent)" }} />
      </g>

      {/* ── Arcade ── */}
      <g data-active={a("arcade")} stroke={INK} strokeWidth="4">
        <rect x="1070" y="540" width="220" height="220" fill="#15151b" />
        <path d="M1050 540 H1310 L1296 574 H1064 Z" style={{ fill: "var(--accent)" }} />
        <path d="M1066 500 H1296 L1284 548 H1054 Z" style={{ fill: "var(--accent)" }} />
        <text x="1080" y="538" fontFamily="Anton, Impact, sans-serif" fontSize="44" fill="#fff" stroke="none" transform="skewX(-10)" textLength="190">ARCADE</text>
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${1092 + i * 100} 600)`}><rect width="80" height="110" fill="#0a0a0c" stroke="#f4f4f0" strokeWidth="3" /><rect x="10" y="12" width="60" height="46" fill="#f4f4f0" opacity="0.92" />
            {[[16, 18], [28, 18], [40, 18], [22, 30], [34, 30], [28, 42], [46, 42]].map(([x, y], k) => <rect key={k} x={x! + (i ? 6 : 0)} y={y} width="8" height="8" fill="#d7141f" stroke="none" />)}
            <circle cx="22" cy="86" r="8" fill="#d7141f" /><rect x="44" y="80" width="24" height="12" fill="#f4f4f0" /></g>
        ))}
      </g>

      {/* ── Archive ── */}
      <g data-active={a("archive")} stroke={INK} strokeWidth="4">
        <rect x="1360" y="400" width="160" height="360" style={{ fill: "var(--mid)" }} />
        <path d="M1346 402 H1534 L1440 326 Z" style={{ fill: "var(--near)" }} />
        <rect x="1430" y="296" width="8" height="34" fill={INK} /><path d="M1438 298 H1470 L1458 308 L1470 318 H1438" style={{ fill: "var(--accent)" }} />
        {[0, 1, 2].map((r) => [0, 1].map((c) => <path key={`${r}${c}`} d={`M${1386 + c * 66} ${480 + r * 78} v38 q20 -40 40 0 v-38 z`} style={{ fill: "var(--win)", opacity: "var(--win-o)" as unknown as number }} />))}
        <rect x="1400" y="700" width="80" height="60" fill={INK} />
        <rect x="1380" y="432" width="120" height="20" fill="#f4f4f0" /><path d="M1440 432 V452 M1400 440 H1426 M1454 440 H1480" stroke={INK} strokeWidth="3" />
      </g>

      {/* ── street, rails, train ── */}
      <rect y="760" width="1600" height="140" style={{ fill: "var(--near)" }} />
      <path d="M0 772 H1600" stroke="#f4f4f0" strokeWidth="3" opacity="0.5" strokeDasharray="30 22" />
      <path d="M0 818 H1600 M0 842 H1600" stroke="#f4f4f0" strokeWidth="4" opacity="0.8" />
      {Array.from({ length: 54 }).map((_, i) => <rect key={i} x={i * 30 - 6} y="812" width="10" height="36" fill={INK} opacity="0.55" />)}
      <g className="train" stroke={INK} strokeWidth="3">
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${i * 172} 770)`}><rect width="164" height="58" rx="6" style={{ fill: i === 0 ? "var(--accent)" : "#f4f4f0" }} />
            {[0, 1, 2].map((w) => <rect key={w} x={14 + w * 48} y="10" width="34" height="22" fill="#0a0a0c" />)}<rect y="40" width="164" height="8" fill="#0a0a0c" opacity="0.35" /></g>
        ))}
      </g>
      {[200, 560, 1000, 1400].map((x) => (
        <g key={x}><path d={`M${x} 760 V660`} stroke={INK} strokeWidth="6" /><circle cx={x} cy="654" r="12" style={{ fill: "var(--win)" }} stroke={INK} strokeWidth="3" /></g>
      ))}

      {/* ── secrets ── */}
      <g stroke={INK} strokeWidth="3">
        <path d="M596 372 q-4 -24 8 -28 l6 10 l10 -2 l6 -9 q12 6 6 30 z" fill="#111" /><circle cx="607" cy="358" r="2.4" fill="#ffe066" stroke="none" /><circle cx="619" cy="358" r="2.4" fill="#ffe066" stroke="none" />
        <rect x="64" y="690" width="62" height="74" rx="4" style={{ fill: "var(--accent)" }} /><rect x="74" y="700" width="42" height="34" fill="#f4f4f0" /><rect x="82" y="746" width="26" height="8" fill={INK} />
        <g transform="rotate(-14 985 790)"><rect x="962" y="766" width="46" height="64" rx="4" fill="#fff" /><text x="985" y="808" fontSize="34" textAnchor="middle" fill="#d7141f" stroke="none">♠</text></g>
      </g>
    </svg>
  );
}
