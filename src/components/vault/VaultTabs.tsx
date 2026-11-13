import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { MODULES, type ModuleId } from "@/content/data/vault/types";

/** The ten doors of the Vault, as a scrollable strip under each page header. */
export async function VaultTabs({ locale, current }: { locale: Locale; current?: ModuleId }) {
  const t = await getTranslations({ locale, namespace: "vault" });
  return (
    <nav aria-label={t("tabsLabel")} className="mt-6 overflow-x-auto pb-2 [scrollbar-width:thin]">
      <ul className="flex w-max gap-2">
        <li><Link href="/vault" aria-current={current ? undefined : "page"} className="chip">{t("hub")}</Link></li>
        {MODULES.map((m) => (
          <li key={m.id}><Link href={m.href} aria-current={current === m.id ? "page" : undefined} className={`chip ${current === m.id ? "!bg-accent !text-accent-ink !border-outline" : ""}`}>{t(`modules.${m.id}.name`)}</Link></li>
        ))}
      </ul>
    </nav>
  );
}
