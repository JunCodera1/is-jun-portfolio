import { getTranslations } from "next-intl/server";
import { interests } from "@/content/data/interests";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { LText } from "@/components/ui/LText";
import { Placeholder } from "@/components/ui/Placeholder";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "interests", "/interests");

export default async function InterestsPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "interests" });
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="05" title={t("title")} lead={t("lead")} />
      <div className="grid gap-x-8 md:grid-cols-2 lg:grid-cols-3">
        {interests.map((c, i) => (
          <section key={c.id} aria-labelledby={`int-${c.id}`} className="reveal border-b border-line py-8">
            <p className="label mb-2">{String(i + 1).padStart(2, "0")}</p>
            <h2 id={`int-${c.id}`} className="mb-4 text-2xl md:text-3xl">{t(`categories.${c.id}`)}</h2>
            {c.items.length === 0 ? (
              <Placeholder locale={locale} compact>{t("empty")}</Placeholder>
            ) : (
              <ul className="space-y-2">
                {c.items.map((it, k) => (
                  <li key={k}>
                    {it.url ? <a href={it.url} className="link" target="_blank" rel="noopener noreferrer"><LText value={it.title} locale={locale} /></a> : <LText value={it.title} locale={locale} />}
                    {it.note && <span className="block text-sm text-fg-2"><LText value={it.note} locale={locale} /></span>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
