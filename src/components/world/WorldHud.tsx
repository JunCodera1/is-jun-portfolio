"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { DISCOVERIES } from "@/content/data/world";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeControl } from "@/components/layout/ThemeControl";
import { Panel } from "./Panel";
import { WorldLink } from "./WorldLink";
import { useWorld } from "./WorldProvider";

/** Heads-up display: way back to the map, language, day/night, sound, exploration tracker, plain-site escape hatch. */
export function WorldHud() {
  const t = useTranslations("hud");
  const td = useTranslations("discoveries");
  const pathname = usePathname();
  const { discovered, soundOn, toggleSound, go, sfx } = useWorld();
  const [open, setOpen] = useState(false);
  const onEntrance = pathname === "/";
  const onCity = pathname === "/city";
  const found = DISCOVERIES.filter((d) => discovered.includes(d)).length;

  // "M" = back to the map (never while typing, never with modifiers)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.key.toLowerCase() !== "m" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (!onCity && !onEntrance) { sfx("back"); go("/city"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCity, onEntrance, go, sfx]);

  if (onEntrance) return null;
  const btn = "tap inline-flex h-9 items-center gap-2 border-2 border-white/70 bg-[#0a0a0c] px-3 font-mono text-[0.72rem] font-bold uppercase tracking-wider text-white transition-colors hover:border-white hover:bg-accent";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-black/80 to-transparent px-3 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          {!onCity && <WorldLink href="/city" className={btn}><span aria-hidden>◀</span>{t("map")}<kbd aria-hidden className="hidden rounded-sm border border-white/40 px-1 text-[0.6rem] sm:inline">M</kbd></WorldLink>}
          {onCity && <span className="plate">{t("you")}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="border-2 border-white/70 bg-[#0a0a0c] text-white [&_a]:!text-white/70 [&_a[aria-current=true]]:!text-white"><LanguageSwitcher /></div>
          <ThemeControl className="!border-white/70 bg-[#0a0a0c]" />
          <button type="button" className={btn} aria-pressed={soundOn} onClick={toggleSound}>{soundOn ? "♪" : "♪̸"} <span className="hidden sm:inline">{t("sound")}: {soundOn ? t("on") : t("off")}</span><span className="sm:hidden">{soundOn ? t("on") : t("off")}</span></button>
          <button type="button" className={btn} onClick={() => { sfx("select"); setOpen(true); }}>★ {found}/{DISCOVERIES.length}<span className="sr-only"> {t("discoveries")}</span></button>
          <Link href="/classic" className={`${btn} hidden md:inline-flex`}>{t("classic")}</Link>
        </div>
      </div>

      <Panel open={open} onClose={() => setOpen(false)} title={t("discoveries")}>
        <p className="text-fg-2">{td("note")}</p>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {DISCOVERIES.map((d) => {
            const ok = discovered.includes(d);
            return (
              <li key={d} className={`flex items-center gap-3 border-2 px-3 py-2 ${ok ? "border-outline bg-surface-2" : "border-line text-fg-3"}`}>
                <span aria-hidden className={`grid h-6 w-6 shrink-0 place-items-center border-2 border-current font-mono text-xs ${ok ? "bg-accent text-accent-ink" : ""}`}>{ok ? "✓" : "?"}</span>
                <span>{ok ? td(`items.${d}`) : td("hidden")}<span className="sr-only"> — {ok ? td("done") : td("todo")}</span></span>
              </li>
            );
          })}
        </ul>
        <p className="label mt-5 !normal-case !tracking-normal">{td("keys")}</p>
        {["cat", "vending", "card"].every((d) => discovered.includes(d)) && <p className="mt-5"><WorldLink href="/backstage" className="btn btn-primary" onClick={() => setOpen(false)}>{td("backstage")}</WorldLink></p>}
      </Panel>
    </header>
  );
}
