import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { getRecentRepos } from "@/lib/github-feed";
import { profile, socialLinks } from "@/content/data/profile";
import { Hero } from "@/components/sections/Hero";
import { IndexList } from "@/components/sections/IndexList";
import { LatestAndFeatured } from "@/components/sections/LatestAndFeatured";
import { JsonLd } from "@/components/ui/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  const m = buildMetadata({ locale, path: "/classic", title: t("siteName"), description: t("description") });
  return { ...m, title: { absolute: t("siteName") } };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const feed = await getRecentRepos(1);
  const t = await getTranslations({ locale, namespace: "meta" });

  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "WebSite", name: t("siteName"), url: `${siteUrl()}/${locale}`, inLanguage: locale },
          { "@context": "https://schema.org", "@type": "Person", name: profile.displayName, url: `${siteUrl()}/${locale}`, sameAs: socialLinks.map((s) => s.url) },
        ]}
      />
      <Hero locale={locale as Locale} feed={feed} />
      <IndexList locale={locale as Locale} />
      <LatestAndFeatured locale={locale as Locale} />
    </>
  );
}
