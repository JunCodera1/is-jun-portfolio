"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { heatmap, streak, today } from "@/lib/srs";
import { studyDaysStore } from "@/lib/world-store";

/** Study streak and a 12-week heatmap. Only this browser's own record — it says so. */
export function StudyStats() {
  const t = useTranslations("review");
  const days = useSyncExternalStore(studyDaysStore.subscribe, studyDaysStore.get, studyDaysStore.server);
  const day = today();
  const s = streak(days, day);
  const grid = heatmap(days, day, 12);
  const total = grid.flat().filter(Boolean).length;
  return (
    <div className="border-2 border-outline bg-surface p-5 shadow-[4px_4px_0_var(--outline)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">{t("streak")}</p>
          <p className="font-display text-5xl leading-none">{t("days", { n: s.current })}</p>
          <p className="label mt-1 !normal-case !tracking-normal">{t("best", { n: s.best })}</p>
        </div>
        <div role="img" aria-label={t("heatAria", { n: total })} className="flex gap-1">
          {grid.map((week, w) => (
            <div key={w} className="grid gap-1">
              {week.map((on, r) => (<span key={r} className={`block h-3.5 w-3.5 border border-line ${on ? "border-outline bg-accent" : "bg-surface-2"}`} />))}
            </div>
          ))}
        </div>
      </div>
      <p className="label mt-3 !normal-case !tracking-normal">{t("localNote")}</p>
    </div>
  );
}
