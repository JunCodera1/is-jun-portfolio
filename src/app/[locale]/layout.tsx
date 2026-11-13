import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/anton";
import antonLatin from "@fontsource/anton/files/anton-latin-400-normal.woff2";
import antonVietnamese from "@fontsource/anton/files/anton-vietnamese-400-normal.woff2";
import "@/styles/globals.css";
import { routing, localeMeta, type Locale } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";
import { THEME_SCRIPT } from "@/lib/theme";
import { TerminalMount } from "@/components/layout/TerminalMount";
import { MagneticCursor } from "@/components/motion/MagneticCursor";
import { AmbientBackground } from "@/components/motion/AmbientBackground";

const fontUrl = (a: string | { src: string }) => (typeof a === "string" ? a : a.src);

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c0d10" },
    { media: "(prefers-color-scheme: light)", color: "#f4f3ee" },
  ],
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t("siteName"), template: `%s — ${t("siteName")}` },
    description: t("description"),
    applicationName: t("siteName"),
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export default async function LocaleLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html lang={localeMeta[locale as Locale].htmlLang} suppressHydrationWarning>
      <head>
        {/* No-flash theme: sets data-theme before first paint. See TECHNICAL_DECISIONS.md (CSP). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* Preload the stage display face so it is ready before first paint (prevents a late swap and layout shift). */}
        <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" href={fontUrl(antonLatin)} />
        {locale === "vi" && <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" href={fontUrl(antonVietnamese)} />}
      </head>
      <body>
        <AmbientBackground />
        <MagneticCursor />
        <NextIntlClientProvider>
          <a
            href="#main"
            className="fixed left-3 top-3 z-50 -translate-y-20 bg-accent px-4 py-2 font-mono text-xs uppercase tracking-wider text-accent-ink focus:translate-y-0"
          >
            {t("skip")}
          </a>
          {children}
          <TerminalMount locale={locale as Locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
