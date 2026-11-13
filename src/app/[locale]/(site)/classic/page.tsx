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
import { KineticText } from "@/components/motion/KineticText";
import { textOf } from "@/lib/localized";
import { QuickTiles } from "@/components/sections/QuickTiles";
import { IndexList } from "@/components/sections/IndexList";
import { TodayStrip } from "@/components/sections/TodayStrip";
import { LatestAndFeatured } from "@/components/sections/LatestAndFeatured";
import { JsonLd } from "@/components/ui/JsonLd";

export const revalidate = 3600;

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
      <section aria-label={profile.displayName} className="page mt-24 md:mt-36">
        <ul className="space-y-6 md:space-y-10">
          {profile.facts.map((f, i) => (
            <li key={i} className="font-display text-[clamp(2rem,6.2vw,5.2rem)] leading-[1.04] tracking-[-0.03em]"><KineticText text={textOf(f, locale as Locale)} lang={locale} /></li>
          ))}
        </ul>
      </section>
      <QuickTiles locale={locale as Locale} />
      <IndexList locale={locale as Locale} />
      <TodayStrip locale={locale as Locale} />
      <LatestAndFeatured locale={locale as Locale} />
    </>
  );
}
