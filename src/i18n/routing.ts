import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ja", "vi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Every URL carries its locale: /en/..., /ja/..., /vi/...  (row 7)
  localePrefix: "always",
});

export const localeMeta: Record<Locale, { label: string; name: string; htmlLang: string; ogLocale: string }> = {
  en: { label: "EN", name: "English", htmlLang: "en", ogLocale: "en_US" },
  ja: { label: "日本語", name: "日本語", htmlLang: "ja", ogLocale: "ja_JP" },
  vi: { label: "VI", name: "Tiếng Việt", htmlLang: "vi", ogLocale: "vi_VN" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
