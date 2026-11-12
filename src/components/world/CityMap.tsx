"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { places, secrets, type PlaceId } from "@/content/data/world";
import { CityArt } from "./CityArt";
import { WorldLink } from "./WorldLink";
import { useWorld } from "./WorldProvider";

export function CityMap() {
  const t = useTranslations("places");
  const tc = useTranslations("city");
  const { discover, discovered, sfx } = useWorld();
  const [active, setActive] = useState<PlaceId | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const onSecret = (id: (typeof secrets)[number]["id"]) => {
    sfx("select");
    discover(id);
    setNote(tc(`secrets.${id}`));
  };

  // ← → move between places (Tab works too; both are real links)
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const links = [...e.currentTarget.querySelectorAll<HTMLAnchorElement>("a.hotspot")];
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next = links[(i + (e.key === "ArrowRight" ? 1 : -1) + links.length) % links.length];
    if (next) { e.preventDefault(); next.focus(); }
  };

  return (
    <div>
      <div className="overflow-x-auto overscroll-x-contain" tabIndex={-1}>
        <div
          className="relative mx-auto aspect-[16/9] bg-bg"
          style={{ width: "max(960px, min(100%, calc((100dvh - 4.5rem) * 1.7778)))" }}
          onKeyDown={onKey}
        >
          <CityArt active={active} />

          {places.map((p, i) => (
            <WorldLink
              key={p.id}
              href={p.href}
              className="hotspot"
              style={{ left: `${p.box.x}%`, top: `${p.box.y}%`, width: `${p.box.w}%`, height: `${p.box.h}%` }}
              onMouseEnter={() => setActive(p.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(p.id)}
              onBlur={() => setActive(null)}
            >
              <span className="plate" data-seen={discovered.includes(`place-${p.id}`) ? "" : undefined}>{String(i + 1).padStart(2, "0")} {t(`${p.id}.name`)}</span>
              <span className="sr-only">. {t(`${p.id}.short`)}</span>
            </WorldLink>
          ))}

          {secrets.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSecret(s.id)}
              aria-label={tc(`secretLabel.${s.id}`)}
              className="absolute grid min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full opacity-0 outline-offset-2 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-accent-fg"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              <span aria-hidden className="qmark" />
            </button>
          ))}

          <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3" aria-live="polite">
            <div className="max-w-[30rem]">
              {active ? (
                <div className="plate !whitespace-normal !text-base"><b className="block text-accent-fg">{t(`${active}.name`)}</b><span className="font-sans text-sm normal-case tracking-normal">{t(`${active}.desc`)}</span></div>
              ) : note ? (
                <p className="plate !whitespace-normal font-sans !text-sm normal-case tracking-normal">{note}</p>
              ) : (
                <p className="plate !text-sm">{tc("hint")}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ul className="page mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label={tc("list")}>
        {places.map((p, i) => (
          <li key={p.id}>
            <WorldLink href={p.href} className="btn !flex h-full !flex-col !items-start !normal-case !tracking-normal">
              <span className="chapter">{String(i + 1).padStart(2, "0")}</span>
              <span className="stage-title mt-2 text-2xl">{t(`${p.id}.name`)}</span>
              <span className="mt-1 font-sans text-sm font-normal text-fg-2">{t(`${p.id}.short`)}</span>
            </WorldLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
