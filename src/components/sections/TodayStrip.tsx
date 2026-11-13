import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { kanjiReadings, vocab } from "@/content/data/station";
import { pickDaily } from "@/lib/daily";
import { textOf } from "@/lib/localized";

/** "Today": one vocabulary word and one kanji reading, the same for everyone all day (UTC). Practice material, not an official list. */
export async function TodayStrip({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "today" });
  const now = new Date();
  const w = pickDaily(vocab, now);
  const k = pickDaily(kanjiReadings, now, 7);
  if (!w || !k) return null;
  return (
    <section aria-labelledby="today-title" className="page mt-20 md:mt-28">
      <h2 id="today-title" className="label mb-6 !text-fg-2">{t("title")}</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="slab p-6">
          <p className="label !normal-case !tracking-normal">{t("word")} · {w.level.toUpperCase()}</p>
          <p lang="ja" className="mt-2 font-display text-5xl leading-none">{w.word}</p>
          <p lang="ja" className="mt-2 text-fg-2">{w.reading}</p>
          <p className="mt-1 text-lg">{textOf(w.meaning, locale)}</p>
        </div>
        <div className="slab p-6">
          <p className="label !normal-case !tracking-normal">{t("reading")} · {k.level.toUpperCase()}</p>
          <p lang="ja" className="mt-2 font-display text-5xl leading-none">{k.word}</p>
          <p className="mt-2 text-fg-2">{t("readingQ")}</p>
          <details className="mt-1"><summary className="link cursor-pointer">{t("reveal")}</summary><p lang="ja" className="mt-1 text-lg">{k.reading}</p></details>
        </div>
      </div>
      <p className="mt-4"><Link href="/station" className="link">{t("more")}</Link></p>
    </section>
  );
}
