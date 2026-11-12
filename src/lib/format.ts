import type { Locale } from "@/i18n/routing";

const parse = (iso: string) => new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);

/** Locale-aware date. Date-only strings are pinned to UTC so a visitor's timezone can never shift the day. */
export function formatDate(iso: string, locale: Locale, style: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: "numeric",
  }).format(parse(iso));
}

export function formatMonthYear(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { timeZone: "UTC", year: "numeric", month: "long" }).format(parse(iso));
}

export const formatNumber = (n: number, locale: Locale) => new Intl.NumberFormat(locale).format(n);
