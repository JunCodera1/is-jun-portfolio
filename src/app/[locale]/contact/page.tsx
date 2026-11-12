import { getTranslations } from "next-intl/server";
import { profile, socialLinks } from "@/content/data/profile";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { Placeholder } from "@/components/ui/Placeholder";
import { ArrowUpRight } from "@/components/ui/Icons";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "contact", "/contact");

export default async function ContactPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "contact" });
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <div className="page pb-8">
      <PageHeader eyebrow="09" title={t("title")} lead={t("lead")} />
      <div className="grid gap-14 py-12 md:grid-cols-12 md:py-16">
        <section aria-labelledby="contact-email" className="md:col-span-6">
          <h2 id="contact-email" className="label mb-4 !text-fg-2">{t("emailLabel")}</h2>
          {profile.email ? (
            <a href={`mailto:${profile.email}`} className="link break-all font-display text-3xl tracking-tight md:text-5xl">{profile.email}</a>
          ) : (
            <Placeholder locale={locale} title={t("emailMissing")}>{t("emailMissingNote")}</Placeholder>
          )}
        </section>

        <section aria-labelledby="contact-elsewhere" className="md:col-span-5 md:col-start-8">
          <h2 id="contact-elsewhere" className="label mb-4 !text-fg-2">{t("elsewhere")}</h2>
          <ul className="border-t border-line-strong">
            {socialLinks.map((s) => (
              <li key={s.id} className="border-b border-line">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="index-row flex items-center justify-between gap-4 px-2 py-5 md:px-4">
                  <span>
                    <span className="block font-display text-2xl tracking-tight md:text-3xl">{s.label}</span>
                    <span className="label !normal-case !tracking-normal">{s.url.replace("https://", "")}</span>
                  </span>
                  <ArrowUpRight width={20} height={20} className="arrow text-fg-3" />
                  <span className="sr-only">({tc("opensNewTab")})</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <aside className="md:col-span-8 md:col-start-1">
          <h2 className="label mb-2 !text-fg-2">{t("noFormTitle")}</h2>
          <p className="max-w-[58ch] text-fg-2">{t("noForm")}</p>
        </aside>
      </div>
    </div>
  );
}
