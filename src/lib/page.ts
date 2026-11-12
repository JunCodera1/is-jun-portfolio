import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";

export type LocaleParams = Promise<{ locale: string }>;

/** Validate the locale segment and tell next-intl which locale this static render is for. */
export async function initLocale(params: LocaleParams): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return locale as Locale;
}

/** Standard metadata for a page whose `<ns>.title` and `<ns>.lead` messages describe it. */
export async function pageMetadata(params: LocaleParams, ns: string, path: string): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: ns });
  return buildMetadata({ locale, path, title: t("title"), description: t("lead") });
}
