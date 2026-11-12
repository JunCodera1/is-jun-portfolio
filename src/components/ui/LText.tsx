import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { resolveText, type LocalizedText } from "@/lib/localized";

/**
 * Renders a piece of localized data-file copy and is honest about its state:
 *  - falls back to English → wrapped in lang="en" and tagged "EN only"
 *  - draft translation     → tagged "Draft"
 * Paragraphs separated by a blank line become separate <p> elements when `block` is set.
 */
export async function LText({
  value, locale, block = false, className,
}: { value: LocalizedText; locale: Locale; block?: boolean; className?: string }) {
  const r = resolveText(value, locale);
  const t = await getTranslations({ locale, namespace: "translation" });
  const badge =
    r.status === "untranslated" ? t("untranslated") : r.status === "draft" ? t("draft") : null;
  const langAttr = r.lang !== locale ? r.lang : undefined;

  const body = block
    ? r.text.split(/\n{2,}/).map((para, i) => <p key={i} className={i ? "mt-4" : undefined}>{para}</p>)
    : r.text;

  const Wrapper = block ? "div" : "span";
  return (
    <Wrapper lang={langAttr} className={className}>
      {body}
      {badge && (
        <span className="label ml-2 inline-block border border-line px-1.5 py-px align-middle text-[0.62rem]" title={badge}>
          {badge}
        </span>
      )}
    </Wrapper>
  );
}
