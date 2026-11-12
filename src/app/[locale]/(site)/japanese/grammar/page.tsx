import { getTranslations } from "next-intl/server";
import { particles, phrases, politeness, verbs } from "@/content/data/japanese-knowledge";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { LText } from "@/components/ui/LText";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "grammar", "/japanese/grammar");

export default async function GrammarPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "grammar" });
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="文法" title={t("title")} lead={t("lead")} />

      <section aria-labelledby="g-particles" className="py-12">
        <h2 id="g-particles" className="text-3xl md:text-4xl">{t("particles.title")}</h2>
        <p className="mt-2 max-w-[60ch] text-fg-2">{t("particles.lead")}</p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-left">
            <thead><tr className="label">
              <th scope="col" className="border-b-2 border-outline py-2 pr-4 font-normal">{t("particles.particle")}</th>
              <th scope="col" className="border-b-2 border-outline py-2 pr-4 font-normal">{t("particles.role")}</th>
              <th scope="col" className="border-b-2 border-outline py-2 pr-4 font-normal">{t("particles.example")}</th>
              <th scope="col" className="border-b-2 border-outline py-2 font-normal">{t("particles.meaning")}</th>
            </tr></thead>
            <tbody>
              {particles.map((p) => (
                <tr key={p.p} className="align-top">
                  <th scope="row" className="border-b border-line py-3 pr-4 text-left"><span lang="ja" className="font-display text-3xl">{p.p}</span> <span className="label">{p.romaji}</span></th>
                  <td className="border-b border-line py-3 pr-4"><LText value={p.role} locale={locale} /></td>
                  <td className="border-b border-line py-3 pr-4"><span lang="ja" className="block text-lg">{p.ex}</span><span className="label !normal-case !tracking-normal">{p.exRomaji}</span></td>
                  <td className="border-b border-line py-3"><LText value={p.meaning} locale={locale} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="g-politeness" className="border-t-2 border-outline py-12">
        <h2 id="g-politeness" className="text-3xl md:text-4xl">{t("politeness.title")}</h2>
        <p className="mt-2 max-w-[60ch] text-fg-2">{t("politeness.lead")}</p>
        <ul className="mt-6 grid gap-5 md:grid-cols-3">
          {politeness.map((p) => (
            <li key={p.id} className="border-2 border-outline bg-surface p-5 shadow-[4px_4px_0_var(--outline)]">
              <p className="label">{t(`politeness.levels.${p.id}.name`)}</p>
              <p lang="ja" className="mt-2 font-display text-3xl">{p.example}</p>
              {p.example2 && <p lang="ja" className="font-display text-2xl">{p.example2}</p>}
              <p className="mt-3 text-sm text-fg-2">{t(`politeness.levels.${p.id}.desc`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="g-verbs" className="border-t border-line py-12">
        <h2 id="g-verbs" className="text-3xl md:text-4xl">{t("verbs.title")}</h2>
        <p className="mt-2 max-w-[60ch] text-fg-2">{t("verbs.lead")}</p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-left">
            <thead><tr className="label">
              {(["dict", "polite", "negative", "past", "te"] as const).map((c) => <th key={c} scope="col" className="border-b-2 border-outline py-2 pr-4 font-normal">{t(`verbs.cols.${c}`)}</th>)}
              <th scope="col" className="border-b-2 border-outline py-2 font-normal">{t("verbs.group")}</th>
            </tr></thead>
            <tbody>
              {verbs.map((v) => (
                <tr key={v.dict} className="align-top">
                  <th scope="row" className="border-b border-line py-3 pr-4 text-left"><span lang="ja" className="font-display text-2xl">{v.dict}</span><span className="label block !normal-case !tracking-normal">{v.reading} · <LText value={v.meaning} locale={locale} /></span></th>
                  {[v.polite, v.negative, v.past, v.te].map((x) => <td key={x} lang="ja" className="border-b border-line py-3 pr-4 text-lg">{x}</td>)}
                  <td className="border-b border-line py-3 text-sm">{t(`verbs.groups.${v.group}`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="g-phrases" className="border-t border-line py-12">
        <h2 id="g-phrases" className="text-3xl md:text-4xl">{t("phrases.title")}</h2>
        <p className="mt-2 max-w-[60ch] text-fg-2">{t("phrases.lead")}</p>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {phrases.map((p) => (
            <li key={p.ja} className="border border-line p-4">
              <p lang="ja" className="font-display text-2xl">{p.ja}</p>
              <p className="label !normal-case !tracking-normal">{p.romaji}</p>
              <p className="mt-2"><LText value={p.meaning} locale={locale} /></p>
              <p className="label mt-1"><LText value={p.when} locale={locale} /></p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
