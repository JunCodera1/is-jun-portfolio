import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Stagger } from "@/components/motion/Stagger";

const TILES = [
  { id: "city", href: "/city", glyph: "街" },
  { id: "news", href: "/news", glyph: "報" },
  { id: "library", href: "/library", glyph: "本" },
  { id: "japanese", href: "/japanese", glyph: "日" },
  { id: "projects", href: "/projects", glyph: "作" },
  { id: "log", href: "/log", glyph: "記" },
] as const;

/** "Where to?" — the six most useful doors, big enough to hit with a thumb. The full index follows below. */
export async function QuickTiles({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  return (
    <section aria-labelledby="tiles-title" className="page mt-16 md:mt-24">
      <h2 id="tiles-title" className="label mb-6 !text-fg-2">{t("home.tiles")}</h2>
      <Stagger as="ul" className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {TILES.map((x) => (
          <li key={x.id} data-stagger>
            <Link href={x.href} className="card-ink group relative block h-full overflow-hidden p-4 md:p-6">
              <span aria-hidden lang="ja" className="pointer-events-none absolute -right-2 -top-4 select-none font-display text-[6rem] leading-none text-accent/15 transition-transform duration-300 group-hover:scale-110 md:text-[8rem]">{x.glyph}</span>
              <span className="relative block font-display text-2xl leading-tight tracking-tight md:text-3xl">{t(`nav.${x.id}`)}</span>
              <span className="relative mt-2 block text-sm text-fg-2">{t(`nav.desc.${x.id}`)}</span>
            </Link>
          </li>
        ))}
      </Stagger>
    </section>
  );
}
