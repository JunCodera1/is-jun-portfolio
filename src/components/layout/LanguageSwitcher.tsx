"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { locales, localeMeta } from "@/i18n/routing";

/**
 * Global language switcher (row 6). Links point at the *current* pathname in each locale, so the visitor
 * stays on the same page. Clicking sets the NEXT_LOCALE cookie via the proxy → the choice is remembered (row 8).
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const current = useLocale();
  const pathname = usePathname();
  const t = useTranslations("lang");
  return (
    <nav aria-label={t("label")} className={className}>
      <ul className="flex items-center">
        {locales.map((l, i) => {
          const active = l === current;
          return (
            <li key={l} className="flex items-center">
              {i > 0 && <span aria-hidden className="h-3 w-px bg-line-strong" />}
              <Link
                href={pathname}
                locale={l}
                hrefLang={localeMeta[l].htmlLang}
                aria-current={active ? "true" : undefined}
                className={`tap grid min-h-9 place-items-center whitespace-nowrap px-2.5 font-mono text-[0.72rem] tracking-wide transition-colors ${
                  active ? "text-fg" : "text-fg-3 hover:text-fg"
                }`}
              >
                {/* Accessible name = visible label + action (WCAG 2.5.3 label-in-name); lang only on the foreign-language label */}
                <span lang={localeMeta[l].htmlLang} className={active ? "hl" : undefined}>{localeMeta[l].label}</span>
                <span className="sr-only">{`: ${t("switchTo", { name: localeMeta[l].name })}`}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
