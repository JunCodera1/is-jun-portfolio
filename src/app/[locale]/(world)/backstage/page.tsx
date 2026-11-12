import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { initLocale, type LocaleParams } from "@/lib/page";
import { Visit } from "@/components/world/Visit";
import { WorldTitle } from "@/components/world/WorldTitle";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "backstage" });
  return { title: t("title"), robots: { index: false, follow: false } }; // a secret room: not listed, not indexed
}

export default async function BackstagePage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "backstage" });
  return (
    <div className="pb-16">
      <Visit id="backstage" />
      <WorldTitle title={t("title")} lead={t("lead")} tone="white" />
      <div className="page mt-10 grid gap-8 md:grid-cols-2">
        <section className="border-2 border-outline bg-surface p-6 shadow-[6px_6px_0_var(--accent)]"><h2 className="stage-title text-3xl">{t("builtTitle")}</h2><ul className="mt-4 space-y-2">{(["a", "b", "c", "d"] as const).map((k) => <li key={k} className="border-l-4 border-accent pl-3">{t(`built.${k}`)}</li>)}</ul></section>
        <section className="border-2 border-outline bg-surface p-6 shadow-[6px_6px_0_var(--accent)]"><h2 className="stage-title text-3xl">{t("keysTitle")}</h2><ul className="mt-4 space-y-2 font-mono text-sm">{(["a", "b", "c", "d"] as const).map((k) => <li key={k}>{t(`keys.${k}`)}</li>)}</ul></section>
      </div>
      <p className="page mt-10 max-w-[60ch] text-lg">{t("note")}</p>
    </div>
  );
}
