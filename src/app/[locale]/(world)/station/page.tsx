import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { StationMap } from "@/components/world/StationMap";
import { Visit } from "@/components/world/Visit";
import { WorldTitle } from "@/components/world/WorldTitle";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "station", "/station");

export default async function StationPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale });
  return (
    <div className="pb-16">
      <Visit id="place-station" />
      <WorldTitle title={t("places.station.name")} lead={t("station.lead")} />
      <StationMap />
      <p className="page mt-8 flex flex-wrap gap-4 text-sm"><Link href="/japanese" className="link">{t("station.notes")}</Link><Link href="/japanese/kana" className="link">{t("nav.kana")}</Link><Link href="/japanese/grammar" className="link">{t("nav.grammar")}</Link></p>
    </div>
  );
}
