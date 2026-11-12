import { getTranslations } from "next-intl/server";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { GamesHub } from "@/components/games/GamesHub";
import { Visit } from "@/components/world/Visit";
import { WorldTitle } from "@/components/world/WorldTitle";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "arcade", "/arcade");

export default async function ArcadePage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale });
  return (
    <div className="pb-16">
      <Visit id="place-arcade" />
      <WorldTitle title={t("places.arcade.name")} lead={t("arcade.lead")} />
      <div className="page mt-10"><GamesHub /><p className="label mt-10 !normal-case !tracking-normal">{t("play.note")}</p></div>
    </div>
  );
}
