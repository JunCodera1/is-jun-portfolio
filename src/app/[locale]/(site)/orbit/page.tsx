import { getTranslations } from "next-intl/server";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { SolarSystem, type Planet } from "@/components/graph/SolarSystem";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "orbit", "/orbit");

/** ring = orbit radius (% of the board), size = planet diameter (%), speed = relative angular speed, phase = starting angle (rad). */
const PLANETS = [
  { id: "about", href: "/about", glyph: "我", color: "#d7141f", ring: 20, size: 9, speed: 1.9, phase: 0.4 },
  { id: "projects", href: "/projects", glyph: "作", color: "#0a0a0c", ring: 20, size: 9, speed: 1.9, phase: 3.5 },
  { id: "interests", href: "/interests", glyph: "好", color: "var(--surface)", ring: 29, size: 8, speed: 1.4, phase: 1.5 },
  { id: "journal", href: "/journal", glyph: "記", color: "#d7141f", ring: 29, size: 8, speed: 1.4, phase: 4.6 },
  { id: "garden", href: "/garden", glyph: "草", color: "#4a4a54", ring: 37, size: 8.5, speed: 1.0, phase: 2.6 },
  { id: "news", href: "/news", glyph: "報", color: "var(--surface)", ring: 37, size: 8.5, speed: 1.0, phase: 5.7 },
  { id: "library", href: "/library", glyph: "本", color: "#0a0a0c", ring: 44, size: 9, speed: 0.7, phase: 0.9 },
  { id: "japanese", href: "/japanese", glyph: "日", color: "#d7141f", ring: 44, size: 9, speed: 0.7, phase: 4.0 },
] as const;

export default async function OrbitPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale });
  const planets: Planet[] = PLANETS.map((p) => ({ ...p, label: t(`nav.${p.id}`), desc: t(`nav.desc.${p.id}`) }));
  return (
    <div className="page pb-12">
      <PageHeader navId="orbit" title={t("orbit.title")} lead={t("orbit.lead")} />
      <div className="mt-10">
        <SolarSystem planets={planets} sun={{ href: "/classic", label: t("orbit.sun"), desc: t("orbit.sunDesc") }} />
      </div>
    </div>
  );
}
