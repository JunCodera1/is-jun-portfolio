import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import type { LocaleParams } from "@/lib/page";

/** Metadata for a Vault module page: title and lead come from vault.modules.<id>. */
export async function vaultMetadata(params: LocaleParams, id: string, path: string): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "vault.modules" });
  return buildMetadata({ locale, path, title: t(`${id}.name`), description: t(`${id}.lead`) });
}
