/**
 * Spot illustrations drawn for this site: a small set of objects in one ink-and-red style (no existing franchise art).
 * Decorative: aria-hidden. Each is a self-contained SVG that scales with its container.
 */
const INK = "#1a1c24", RED = "#d7141f", PAPER = "#f4f4f0", GRAY = "#8b8d98", DARK = "#2b2e3a", GOLD = "#ffd23f";
const S = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round", strokeLinecap: "round" } as const;

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return <svg viewBox="0 0 200 160" className={className} aria-hidden focusable="false">{children}</svg>;
}

export type SpotId = "books" | "laptop" | "notebook" | "newspaper" | "plant" | "calendar" | "chain" | "envelope";

const ART: Record<SpotId, React.ReactNode> = {
  books: (
    <>
      <rect x={34} y={118} width={136} height={22} fill={RED} {...S} /><path d="M34 129h136" stroke={INK} strokeWidth={2} /><rect x={150} y={122} width={14} height={14} fill={PAPER} {...S} />
      <rect x={46} y={94} width={116} height={24} fill={PAPER} {...S} /><path d="M58 94v24M64 94v24" stroke={INK} strokeWidth={2} />
      <rect x={58} y={70} width={100} height={24} fill={DARK} {...S} /><path d="M70 82h40" stroke={GOLD} strokeWidth={3} />
      <path d="M112 70 112 36 132 24 152 36 152 70" fill="none" /><path d="M104 70 90 28l30-10 14 52Z" fill={RED} {...S} /><path d="M98 52l26-9" stroke={PAPER} strokeWidth={3} />
    </>
  ),
  laptop: (
    <>
      <rect x={44} y={28} width={112} height={78} rx={6} fill={DARK} {...S} /><rect x={54} y={38} width={92} height={58} fill={PAPER} {...S} strokeWidth={2} />
      <path d="M66 54l-8 8 8 8M134 54l8 8-8 8M110 48l-16 28" fill="none" stroke={RED} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 112h148l-12 22H38Z" fill={PAPER} {...S} /><path d="M80 122h40" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <circle cx={166} cy={34} r={10} fill={RED} {...S} /><path d="M166 29v10M161 34h10" stroke={PAPER} strokeWidth={2.5} strokeLinecap="round" />
    </>
  ),
  notebook: (
    <>
      <rect x={52} y={22} width={100} height={124} rx={4} fill={RED} {...S} transform="rotate(-4 100 84)" />
      <rect x={60} y={30} width={92} height={114} rx={3} fill={PAPER} {...S} />
      <path d="M74 56h64M74 72h64M74 88h46" stroke={GRAY} strokeWidth={3} strokeLinecap="round" /><path d="M74 104h30" stroke={RED} strokeWidth={4} strokeLinecap="round" />
      <path d="M60 40v16M60 70v16M60 100v16" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <path d="M150 112l20-52 10 4-20 52-12 6Z" fill={GOLD} {...S} /><path d="M158 118l-8 4 2-9Z" fill={INK} />
    </>
  ),
  newspaper: (
    <>
      <rect x={30} y={30} width={130} height={104} fill={PAPER} {...S} transform="rotate(3 95 82)" />
      <rect x={42} y={26} width={130} height={104} fill={PAPER} {...S} />
      <rect x={54} y={38} width={106} height={22} fill={INK} /><path d="M62 49h60" stroke={PAPER} strokeWidth={5} strokeLinecap="round" />
      <rect x={54} y={68} width={44} height={38} fill={RED} {...S} strokeWidth={2} /><path d="M104 72h56M104 84h56M104 96h40M54 114h106" stroke={GRAY} strokeWidth={3} strokeLinecap="round" />
      <circle cx={170} cy={124} r={14} fill={GOLD} {...S} /><path d="M165 124l4 4 7-8" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  plant: (
    <>
      <path d="M100 100C100 70 88 52 62 44 64 70 78 92 100 100Z" fill={RED} {...S} /><path d="M100 100C100 66 116 44 146 38 142 70 126 92 100 100Z" fill={PAPER} {...S} />
      <path d="M100 100C98 78 100 60 100 34 112 50 112 80 100 100Z" fill={DARK} {...S} /><path d="M100 100V42" stroke={GOLD} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M56 104h88l-10 38H66Z" fill={RED} {...S} /><path d="M52 98h96v10H52Z" fill={PAPER} {...S} /><path d="M80 118v14M100 118v14M120 118v14" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
    </>
  ),
  calendar: (
    <>
      <rect x={42} y={34} width={116} height={106} rx={6} fill={PAPER} {...S} /><path d="M42 40a6 6 0 0 1 6-6h104a6 6 0 0 1 6 6v26H42Z" fill={RED} {...S} />
      <path d="M72 22v22M128 22v22" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => (<rect key={k} x={54 + (k % 4) * 26} y={78 + Math.floor(k / 4) * 20} width={16} height={12} fill={k === 6 ? RED : "none"} stroke={INK} strokeWidth={2} />))}
      <path d="M120 112l8 8 14-16" fill="none" stroke={PAPER} strokeWidth={0} />
    </>
  ),
  chain: (
    <>
      <rect x={30} y={58} width={80} height={44} rx={22} fill="none" stroke={INK} strokeWidth={16} /><rect x={30} y={58} width={80} height={44} rx={22} fill="none" stroke={RED} strokeWidth={9} />
      <rect x={90} y={58} width={80} height={44} rx={22} fill="none" stroke={INK} strokeWidth={16} /><rect x={90} y={58} width={80} height={44} rx={22} fill="none" stroke={PAPER} strokeWidth={9} />
      <path d="M92 60a22 22 0 0 0-2 40" fill="none" stroke={INK} strokeWidth={16} /><path d="M92 62a20 20 0 0 0-1 36" fill="none" stroke={RED} strokeWidth={9} />
      <path d="M176 28l6 10 10 2-8 8 2 10-10-5-10 5 2-10-8-8 10-2Z" fill={GOLD} {...S} strokeWidth={2} />
    </>
  ),
  envelope: (
    <>
      <rect x={32} y={44} width={136} height={90} rx={5} fill={PAPER} {...S} /><path d="M32 52l68 50 68-50" fill="none" {...S} /><path d="M32 130l50-46M168 130l-50-46" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={100} cy={98} r={14} fill={RED} {...S} /><path d="M100 90c-5 0-6 6-3 9l3 3 3-3c3-3 2-9-3-9Z" fill={PAPER} />
      <path d="M152 24l14-6-4 14M164 40l16 2-8 12" fill="none" stroke={GOLD} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export function Spot({ id, className }: { id: SpotId; className?: string }) {
  return <Frame className={className}>{ART[id]}</Frame>;
}
