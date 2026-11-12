"use client";

import { useSyncExternalStore } from "react";
import { useLocale } from "next-intl";

const TICK = 15_000;
const subscribe = (cb: () => void) => {
  const id = setInterval(cb, TICK);
  return () => clearInterval(id);
};
// A 15-second bucket: stable between calls, changes on its own — a clean external store.
const getSnapshot = () => Math.floor(Date.now() / TICK);
const getServerSnapshot = () => 0;

/** Visitor's own local time and date — computed in the browser, nothing sent anywhere. */
export function LocalClock({ part }: { part: "time" | "date" }) {
  const locale = useLocale();
  const bucket = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const text =
    bucket === 0
      ? " " // server render / first hydration pass: reserve the space, show nothing wrong
      : part === "time"
        ? new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(bucket * TICK)
        : new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric" }).format(bucket * TICK);

  return <span className="tabular-nums" suppressHydrationWarning>{text}</span>;
}
