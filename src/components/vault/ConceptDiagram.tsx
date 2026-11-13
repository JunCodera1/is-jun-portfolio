"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { INTERVALS, review, type CardState } from "@/lib/srs";
import { pop, shake } from "@/lib/motion";
import type { DiagramId } from "@/content/data/vault/concepts";

const INK = "#1a1c24", RED = "#d7141f", PAPER = "#f4f4f0", GOLD = "#ffd23f";
const S = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const text = { fill: "var(--fg)", fontFamily: "var(--font-mono), monospace", fontSize: 12 } as const;

function Arrow({ x1, y1, x2, y2, color = "var(--fg)" }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
  return (<g stroke={color} strokeWidth={3} strokeLinecap="round" fill="none"><path d={`M${x1} ${y1}L${x2} ${y2}`} /><path d={`M${x2 - h * Math.cos(a - 0.5)} ${y2 - h * Math.sin(a - 0.5)}L${x2} ${y2}L${x2 - h * Math.cos(a + 0.5)} ${y2 - h * Math.sin(a + 0.5)}`} /></g>);
}

/** Interactive: five boxes and one card. Uses the same review() the flashcards use. */
function Leitner() {
  const t = useTranslations("vault.diagram.leitner");
  const [card, setCard] = useState<CardState | undefined>(undefined);
  const [day, setDay] = useState(0);
  const box = card?.box ?? 1;
  const answer = (ok: boolean) => {
    const next = review(card ?? { box: 1, due: day, seen: 0 }, ok, day);
    setCard(next); setDay(next.due);
    const el = document.getElementById(`lt-box-${next.box}`);
    if (ok) pop(el, 1.12); else shake(el);
  };
  return (
    <div>
      <svg viewBox="0 0 520 150" role="img" aria-label={t("aria")} className="w-full">
        {[1, 2, 3, 4, 5].map((b, i) => (
          <g key={b} id={`lt-box-${b}`} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            <rect x={14 + i * 100} y={28} width={84} height={64} fill={box === b ? RED : PAPER} {...S} />
            <text x={56 + i * 100} y={55} textAnchor="middle" style={{ ...text, fill: box === b ? "#fff" : INK, fontSize: 15, fontWeight: 700 }}>{t("box", { n: b })}</text>
            <text x={56 + i * 100} y={76} textAnchor="middle" style={{ ...text, fill: box === b ? "#fff" : INK }}>{t("wait", { n: INTERVALS[b as 1] })}</text>
            {i < 4 && <Arrow x1={100 + i * 100} y1={60} x2={112 + i * 100} y2={60} />}
          </g>
        ))}
        <path d="M470 98 C470 140 56 140 56 100" fill="none" stroke={RED} strokeWidth={3} strokeDasharray="6 5" /><Arrow x1={56} y1={118} x2={56} y2={98} color={RED} />
        <text x={262} y={136} textAnchor="middle" style={{ ...text, fill: RED }}>{t("miss")}</text>
        <circle cx={56 + (box - 1) * 100} cy={14} r={7} fill={GOLD} {...S} strokeWidth={2} />
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" onClick={() => answer(true)}>{t("right")}</button>
        <button type="button" className="btn" onClick={() => answer(false)}>{t("wrong")}</button>
        <button type="button" className="chip tap" onClick={() => { setCard(undefined); setDay(0); }}>{t("reset")}</button>
      </div>
      <p className="label mt-3 !normal-case !tracking-normal" aria-live="polite">{card ? t("state", { box: card.box, wait: INTERVALS[card.box], due: card.due }) : t("start")}</p>
    </div>
  );
}

function Csp() {
  const t = useTranslations("vault.diagram.csp");
  const row = (y: number, ok: boolean, label: string) => (
    <g>
      <Arrow x1={176} y1={90} x2={250} y2={y + 20} color={ok ? "var(--fg)" : RED} />
      <rect x={256} y={y} width={230} height={40} fill={ok ? PAPER : "#ffd9db"} {...S} strokeDasharray={ok ? undefined : "7 5"} />
      <text x={268} y={y + 25} style={{ ...text, fill: INK }}>{label}</text>
      <text x={470} y={y + 26} textAnchor="end" style={{ ...text, fill: ok ? "#14803c" : RED, fontSize: 18, fontWeight: 700 }}>{ok ? "✓" : "✕"}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 520 190" role="img" aria-label={t("aria")} className="w-full">
      <rect x={20} y={55} width={156} height={70} fill={RED} {...S} /><text x={98} y={85} textAnchor="middle" style={{ ...text, fill: "#fff", fontSize: 14, fontWeight: 700 }}>{t("page")}</text><text x={98} y={105} textAnchor="middle" style={{ ...text, fill: "#fff" }}>{t("policy")}</text>
      {row(14, true, t("self"))}{row(74, true, t("allowed"))}{row(134, false, t("unknown"))}
    </svg>
  );
}

function Isr() {
  const t = useTranslations("vault.diagram.isr");
  const box = (x: number, label: string, sub: string, fill: string, fg = INK) => (<g><rect x={x} y={44} width={140} height={72} fill={fill} {...S} /><text x={x + 70} y={74} textAnchor="middle" style={{ ...text, fill: fg, fontSize: 14, fontWeight: 700 }}>{label}</text><text x={x + 70} y={96} textAnchor="middle" style={{ ...text, fill: fg }}>{sub}</text></g>);
  return (
    <svg viewBox="0 0 520 170" role="img" aria-label={t("aria")} className="w-full">
      {box(12, t("build"), t("buildSub"), PAPER)}{box(190, t("serve"), t("serveSub"), RED, "#fff")}{box(368, t("regen"), t("regenSub"), PAPER)}
      <Arrow x1={154} y1={80} x2={188} y2={80} /><Arrow x1={332} y1={80} x2={366} y2={80} />
      <path d="M438 122 C438 160 262 160 262 124" fill="none" stroke={RED} strokeWidth={3} strokeDasharray="6 5" /><Arrow x1={262} y1={138} x2={262} y2={122} color={RED} />
      <text x={350} y={158} textAnchor="middle" style={{ ...text, fill: RED }}>{t("loop")}</text>
    </svg>
  );
}

function Layout() {
  const t = useTranslations("vault.diagram.layout");
  const n = [[260, 40], [130, 110], [390, 110], [190, 170], [330, 170]] as const;
  const links = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]] as const;
  return (
    <svg viewBox="0 0 520 215" role="img" aria-label={t("aria")} className="w-full">
      {links.map(([a, b]) => (<line key={`${a}${b}`} x1={n[a][0]} y1={n[a][1]} x2={n[b][0]} y2={n[b][1]} stroke="var(--fg)" strokeWidth={3} />))}
      {links.map(([a, b]) => { const mx = (n[a][0] + n[b][0]) / 2, my = (n[a][1] + n[b][1]) / 2; return <circle key={`m${a}${b}`} cx={mx} cy={my} r={4} fill={RED} />; })}
      {n.map(([x, y], i) => (<g key={i}><circle cx={x} cy={y} r={16} fill={i === 0 ? RED : PAPER} {...S} />{[0, 1, 2, 3].map((k) => (<path key={k} d={`M${x + Math.cos(k * 1.57 + 0.78) * 22} ${y + Math.sin(k * 1.57 + 0.78) * 22}L${x + Math.cos(k * 1.57 + 0.78) * 32} ${y + Math.sin(k * 1.57 + 0.78) * 32}`} stroke={RED} strokeWidth={2.5} strokeLinecap="round" />))}</g>))}
      <rect x={14} y={176} width={14} height={4} fill={RED} /><text x={34} y={181} style={text}>{t("push")}</text>
      <rect x={14} y={194} width={14} height={4} fill="var(--fg)" /><text x={34} y={199} style={text}>{t("pull")}</text>
    </svg>
  );
}

export function ConceptDiagram({ id }: { id: DiagramId }) {
  return <div className="border-2 border-outline bg-surface p-4 shadow-[6px_6px_0_var(--accent)]">{id === "leitner" ? <Leitner /> : id === "csp" ? <Csp /> : id === "isr" ? <Isr /> : <Layout />}</div>;
}
