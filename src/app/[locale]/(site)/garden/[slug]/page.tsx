import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getEntry, listIds } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { initLocale } from "@/lib/page";
import { Article } from "@/components/sections/Article";

type Props = { params: Promise<{ locale: string; slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => listIds("garden").map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const e = getEntry("garden", slug, locale);
  if (!e) return {};
  return buildMetadata({ locale, path: `/garden/${slug}`, title: e.title, description: e.summary, type: "article", publishedTime: e.date });
}

export default async function GardenEntryPage({ params }: Props) {
  const locale = await initLocale(params);
  const { slug } = await params;
  const entry = getEntry("garden", slug, locale);
  if (!entry) notFound();
  return <Article entry={entry} locale={locale} />;
}
