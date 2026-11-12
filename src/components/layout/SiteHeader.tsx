import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { navigation } from "@/content/data/navigation";
import { profile, socialLinks } from "@/content/data/profile";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeControl } from "./ThemeControl";
import { CommandPalette } from "./CommandPalette";
import { IndexMenu } from "./IndexMenu";

export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  const label = (key: string) => t(`nav.${key}`);
  const desc = (key: string) => (t.has(`nav.desc.${key}`) ? t(`nav.desc.${key}`) : undefined);

  const primary = navigation.filter((n) => n.primary).map((n) => ({ href: n.href, label: label(n.labelKey) }));
  const all = navigation.map((n) => ({ id: n.id, href: n.href, label: label(n.labelKey), desc: desc(n.id) }));
  const github = socialLinks.find((s) => s.id === "github")!.url;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-sm">
      <div className="page flex h-16 items-center justify-between gap-3">
        <Logo monogram={profile.monogram} label={`${t("meta.siteName")} — ${t("nav.home")}`} name={t("meta.siteName")} />
        <NavLinks items={primary} label={t("nav.primaryLabel")} />
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <ThemeControl className="hidden md:inline-flex" />
          <CommandPalette pages={all} githubUrl={github} />
          <IndexMenu items={all} />
        </div>
      </div>
    </header>
  );
}
