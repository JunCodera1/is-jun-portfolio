import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileDock } from "@/components/layout/MobileDock";
import { getTranslations } from "next-intl/server";
import { RouteWipe } from "@/components/layout/RouteWipe";

/** The "Classic" site: conventional header, footer and pages. The immersive world lives in the (world) group. */
export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const dock = [
    { href: "/city", label: t("nav.city"), glyph: "街" },
    { href: "/garden", label: t("nav.garden"), glyph: "草" },
    { href: "/news", label: t("nav.news"), glyph: "報" },
    { href: "/library", label: t("nav.library"), glyph: "本" },
    { href: "/projects", label: t("nav.projects"), glyph: "作" },
  ];
  return (
    <>
      <SiteHeader locale={locale as Locale} />
      <main id="main" tabIndex={-1} className="outline-none">{children}</main>
      <div className="pb-16 lg:pb-0"><SiteFooter locale={locale as Locale} /></div>
      <MobileDock items={dock} label={t("nav.primaryLabel")} />
      <RouteWipe />
    </>
  );
}
