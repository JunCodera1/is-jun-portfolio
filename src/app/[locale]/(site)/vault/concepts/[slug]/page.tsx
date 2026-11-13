import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { concepts, glossary } from "@/content/data/vault";
import { textOf } from "@/lib/localized";
import { buildMetadata } from "@/lib/seo";
import { initLocale, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { LText } from "@/components/ui/LText";
import { ConceptDiagram } from "@/components/vault/ConceptDiagram";
import { VaultTabs } from "@/components/vault/VaultTabs";

export const generateStaticParams = () => routing.locales.flatMap((locale) => concepts.map((c) => ({ locale, slug: c.id })));

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const c = concepts.find((x) => x.id === slug);
  if (!c) return {};
  const loc = locale as "en" | "ja" | "vi";
  return buildMetadata({ locale: loc, path: `/vault/concepts/${slug}`, title: textOf(c.title, loc), description: textOf(c.summary, loc) });
}

export default async function ConceptPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const locale = await initLocale(params as unknown as LocaleParams);
  setRequestLocale(locale);
  const c = concepts.find((x) => x.id === slug);
  if (!c) notFound();
  const t = await getTranslations({ locale, namespace: "vault" });
  const terms = glossary.filter((g) => c.related.includes(g.id));
  return (
    <div className="page pb-8">
      <PageHeader eyebrow="VAULT" title={textOf(c.title, locale)} lead={textOf(c.summary, locale)} />
      <VaultTabs locale={locale} current="concepts" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="min-w-0 space-y-4 text-lg [overflow-wrap:anywhere]">{c.body.map((p, i) => (<p key={i}><LText value={p} locale={locale} /></p>))}</div>
        <div className="min-w-0 space-y-6">
          <ConceptDiagram id={c.diagram} />
          <figure>
            <pre className="overflow-x-auto border-2 border-outline bg-surface-2 p-4 font-mono text-sm leading-relaxed"><code>{c.example.code}</code></pre>
            <figcaption className="label mt-2 !normal-case !tracking-normal"><LText value={c.example.caption} locale={locale} /></figcaption>
          </figure>
        </div>
      </div>
      {terms.length > 0 && (
        <section aria-labelledby="related-title" className="mt-12">
          <h2 id="related-title" className="label !text-fg-2">{t("relatedTerms")}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">{terms.map((g) => (<li key={g.id}><Link href={`/vault/glossary#${g.id}`} className="chip !normal-case">{g.term.en}</Link></li>))}</ul>
        </section>
      )}
      <p className="mt-10"><Link href="/vault/concepts" className="link">← {t("modules.concepts.name")}</Link></p>
    </div>
  );
}
