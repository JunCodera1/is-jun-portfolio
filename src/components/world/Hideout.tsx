"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { applyTheme } from "@/lib/theme";
import { Stagger } from "@/components/motion/Stagger";
import { pop, riseIn } from "@/lib/motion";
import { HideoutArt } from "./HideoutArt";
import { Panel } from "./Panel";
import { WorldLink } from "./WorldLink";
import { useWorld } from "./WorldProvider";

export type ObjectId = "computer" | "bookshelf" | "notebook" | "calendar" | "window" | "board";
const OBJECTS: { id: ObjectId; x: number; y: number; w: number; h: number }[] = [
  { id: "computer", x: 38.1, y: 43.3, w: 20.6, h: 21.1 },
  { id: "bookshelf", x: 3.75, y: 13.3, w: 18.75, h: 57.8 },
  { id: "notebook", x: 61.2, y: 54.4, w: 11.25, h: 10 },
  { id: "calendar", x: 81.25, y: 40, w: 13.1, h: 25.6 },
  { id: "window", x: 53.75, y: 10, w: 23.75, h: 33.3 },
  { id: "board", x: 81.25, y: 12.2, w: 14.4, h: 24.4 },
];

export interface HideoutData {
  projects: { slug: string; name: string; kinds: string }[];
  notes: { href: string; title: string; date: string; kind: string }[];
  milestones: { label: string; source: "owner" | "github"; date?: string }[];
  board: { label: string; note: string }[];
  shelves: { id: string; title: string }[];
}

const themeNow = () => (document.documentElement.dataset.theme === "light" ? "day" : "night");
const subTheme = (cb: () => void) => { const mo = new MutationObserver(cb); mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] }); return () => mo.disconnect(); };

export function Hideout({ data }: { data: HideoutData }) {
  const t = useTranslations("hideout");
  const tp = useTranslations("places");
  const locale = useLocale();
  const { discover, sfx } = useWorld();
  const [open, setOpen] = useState<ObjectId | null>(null);
  const [hot, setHot] = useState<ObjectId | null>(null);
  const [seen, setSeen] = useState<ObjectId[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const phase = useSyncExternalStore(subTheme, themeNow, () => "night");
  const clock = useSyncExternalStore((cb) => { const id = setInterval(cb, 20_000); return () => clearInterval(id); }, () => Math.floor(Date.now() / 20_000), () => 0);

  // plates rise one by one when the room appears; the hovered one pops
  useEffect(() => {
    const a = riseIn([...document.querySelectorAll(".hotspot .plate")], { from: 24, delay: 150, step: 90 });
    return () => { a?.revert(); };
  }, []);
  useEffect(() => {
    if (!hot) return;
    const i = OBJECTS.findIndex((o) => o.id === hot);
    pop(document.querySelectorAll(".hotspot .plate")[i], 1.1);
  }, [hot]);

  const openObj = (id: ObjectId) => {
    sfx("select");
    setOpen(id);
    const next = seen.includes(id) ? seen : [...seen, id];
    setSeen(next);
    if (next.length === OBJECTS.length) discover("objects");
  };

  return (
    <div>
      <div className="overflow-x-auto overscroll-x-contain">
        <div className="relative mx-auto aspect-[16/9] bg-bg" style={{ width: "max(960px, min(100%, calc((100dvh - 9rem) * 1.7778)))" }}>
          <HideoutArt hot={hot} />
          {OBJECTS.map((o) => (
            <button
              key={o.id}
              type="button"
              className="hotspot"
              style={{ left: `${o.x}%`, top: `${o.y}%`, width: `${o.w}%`, height: `${o.h}%` }}
              onMouseEnter={() => { setHot(o.id); sfx("tick"); }} onMouseLeave={() => setHot(null)}
              onFocus={() => setHot(o.id)} onBlur={() => setHot(null)}
              onClick={() => openObj(o.id)}
              aria-haspopup="dialog"
            >
              <span className="plate !text-sm" data-seen={seen.includes(o.id) ? "" : undefined}>{t(`objects.${o.id}.label`)}</span>
            </button>
          ))}
          <button type="button" className="absolute grid min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 place-items-center opacity-0 outline-offset-2 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-accent-fg" style={{ left: "47.5%", top: "93%" }} aria-label={t("card.label")} onClick={() => { sfx("select"); discover("card"); setNote(t("card.text")); }}>
            <span aria-hidden className="qmark" />
          </button>
          <button type="button" className="absolute grid min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 place-items-center opacity-0 outline-offset-2 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-accent-fg" style={{ left: "78%", top: "89%" }} aria-label={t("cat.label")} onClick={() => { sfx("select"); setNote(t("cat.text")); }}>
            <span aria-hidden className="qmark" />
          </button>
          <div className="pointer-events-none absolute bottom-3 left-3 right-3" aria-live="polite">
            <p className="plate !whitespace-normal !text-sm">{hot ? t(`objects.${hot}.hint`) : (note ?? t("hint"))}</p>
          </div>
        </div>
      </div>

      <Stagger as="ul" className="page mt-6 flex flex-wrap gap-3" aria-label={t("list")}>
        {OBJECTS.map((o) => <li key={o.id} data-stagger><button type="button" className="chip tap" onClick={() => openObj(o.id)}>{t(`objects.${o.id}.label`)}</button></li>)}
      </Stagger>

      <Panel open={open === "computer"} onClose={() => setOpen(null)} title={t("objects.computer.title")}>
        <p className="text-fg-2">{t("objects.computer.body")}</p>
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {data.projects.map((p) => (
            <li key={p.slug}><Link href={`/projects/${p.slug}`} className="index-row flex items-baseline justify-between gap-4 px-2 py-3"><span className="stage-title text-2xl">{p.name}</span><span className="label">{p.kinds}</span></Link></li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3"><WorldLink href="/lab" className="btn btn-primary">{t("objects.computer.cta")}</WorldLink><Link href="/terminal" className="btn">{t("objects.computer.terminal")}</Link></div>
      </Panel>

      <Panel open={open === "bookshelf"} onClose={() => setOpen(null)} title={t("objects.bookshelf.title")}>
        <p className="text-fg-2">{t("objects.bookshelf.body")}</p>
        <ul className="mt-5 flex flex-wrap gap-2">{data.shelves.map((s) => <li key={s.id} className="chip">{s.title}</li>)}</ul>
        <div className="mt-6 flex flex-wrap gap-3"><WorldLink href="/archive" className="btn btn-primary">{tp("archive.name")}</WorldLink><Link href="/interests" className="btn">{t("objects.bookshelf.interests")}</Link></div>
      </Panel>

      <Panel open={open === "notebook"} onClose={() => setOpen(null)} title={t("objects.notebook.title")}>
        <p className="text-fg-2">{t("objects.notebook.body")}</p>
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {data.notes.map((n) => (
            <li key={n.href}><Link href={n.href} className="index-row block px-2 py-3"><span className="label">{n.kind} · {n.date}</span><span className="stage-title block text-2xl">{n.title}</span></Link></li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3"><Link href="/journal" className="btn btn-primary">{t("objects.notebook.journal")}</Link><Link href="/garden" className="btn">{t("objects.notebook.garden")}</Link></div>
      </Panel>

      <Panel open={open === "calendar"} onClose={() => setOpen(null)} title={t("objects.calendar.title")}>
        <p className="text-fg-2">{t("objects.calendar.body")}</p>
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {data.milestones.map((m, i) => (
            <li key={i} className="flex items-baseline justify-between gap-4 py-3"><span className="font-display text-xl">{m.label}</span><span className="label">{m.date ?? t("objects.calendar.noDate")} · {m.source === "owner" ? t("objects.calendar.owner") : t("objects.calendar.github")}</span></li>
          ))}
        </ul>
        <div className="mt-6"><Link href="/timeline" className="btn">{t("objects.calendar.timeline")}</Link></div>
      </Panel>

      <Panel open={open === "window"} onClose={() => setOpen(null)} title={t("objects.window.title")}>
        <p className="text-lg">{t("objects.window.now", { phase: t(`objects.window.${phase}`) })}</p>
        <p className="label mt-1 tabular-nums" key={clock}>{new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", weekday: "long" }).format(new Date())}</p>
        <div className="mt-5 flex gap-3">
          <button type="button" className="btn" aria-pressed={phase === "day"} onClick={() => applyTheme("light")}>{t("objects.window.day")}</button>
          <button type="button" className="btn" aria-pressed={phase === "night"} onClick={() => applyTheme("dark")}>{t("objects.window.night")}</button>
        </div>
        <p className="mt-4 text-sm text-fg-2">{t("objects.window.body")}</p>
      </Panel>

      <Panel open={open === "board"} onClose={() => setOpen(null)} title={t("objects.board.title")}>
        <p className="text-fg-2">{t("objects.board.body")}</p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {data.board.map((b) => (
            <li key={b.label} className="border-2 border-outline bg-surface-2 p-4 shadow-[4px_4px_0_var(--accent)]"><p className="stage-title text-2xl">{b.label}</p><p className="mt-1 text-sm text-fg-2">{b.note}</p></li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
