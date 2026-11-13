import { getLocale, getTranslations } from "next-intl/server";
import { indexEntries } from "@/content/data/navigation";
import { Mascot, Neko } from "@/components/ui/Art";
import { Spot, type SpotId } from "@/components/ui/Spot";

/** Which illustration sits in each page's header (all original). */
function headerArt(navId?: string): React.ReactNode {
  const spot = (id: SpotId) => <Spot id={id} className="h-full w-full" />;
  switch (navId) {
    case "about": return <Mascot mood="happy" className="h-full w-full" />;
    case "now": return <Mascot mood="think" className="h-full w-full" />;
    case "garden": return spot("plant");
    case "journal": return spot("notebook");
    case "news": return spot("newspaper");
    case "library": return spot("books");
    case "japanese": return null; // the Japanese hub draws its own art
    case "projects": case "profile": return spot("laptop");
    case "timeline": return spot("calendar");
    case "graph": return spot("graph");
    case "contact": return spot("envelope");
    case "interests": return <Neko className="h-full w-full" />;
    default: return null;
  }
}

/** A two-digit eyebrow ("07") is rendered as the localized chapter banner: 第07話 / Ch. 07 / Chương 07. */
export async function PageHeader({
  eyebrow, navId, title, lead, children,
}: { eyebrow?: string; navId?: string; title: string; lead?: string; children?: React.ReactNode }) {
  const t = await getTranslations({ locale: await getLocale(), namespace: "home" });
  const idx = navId ? indexEntries.findIndex((n) => n.id === navId) : -1;
  const banner = idx >= 0 ? t("chapter", { n: String(idx + 1).padStart(2, "0") }) : eyebrow;
  const art = headerArt(navId);
  return (
    <header className="relative isolate overflow-hidden border-b-2 border-outline pb-10 pt-14 md:pb-14 md:pt-20">
      {/* decorative screentone corner */}
      <span aria-hidden className="tone absolute -right-6 -top-6 -z-10 h-full w-1/2 opacity-80 [mask-image:linear-gradient(to_bottom_left,#000,transparent_70%)]" />
      {art && <div aria-hidden className="pointer-events-none absolute right-0 top-8 -z-0 hidden h-40 w-52 sm:block md:top-10 md:h-60 md:w-80 lg:h-72 lg:w-96">{art}</div>}
      {banner && <p className="mb-6"><span className="chapter">{banner}</span></p>}
      <h1 className="name-pop relative z-10 text-[clamp(2.75rem,8vw,7rem)] leading-[0.95] tracking-[-0.035em]">{title}</h1>
      {lead && <p className="mt-6 max-w-[46ch] text-lg text-fg-2 md:text-xl">{lead}</p>}
      {children}
    </header>
  );
}

export function SectionTitle({ id, number, children }: { id?: string; number?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="flex items-baseline gap-4 border-b-2 border-outline pb-3 text-2xl md:text-3xl">
      {number && <span className="chapter">{number}</span>}
      <span>{children}</span>
    </h2>
  );
}
