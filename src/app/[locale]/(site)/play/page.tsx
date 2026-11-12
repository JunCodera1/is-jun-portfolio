import { getTranslations } from "next-intl/server";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { GamesHub } from "@/components/games/GamesHub";
import { Neko } from "@/components/ui/Art";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "play", "/play");

export default async function PlayPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "play" });
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="▶" title={t("title")} lead={t("lead")}>
        <Neko className="absolute bottom-4 right-0 hidden h-28 w-auto md:block" />
      </PageHeader>
      <div className="mt-10"><GamesHub /></div>
      <p className="label mt-10 !normal-case !tracking-normal">{t("note")}</p>
    </div>
  );
}
