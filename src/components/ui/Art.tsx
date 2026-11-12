import { useId } from "react";

/**
 * Original illustrations drawn for this site (no existing franchise's characters or art).
 * All are decorative by default (aria-hidden); pass `title` to expose one as an image.
 */
type Common = { className?: string; title?: string };
const a11y = (title?: string) => (title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const });

const INK = "#1a1c24";
const HAIR = "#2f2a5e";
const SKIN = "#ffe1cf";
const LIME = "#d7141f"; // hoodie (kept as LIME for diff-size; now the brand red)
const PINK = "#f4f4f0"; // headset cups / torii: white
const BLUSH = "#ff7eb6";

export type Mood = "happy" | "wave" | "think" | "sleepy";

/** "Mochi": an original chibi mascot with a headset and a lime hoodie. */
export function Mascot({ mood = "happy", className, title }: Common & { mood?: Mood }) {
  const id = useId().replace(/:/g, "");
  const eye = (cx: number) => (
    <g>
      <ellipse cx={cx} cy={118} rx={14} ry={19} fill={`url(#iris-${id})`} stroke={INK} strokeWidth={2} />
      <ellipse cx={cx} cy={120} rx={7} ry={11.5} fill={INK} />
      <circle cx={cx - 4.5} cy={111} r={5.5} fill="#fff" />
      <circle cx={cx + 5} cy={127} r={2.6} fill="#fff" />
      <path d={`M${cx - 18} 106 Q${cx} 90 ${cx + 18} 106`} stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none" />
    </g>
  );
  const closed = (cx: number, up: boolean) => (
    <path d={up ? `M${cx - 16} 122 Q${cx} 102 ${cx + 16} 122` : `M${cx - 16} 112 Q${cx} 128 ${cx + 16} 112`} stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none" />
  );
  const eyes = mood === "wave" ? (<>{closed(88, true)}{closed(152, true)}</>) : mood === "sleepy" ? (<>{closed(88, false)}{closed(152, false)}</>) : (<>{eye(88)}{eye(152)}</>);
  const mouth =
    mood === "wave" ? (
      <g><path d="M106 144 Q120 172 134 144 Z" fill="#6b2336" stroke={INK} strokeWidth={3} strokeLinejoin="round" /><ellipse cx={120} cy={158} rx={8} ry={5} fill="#ff8fb0" /></g>
    ) : mood === "think" ? (
      <ellipse cx={120} cy={152} rx={5} ry={6} fill="#6b2336" stroke={INK} strokeWidth={3} />
    ) : mood === "sleepy" ? (
      <path d="M110 150 Q120 154 130 150" stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none" />
    ) : (
      <path d="M107 146 Q120 160 133 146" stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none" />
    );
  // the raised arm only for "wave"; "think" rests a hand near the chin
  const arm =
    mood === "wave" ? (
      <g>
        <path d="M162 210 C186 208 200 190 197 158" stroke={INK} strokeWidth={22} strokeLinecap="round" fill="none" />
        <path d="M162 210 C186 208 200 190 197 158" stroke={LIME} strokeWidth={16} strokeLinecap="round" fill="none" />
        <circle cx={197} cy={150} r={11} fill={SKIN} stroke={INK} strokeWidth={3} />
      </g>
    ) : mood === "think" ? (
      <g>
        <path d="M162 212 C182 214 184 190 150 170" stroke={INK} strokeWidth={22} strokeLinecap="round" fill="none" />
        <path d="M162 212 C182 214 184 190 150 170" stroke={LIME} strokeWidth={16} strokeLinecap="round" fill="none" />
        <circle cx={146} cy={166} r={10} fill={SKIN} stroke={INK} strokeWidth={3} />
      </g>
    ) : (
      <g>
        <path d="M162 210 C178 224 182 240 178 256" stroke={INK} strokeWidth={22} strokeLinecap="round" fill="none" />
        <path d="M162 210 C178 224 182 240 178 256" stroke={LIME} strokeWidth={16} strokeLinecap="round" fill="none" />
        <circle cx={178} cy={258} r={10} fill={SKIN} stroke={INK} strokeWidth={3} />
      </g>
    );
  return (
    <svg viewBox="0 0 240 280" className={className} {...a11y(title)} focusable="false">
      <defs>
        <linearGradient id={`iris-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a8fc9" /><stop offset="1" stopColor="#9be8ff" /></linearGradient>
        <filter id={`sticker-${id}`} x="-8%" y="-8%" width="116%" height="116%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="d" />
          <feFlood floodColor="#ffffff" result="w" />
          <feComposite in="w" in2="d" operator="in" result="o" />
          <feMerge><feMergeNode in="o" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g filter={`url(#sticker-${id})`} strokeLinejoin="round">
        {/* back hair */}
        <path d="M52 118 C44 52 86 28 120 28 C154 28 196 52 188 118 C192 150 186 182 176 198 L64 198 C54 182 48 150 52 118 Z" fill={HAIR} stroke={INK} strokeWidth={3} />
        {/* body: hoodie */}
        <path d="M74 266 C70 216 86 178 120 178 C154 178 170 216 166 266 Z" fill={LIME} stroke={INK} strokeWidth={3} />
        <path d="M92 180 Q120 198 148 180" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M108 190 L106 214 M132 190 L134 214" stroke={INK} strokeWidth={3} strokeLinecap="round" />
        <path d="M104 234 L94 242 L104 250 M124 230 L116 254 M134 234 L144 242 L134 250" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        {/* resting arm (viewer-left) */}
        <path d="M76 212 C62 224 58 242 62 256" stroke={INK} strokeWidth={22} strokeLinecap="round" fill="none" />
        <path d="M76 212 C62 224 58 242 62 256" stroke={LIME} strokeWidth={16} strokeLinecap="round" fill="none" />
        <circle cx={62} cy={258} r={10} fill={SKIN} stroke={INK} strokeWidth={3} />
        {arm}
        {/* head */}
        <ellipse cx={120} cy={112} rx={66} ry={60} fill={SKIN} stroke={INK} strokeWidth={3} />
        <ellipse cx={72} cy={136} rx={11} ry={6} fill={BLUSH} opacity={0.6} />
        <ellipse cx={168} cy={136} rx={11} ry={6} fill={BLUSH} opacity={0.6} />
        {eyes}
        <path d="M72 94 Q88 87 104 93" stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <path d={mood === "think" ? "M136 88 Q152 80 168 90" : "M136 93 Q152 87 168 94"} stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <path d="M119 134 l2 4" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
        {mouth}
        {/* bangs + ahoge */}
        <path d="M54 108 C50 56 88 34 120 34 C152 34 190 56 186 108 C178 92 166 80 154 74 C150 90 140 100 128 104 C124 92 114 84 102 80 C96 94 82 102 66 106 C62 108 58 110 54 108 Z" fill={HAIR} stroke={INK} strokeWidth={3} />
        <path d="M116 38 C106 14 130 2 144 10 C128 14 128 28 128 40 Z" fill={HAIR} stroke={INK} strokeWidth={3} />
        <path d="M72 64 Q92 48 114 52" stroke="#ff4d57" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.9} />
        {/* headset */}
        <path d="M48 112 C44 26 196 26 192 112" stroke={INK} strokeWidth={12} strokeLinecap="round" fill="none" />
        <path d="M48 112 C44 26 196 26 192 112" stroke="#4a5068" strokeWidth={6} strokeLinecap="round" fill="none" />
        <rect x={34} y={100} width={22} height={42} rx={10} fill={PINK} stroke={INK} strokeWidth={3} />
        <rect x={184} y={100} width={22} height={42} rx={10} fill={PINK} stroke={INK} strokeWidth={3} />
        <path d="M42 140 C42 164 64 170 88 162" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
        <circle cx={92} cy={162} r={5} fill={INK} />
        {/* sakura hairpin */}
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={i} cx={158} cy={52} rx={5} ry={8} fill={BLUSH} stroke={INK} strokeWidth={1.5} transform={`rotate(${i * 72} 158 60)`} />
          ))}
          <circle cx={158} cy={60} r={3} fill="#ffe066" stroke={INK} strokeWidth={1} />
        </g>
        {mood === "think" && <path d="M188 82 C194 94 200 98 194 106 C188 110 182 104 184 98 C186 92 186 88 188 82Z" fill="#9be8ff" stroke={INK} strokeWidth={2} />}
        {mood === "sleepy" && <text x={190} y={60} fontSize={30} fontWeight={700} fill={INK} fontFamily="sans-serif">z</text>}
      </g>
    </svg>
  );
}

/** "Kuro": an original black cat companion with a bell collar. */
export function Neko({ className, title }: Common) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 110" className={className} {...a11y(title)} focusable="false">
      <defs>
        <filter id={`st-${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="d" />
          <feFlood floodColor="#ffffff" result="w" />
          <feComposite in="w" in2="d" operator="in" result="o" />
          <feMerge><feMergeNode in="o" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g filter={`url(#st-${id})`} strokeLinejoin="round" strokeLinecap="round">
        <path d="M24 50 L20 10 L52 32 Z" fill="#23252e" stroke={INK} strokeWidth={3} />
        <path d="M96 50 L100 10 L68 32 Z" fill="#23252e" stroke={INK} strokeWidth={3} />
        <path d="M27 40 L25 20 L40 31 Z" fill="#d7141f" />
        <path d="M93 40 L95 20 L80 31 Z" fill="#d7141f" />
        <ellipse cx={60} cy={62} rx={42} ry={34} fill="#2b2e3a" stroke={INK} strokeWidth={3} />
        <ellipse cx={43} cy={60} rx={8} ry={10} fill="#ffe066" stroke={INK} strokeWidth={2} />
        <ellipse cx={77} cy={60} rx={8} ry={10} fill="#ffe066" stroke={INK} strokeWidth={2} />
        <ellipse cx={43} cy={61} rx={2.6} ry={8} fill={INK} />
        <ellipse cx={77} cy={61} rx={2.6} ry={8} fill={INK} />
        <circle cx={40} cy={56} r={2.4} fill="#fff" />
        <circle cx={74} cy={56} r={2.4} fill="#fff" />
        <path d="M56 73 L64 73 L60 78 Z" fill="#d7141f" stroke={INK} strokeWidth={1.5} />
        <path d="M60 78 Q60 86 52 84 M60 78 Q60 86 68 84" stroke="#f2f3f5" strokeWidth={2.2} fill="none" />
        <path d="M16 70 L36 74 M16 80 L36 78 M104 70 L84 74 M104 80 L84 78" stroke="#f2f3f5" strokeWidth={1.8} />
        <path d="M30 92 Q60 108 90 92" stroke="#d7141f" strokeWidth={7} fill="none" />
        <circle cx={60} cy={102} r={7} fill="#ffd23f" stroke={INK} strokeWidth={2} />
        <path d="M60 98 L60 106" stroke={INK} strokeWidth={1.6} />
      </g>
    </svg>
  );
}

/** A flat Mt. Fuji and sun, used as a quiet divider. Colours come from the theme tokens. */
export function FujiScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 200" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden focusable="false">
      <circle cx={860} cy={104} r={54} style={{ fill: "var(--sakura)" }} opacity={0.9} />
      <g opacity={0.14} style={{ fill: "var(--fg)" }}>
        <ellipse cx={220} cy={60} rx={70} ry={14} /><ellipse cx={270} cy={48} rx={46} ry={12} /><ellipse cx={1010} cy={46} rx={64} ry={13} />
      </g>
      <path d="M300 200 L520 62 L560 62 L790 200 Z" style={{ fill: "var(--surface-2)", stroke: "var(--outline)" }} strokeWidth={3} strokeLinejoin="round" />
      <path d="M489 84 L520 62 L560 62 L590 86 L568 78 L548 94 L530 76 L510 94 Z" fill="#fff" stroke="var(--outline)" strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M0 200 C150 156 280 176 420 190 C600 150 800 176 1000 166 C1100 162 1160 176 1200 186 L1200 200 Z" style={{ fill: "var(--surface)", stroke: "var(--outline)" }} strokeWidth={3} />
    </svg>
  );
}

/** A small torii gate. */
export function Torii({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 140" className={className} aria-hidden focusable="false" strokeLinejoin="round">
      <rect x={30} y={50} width={12} height={84} fill="#d7141f" stroke={INK} strokeWidth={3} />
      <rect x={118} y={50} width={12} height={84} fill="#d7141f" stroke={INK} strokeWidth={3} />
      <rect x={22} y={68} width={116} height={9} fill="#d7141f" stroke={INK} strokeWidth={3} />
      <path d="M6 38 Q80 18 154 38 L148 54 Q80 40 12 54 Z" fill={INK} stroke={INK} strokeWidth={3} />
      <path d="M16 36 Q80 20 144 36" stroke="#ff4d57" strokeWidth={3} fill="none" />
    </svg>
  );
}
