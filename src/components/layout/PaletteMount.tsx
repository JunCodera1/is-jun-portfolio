import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { navigation } from "@/content/data/navigation";
import { socialLinks } from "@/content/data/profile";
import { CommandPalette } from "./CommandPalette";

/** The command palette with every page as a target. Used by the classic header and by the world's HUD, so Ctrl+K works everywhere. */
export async function PaletteMount({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  const pages = navigation.map((n) => ({ id: n.id, href: n.href, label: t(`nav.${n.labelKey}`), desc: t.has(`nav.desc.${n.id}`) ? t(`nav.desc.${n.id}`) : undefined }));
  return <CommandPalette pages={pages} githubUrl={socialLinks.find((s) => s.id === "github")!.url} />;
}
