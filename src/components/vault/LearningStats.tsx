"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { counts, streak, today } from "@/lib/srs";
import { deckStore, stampStore, studyDaysStore } from "@/lib/world-store";
import { vocab, kanjiReadings } from "@/content/data/station";

/** What this browser has recorded for Japanese: cards learned, missions stamped, study streak. Local to this device, and says so. */
export function LearningStats() {
  const t = useTranslations("vault.learning");
  const deck = useSyncExternalStore(deckStore.subscribe, deckStore.get, deckStore.server);
  const stamps = useSyncExternalStore(stampStore.subscribe, stampStore.get, stampStore.server);
  const days = useSyncExternalStore(studyDaysStore.subscribe, studyDaysStore.get, studyDaysStore.server);
  const ids = [...vocab.map((v) => `v:${v.word}`), ...kanjiReadings.map((k) => `k:${k.word}`)];
  const c = counts(ids, deck, today());
  const s = streak(days, today());
  const pct = Math.round((c.learned / Math.max(1, c.total)) * 100);
  const items: [string, string][] = [[t("learned"), `${c.learned}/${c.total}`], [t("due"), String(c.due)], [t("stamps"), String(stamps.length)], [t("streak"), t("days", { n: s.current })]];
  return (
    <div className="mt-6 border-2 border-outline bg-surface-2 p-4">
      <p className="label">{t("localTitle")}</p>
      <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map(([k, v]) => (<div key={k}><dt className="label">{k}</dt><dd className="font-display text-3xl leading-none">{v}</dd></div>))}
      </dl>
      <div className="mt-4 h-2 border border-outline bg-surface" role="progressbar" aria-label={t("learned")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><div className="h-full bg-accent" style={{ width: `${pct}%` }} /></div>
      <p className="label mt-3 !normal-case !tracking-normal">{t("localNote")} <Link href="/japanese/review" className="link">{t("review")}</Link></p>
    </div>
  );
}
