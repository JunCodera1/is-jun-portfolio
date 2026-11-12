import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { initLocale, type LocaleParams } from "@/lib/page";
import { Entrance } from "@/components/world/Entrance";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });
  const m = buildMetadata({ locale, path: "", title: t("siteName"), description: t("description") });
  return { ...m, title: { absolute: t("siteName") } };
}

export default async function EntrancePage({ params }: { params: LocaleParams }) {
  await initLocale(params);
  return <Entrance />;
}
