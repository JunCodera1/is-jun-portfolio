/* Plain <img>: small fixed-size cover from an allow-listed host (see the CSP). */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "@/components/ui/Icons";
import { Stagger } from "@/components/motion/Stagger";
import { animate, pop, reducedMotion, stagger } from "@/lib/motion";

export interface PTrack { id: string; title: string; artist?: string; url: string; image?: string; embed?: { src: string; height: number; provider: string }; deezerId?: string }

/**
 * A playlist you can play on the page. Nothing loads or plays until a track is chosen: embeds are created on click (no third-party
 * requests on page load) and 30-second previews use a plain audio element. Tracks that can't be embedded open on their own site.
 */
export function Playlist({ tracks, title, note }: { tracks: PTrack[]; title: string; note?: string }) {
  const t = useTranslations("library.player");
  const [i, setI] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const bars = useRef<HTMLSpanElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cur = i === null ? null : tracks[i];

  const go = (n: number) => { setPlaying(false); setI((n + tracks.length) % tracks.length); };

  // equalizer bars bounce while a preview is playing
  useEffect(() => {
    if (!playing || reducedMotion() || !bars.current) return;
    const a = animate(bars.current.children, { scaleY: [0.25, 1], duration: 420, delay: stagger(90), alternate: true, loop: true, ease: "inOutSine" });
    return () => { a.revert(); };
  }, [playing]);
  useEffect(() => { if (cur) pop(stage.current, 1.015); }, [cur]);

  if (tracks.length === 0) return null;
  return (
    <div>
      <div ref={stage} className="border-2 border-outline bg-surface p-4 shadow-[6px_6px_0_var(--accent)]" aria-live="polite">
        {cur ? (
          <div>
            <div className="flex items-center gap-3">
              {cur.image && <img src={cur.image} alt="" width={56} height={56} referrerPolicy="no-referrer" className="h-14 w-14 border-2 border-outline object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="label">{t("now")}</p>
                <p className="truncate font-display text-xl leading-tight">{cur.title}</p>
                {cur.artist && <p className="truncate text-sm text-fg-2">{cur.artist}</p>}
              </div>
              <span ref={bars} aria-hidden className="flex h-8 items-end gap-[3px]">{[0, 1, 2, 3].map((k) => (<span key={k} className="block h-full w-1.5 origin-bottom bg-accent" style={{ transform: "scaleY(0.25)" }} />))}</span>
            </div>
            {cur.deezerId ? (
              <audio key={cur.id} className="mt-3 w-full" controls autoPlay preload="none" src={`/api/deezer-preview/${cur.deezerId}`} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => go((i ?? 0) + 1)} onError={() => setPlaying(false)}>
                <a href={cur.url}>{t("openOn")}</a>
              </audio>
            ) : cur.embed ? (
              <iframe key={cur.id} title={`${cur.title}${cur.artist ? ` — ${cur.artist}` : ""}`} src={cur.embed.src} height={cur.embed.height} loading="lazy" className="mt-3 w-full border-0" allow="encrypted-media; clipboard-write" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation" />
            ) : (
              <p className="mt-3"><a href={cur.url} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-primary">{t("openOn")}<ArrowUpRight width={14} height={14} /><span className="sr-only"> ({t("newTab")})</span></a><span className="label ml-3 !normal-case !tracking-normal">{t("noEmbed")}</span></p>
            )}
            <div className="mt-3 flex gap-2">
              <button type="button" className="chip tap" onClick={() => go((i ?? 0) - 1)}>← {t("prev")}</button>
              <button type="button" className="chip tap" onClick={() => go((i ?? 0) + 1)}>{t("next")} →</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-fg-2">{t("pick")}</p>
            <button type="button" className="btn btn-primary" onClick={() => go(0)}>▶ {t("playAll")}</button>
          </div>
        )}
      </div>

      <Stagger as="ol" className="mt-4 border-t-2 border-outline" aria-label={title}>
        {tracks.map((tr, k) => (
          <li key={tr.id} data-stagger className="border-b border-line">
            <button type="button" aria-current={i === k ? "true" : undefined} onClick={() => go(k)} className={`index-row grid w-full grid-cols-[1.75rem_minmax(0,1fr)_auto] items-center gap-x-3 px-2 py-2.5 text-left ${i === k ? "bg-surface-2" : ""}`}>
              <span className="label tabular-nums">{i === k ? "▶" : String(k + 1).padStart(2, "0")}</span>
              <span className="min-w-0"><span className="block truncate font-display text-lg leading-snug">{tr.title}</span>{tr.artist && <span className="label block truncate !normal-case !tracking-normal">{tr.artist}</span>}</span>
              <span className="label !normal-case !tracking-normal">{tr.deezerId ? t("preview") : tr.embed ? tr.embed.provider : t("link")}</span>
            </button>
          </li>
        ))}
      </Stagger>
      {note && <p className="label mt-3 !normal-case !tracking-normal">{note}</p>}
    </div>
  );
}
