import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { codeLinks, japanese, kanjiForkUrl, references } from "@/content/data/japanese";
import { formatDate } from "@/lib/format";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { textOf } from "@/lib/localized";
import { PageHeader } from "@/components/ui/PageHeader";
import { Placeholder } from "@/components/ui/Placeholder";
import { Mascot } from "@/components/ui/Art";
import { ArrowRight, ArrowUpRight } from "@/components/ui/Icons";
import { StudyStats } from "@/components/japanese/StudyStats";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "japanese", "/japanese");

export default async function JapanesePage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "japanese" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const entries = [...japanese.milestones].sort((a, b) => (a.date ?? "9999") < (b.date ?? "9999") ? -1 : 1);

  return (
    <div className="page pb-8">
      <PageHeader navId="japanese" title={t("title")} lead={t("lead")}>
        <Mascot mood="think" className="pointer-events-none absolute -bottom-2 right-2 hidden h-52 w-auto md:block lg:right-16 lg:h-64" />
      </PageHeader>

      <section aria-labelledby="jp-journey" className="py-12 md:py-16">
        <h2 id="jp-journey" className="text-3xl md:text-5xl">{t("journey.title")}</h2>
        <p className="mt-3 max-w-[58ch] text-fg-2">{t("journey.lead")}</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="border-2 border-outline bg-surface p-5 shadow-[4px_4px_0_var(--outline)]">
            <p className="label">{t("journey.level")}</p>
            {japanese.level ? <p className="mt-2 font-display text-5xl">{japanese.level}</p> : <div className="mt-3"><Placeholder locale={locale} compact>{t("journey.levelUnset")}</Placeholder></div>}
          </div>
          <div className="border-2 border-outline bg-surface p-5 shadow-[4px_4px_0_var(--outline)]">
            <p className="label">{t("journey.started")}</p>
            {japanese.startedOn ? <p className="mt-2 font-display text-3xl">{formatDate(japanese.startedOn, locale)}</p> : <div className="mt-3"><Placeholder locale={locale} compact>{t("journey.startedUnset")}</Placeholder></div>}
          </div>
          <div className="border-2 border-outline bg-surface p-5 shadow-[4px_4px_0_var(--outline)]">
            <p className="label">{t("journey.goal")}</p>
            {japanese.goal ? <p className="mt-2 text-lg">{textOf(japanese.goal, locale)}</p> : <div className="mt-3"><Placeholder locale={locale} compact>{t("journey.goalUnset")}</Placeholder></div>}
          </div>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="label mb-3 !text-fg-2">{t("journey.milestones")}</h3>
            {entries.length === 0 ? <Placeholder locale={locale} compact>{t("journey.milestonesEmpty")}</Placeholder> : (
              <ol className="divide-y divide-line border-y border-line">
                {entries.map((m) => (
                  <li key={m.id} className="py-3">{m.date ? <time className="label" dateTime={m.date}>{formatDate(m.date, locale)}</time> : <span className="label">{t("journey.noDate")}</span>}<p className="font-display text-xl">{textOf(m.title, locale)}</p></li>
                ))}
              </ol>
            )}
          </div>
          <div>
            <h3 className="label mb-3 !text-fg-2">{t("journey.log")}</h3>
            {japanese.studyLog.length === 0 ? <Placeholder locale={locale} compact>{t("journey.logEmpty")}</Placeholder> : (
              <ul className="divide-y divide-line border-y border-line">
                {japanese.studyLog.map((l) => (
                  <li key={l.date + l.note.en} className="py-3"><time className="label" dateTime={l.date}>{formatDate(l.date, locale)}{l.minutes ? ` · ${l.minutes} min` : ""}</time><p>{textOf(l.note, locale)}</p></li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="jp-learn" className="border-t-2 border-outline py-12 md:py-16">
        <h2 id="jp-learn" className="text-3xl md:text-5xl">{t("learn.title")}</h2>
        <div className="mt-8 max-w-2xl"><StudyStats /></div>
        <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {([["review", "/japanese/review"], ["kana", "/japanese/kana"], ["grammar", "/japanese/grammar"], ["play", "/play"]] as const).map(([id, href]) => (
            <li key={id}>
              <Link href={href} className="btn !flex h-full min-h-40 flex-col !items-start !justify-between !normal-case !tracking-normal">
                <span><span className="block font-display text-3xl normal-case tracking-tight">{t(`learn.${id}.title`)}</span><span className="mt-2 block font-sans text-sm font-normal text-fg-2">{t(`learn.${id}.desc`)}</span></span>
                <ArrowRight width={20} height={20} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="jp-code" className="border-t border-line py-12 md:py-16">
        <h2 id="jp-code" className="text-3xl md:text-4xl">{t("code.title")}</h2>
        <p className="mt-3 max-w-[58ch] text-fg-2">{t("code.lead")}</p>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {codeLinks.map((c) => (
            <li key={c.id}><Link href={c.href} className="index-row flex items-center justify-between gap-4 px-2 py-4"><span>{t(`code.${c.id}`)}</span><ArrowRight width={16} height={16} className="arrow text-fg-3" /></Link></li>
          ))}
          <li><a href={kanjiForkUrl} target="_blank" rel="noopener noreferrer" className="index-row flex items-center justify-between gap-4 px-2 py-4"><span>{t("code.fork")}</span><ArrowUpRight width={16} height={16} className="arrow text-fg-3" /><span className="sr-only">({tc("opensNewTab")})</span></a></li>
        </ul>
      </section>

      <section aria-labelledby="jp-refs" className="border-t border-line py-12 md:py-16">
        <h2 id="jp-refs" className="text-3xl md:text-4xl">{t("refs.title")}</h2>
        <p className="label mt-2 !normal-case !tracking-normal">{t("refs.note")}</p>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {references.map((r) => (
            <li key={r.id}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="index-row block border border-line px-4 py-4">
                <span className="flex items-center justify-between font-display text-xl">{t(`refs.${r.id}.name`)}<ArrowUpRight width={16} height={16} className="arrow" /></span>
                <span className="mt-1 block text-sm text-fg-2">{t(`refs.${r.id}.desc`)}</span>
                <span className="sr-only">({tc("opensNewTab")})</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
