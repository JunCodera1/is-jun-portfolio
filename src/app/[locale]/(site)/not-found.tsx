import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Mascot } from "@/components/ui/Art";

export default function NotFound() {
  const t = useTranslations("errors");
  return (
    <div className="page relative py-28 md:py-40">
      <Mascot mood="think" className="pointer-events-none absolute bottom-10 right-4 hidden h-64 w-auto md:block" />
      <p className="label mb-6">404</p>
      <h1 className="text-[clamp(2.75rem,8vw,7rem)] font-medium leading-[0.95] tracking-[-0.035em]">{t("notFoundTitle")}</h1>
      <p className="mt-6 max-w-[42ch] text-lg text-fg-2">{t("notFoundBody")}</p>
      <Link href="/" className="btn btn-primary mt-10">{t("toIndex")}</Link>
    </div>
  );
}
