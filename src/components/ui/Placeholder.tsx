import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

/**
 * How every "the owner has not supplied this yet" state looks: a dashed slot with a mono label.
 * Placeholders are never styled like real content, so they cannot be mistaken for it (row 51/52).
 */
export async function Placeholder({
  locale, title, children, compact = false,
}: { locale: Locale; title?: string; children?: React.ReactNode; compact?: boolean }) {
  const t = await getTranslations({ locale, namespace: "placeholder" });
  return (
    <div className={`slot ${compact ? "py-3" : ""}`} data-placeholder>
      <p className="label mb-1 text-fg-3">{t("label")} · {t("owner")}</p>
      {title && <p className="font-display text-lg text-fg">{title}</p>}
      {children && <div className="mt-1 text-sm">{children}</div>}
    </div>
  );
}
