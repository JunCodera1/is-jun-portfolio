"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

/** Visitor's own local time and date — computed in the browser, nothing sent anywhere. */
export function LocalClock({ part }: { part: "time" | "date" }) {
  const locale = useLocale();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  const text = now
    ? part === "time"
      ? new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(now)
      : new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric" }).format(now)
    : " ";

  return <span className="tabular-nums" suppressHydrationWarning>{text}</span>;
}
