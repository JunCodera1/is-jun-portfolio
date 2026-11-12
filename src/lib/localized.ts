import type { Locale } from "@/i18n/routing";
import { defaultLocale } from "@/i18n/routing";

/**
 * Translation state of a piece of content (row 10).
 *  - translated:   written in (and reviewed for) the requested locale, or it IS the source locale
 *  - draft:        exists in the requested locale but is not yet reviewed
 *  - untranslated: no text for the requested locale; the English source is shown instead
 */
export type TranslationStatus = "translated" | "draft" | "untranslated";

type Variant = string | { text: string; status: "draft" };

/** A short piece of copy that lives in a data file. English is the required source. */
export type LocalizedText = Readonly<{ en: string; ja?: Variant; vi?: Variant }>;

export type ResolvedText = {
  text: string;
  /** Language of `text` — differs from the requested locale on fallback. Use for the `lang` attribute. */
  lang: Locale;
  status: TranslationStatus;
};

export function resolveText(value: LocalizedText, locale: Locale): ResolvedText {
  if (locale === defaultLocale) return { text: value.en, lang: defaultLocale, status: "translated" };
  const variant = value[locale];
  if (variant === undefined) return { text: value.en, lang: defaultLocale, status: "untranslated" };
  if (typeof variant === "string") return { text: variant, lang: locale, status: "translated" };
  return { text: variant.text, lang: locale, status: variant.status };
}

/** Convenience for places that only need the string. */
export const textOf = (value: LocalizedText, locale: Locale): string => resolveText(value, locale).text;

/** Worst status wins — used to summarise a whole page or record. */
export function worstStatus(statuses: TranslationStatus[]): TranslationStatus {
  if (statuses.includes("untranslated")) return "untranslated";
  if (statuses.includes("draft")) return "draft";
  return "translated";
}
