import { getTranslations } from "next-intl/server";
import { kanjiReadings, vocab } from "@/content/data/station";
import { textOf } from "@/lib/localized";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { Review, type ReviewCard } from "@/components/japanese/Review";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "review", "/japanese/review");

export default async function ReviewPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "review" });
  const cards: ReviewCard[] = [
    ...vocab.map((v): ReviewCard => ({ id: `v:${v.word}`, kind: "vocab", front: v.word, reading: v.reading, meaning: textOf(v.meaning, locale), level: v.level })),
    ...kanjiReadings.map((k): ReviewCard => ({ id: `k:${k.word}`, kind: "kanji", front: k.word, reading: k.reading, level: k.level })),
  ];
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="JLPT" title={t("title")} lead={t("lead")} />
      <p className="label mt-6 !normal-case !tracking-normal">{t("approx")}</p>
      <Review cards={cards} />
    </div>
  );
}
