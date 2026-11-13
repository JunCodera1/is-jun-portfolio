import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { listedPages } from "@/content/data/navigation";
import { profile, socialLinks } from "@/content/data/profile";
import { ArrowUpRight } from "@/components/ui/Icons";

export const SOURCE_REPO_URL = "https://github.com/JunCodera1/is-jun-portfolio";

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  return (
    <footer className="mt-24 border-t-2 border-outline">
      <div className="page grid gap-12 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl tracking-tight md:text-4xl">{t("meta.siteName")}</p>
          <p className="mt-3 max-w-[38ch] text-sm text-fg-2">{t("footer.colophon")}</p>
        </div>
        <nav aria-label={t("footer.sitemap")}>
          <p className="label mb-4">{t("footer.sitemap")}</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {listedPages.map((n) => (
              <li key={n.id}><Link href={n.href} className="link">{t(`nav.${n.labelKey}`)}</Link></li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="label mb-4">{t("footer.elsewhere")}</p>
          <ul className="space-y-2 text-sm">
            {socialLinks.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5">
                  {s.label}<ArrowUpRight width={13} height={13} /><span className="sr-only"> ({t("common.opensNewTab")})</span>
                </a>
              </li>
            ))}
            <li>
              <a href={SOURCE_REPO_URL} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5">
                {t("common.source")}<ArrowUpRight width={13} height={13} /><span className="sr-only"> ({t("common.opensNewTab")})</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="page flex flex-wrap items-center justify-between gap-2 py-5">
          <p className="label">{t("footer.rights", { year: new Date().getFullYear(), name: profile.displayName })}</p>
          <p className="label"><span aria-hidden lang="ja" className="mr-3 inline-block border-2 border-outline px-1.5 font-display text-sm text-fg">完</span>v0.1 · {locale.toUpperCase()}</p>
        </div>
      </div>
    </footer>
  );
}
