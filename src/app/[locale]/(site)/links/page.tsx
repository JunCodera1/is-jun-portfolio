import { getTranslations } from "next-intl/server";
import { linkGroups } from "@/content/data/links";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { LText } from "@/components/ui/LText";
import { ArrowUpRight } from "@/components/ui/Icons";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "links", "/links");

export default async function LinksPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "links" });
  return (
    <div className="page pb-8">
      <PageHeader navId="links" title={t("title")} lead={t("lead")} />
      <p className="label mt-6 !normal-case !tracking-normal">{t("note")}</p>
      <div className="mt-10 grid gap-x-10 gap-y-12 md:grid-cols-2">
        {linkGroups.map((g) => (
          <section key={g.id} aria-labelledby={`lg-${g.id}`}>
            <h2 id={`lg-${g.id}`} className="text-3xl">{t(`groups.${g.id}`)}</h2>
            <ul className="mt-4 border-t-2 border-outline">
              {g.items.map((l) => (
                <li key={l.id} className="border-b border-line">
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="index-row grid grid-cols-[1fr_auto] items-baseline gap-x-3 px-2 py-3">
                    <span>
                      <span className="block font-display text-lg leading-snug tracking-tight">{l.title}</span>
                      {l.note && <span className="label mt-1 block !normal-case !tracking-normal"><LText value={l.note} locale={locale} /></span>}
                    </span>
                    <ArrowUpRight width={16} height={16} className="arrow text-fg-3" />
                    <span className="sr-only">({t("opensNewTab")})</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
