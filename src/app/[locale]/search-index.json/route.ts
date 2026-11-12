import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { buildSearchIndex } from "@/lib/search-index";

export const dynamic = "force-static";
export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }));

/** Static per-locale index consumed by the command palette. */
export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return Response.json([], { status: 404 });
  return Response.json(await buildSearchIndex(locale));
}
