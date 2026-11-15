import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOwnerContext } from "@/core/owner/context";
import { initLocale, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { OwnerConsole } from "@/components/owner/OwnerConsole";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Private. Exists only when the owner console is configured; otherwise this route is a plain 404. */
export default async function OwnerPage({ params }: { params: LocaleParams }) {
  if (!(await getOwnerContext())) notFound();
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "owner" });
  return (
    <div className="page pb-12">
      <PageHeader eyebrow="OWNER" title={t("title")} lead={t("lead")} />
      <div className="mt-10"><OwnerConsole /></div>
    </div>
  );
}
