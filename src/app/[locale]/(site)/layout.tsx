import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { RouteWipe } from "@/components/layout/RouteWipe";

/** The "Classic" site: conventional header, footer and pages. The immersive world lives in the (world) group. */
export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <SiteHeader locale={locale as Locale} />
      <main id="main" tabIndex={-1} className="outline-none">{children}</main>
      <SiteFooter locale={locale as Locale} />
      <RouteWipe />
    </>
  );
}
