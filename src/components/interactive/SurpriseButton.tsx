"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { loadSearchIndex } from "@/lib/search-client";
import { pickSurprise } from "@/lib/surprise";

/** Takes you somewhere random on the site: a page, a project, a note. */
export function useSurprise() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  return async () => {
    try {
      const hit = pickSurprise(await loadSearchIndex(locale), pathname);
      if (hit) router.push(hit.href);
    } catch { /* offline or blocked: stay where you are */ }
  };
}

export function SurpriseButton({ className = "btn" }: { className?: string }) {
  const t = useTranslations("common");
  const surprise = useSurprise();
  const [busy, setBusy] = useState(false);
  return (
    <button type="button" className={className} disabled={busy} onClick={async () => { setBusy(true); await surprise(); setBusy(false); }}>
      <span aria-hidden>🎲</span> {t("surprise")}
    </button>
  );
}
