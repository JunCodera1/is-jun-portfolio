import { getTranslations } from "next-intl/server";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { CityMap } from "@/components/world/CityMap";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "city", "/city");

export default async function CityPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "city" });
  return (
    <div className="pb-16 pt-14">
      <h1 className="sr-only">{t("title")}</h1>
      <CityMap />
    </div>
  );
}
