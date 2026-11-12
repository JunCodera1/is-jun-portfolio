"use client";

import { useTranslations } from "next-intl";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("errors");
  return (
    <div className="page py-28 md:py-40" role="alert">
      <p className="label mb-6">Error</p>
      <h1 className="text-[clamp(2.5rem,7vw,6rem)] font-medium leading-[0.95] tracking-[-0.035em]">{t("errorTitle")}</h1>
      <p className="mt-6 max-w-[42ch] text-lg text-fg-2">{t("errorBody")}</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-10">{t("retry")}</button>
    </div>
  );
}
