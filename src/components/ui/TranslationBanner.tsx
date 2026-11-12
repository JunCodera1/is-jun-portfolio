import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { TranslationStatus } from "@/lib/localized";

/** Shown above content that is not (fully) available in the visitor's language (row 10). */
export async function TranslationBanner({
  status, locale, englishHref,
}: { status: TranslationStatus; locale: Locale; englishHref?: string }) {
  if (status === "translated") return null;
  const t = await getTranslations({ locale, namespace: "translation" });
  const isFallback = status === "untranslated";
  return (
    <aside role="note" className="mb-10 border border-line-strong bg-surface p-4 md:p-5" aria-label={isFallback ? t("fallbackTitle", { language: t(`languageNames.${locale}`) }) : t("draftTitle")}>
      <p className="label mb-1 text-accent-fg">{isFallback ? t("untranslated") : t("draft")}</p>
      <p className="font-display text-lg">
        {isFallback ? t("fallbackTitle", { language: t(`languageNames.${locale}`) }) : t("draftTitle")}
      </p>
      <p className="mt-1 text-sm text-fg-2">{isFallback ? t("fallbackBody") : t("draftBody")}</p>
      {isFallback && englishHref && (
        <Link href={englishHref} locale="en" className="link mt-3 inline-block text-sm" hrefLang="en" lang="en">
          {t("fallbackLink")}
        </Link>
      )}
    </aside>
  );
}
