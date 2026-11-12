import { getLocale, getTranslations } from "next-intl/server";

/** A two-digit eyebrow ("07") is rendered as the localized chapter banner: 第07話 / Ch. 07 / Chương 07. */
export async function PageHeader({
  eyebrow, title, lead, children,
}: { eyebrow?: string; title: string; lead?: string; children?: React.ReactNode }) {
  const t = await getTranslations({ locale: await getLocale(), namespace: "home" });
  const banner = eyebrow && /^\d{2}$/.test(eyebrow) ? t("chapter", { n: eyebrow }) : eyebrow;
  return (
    <header className="relative isolate overflow-hidden border-b-2 border-outline pb-10 pt-14 md:pb-14 md:pt-20">
      {/* decorative screentone corner */}
      <span aria-hidden className="tone absolute -right-6 -top-6 -z-10 h-full w-1/2 opacity-80 [mask-image:linear-gradient(to_bottom_left,#000,transparent_70%)]" />
      {banner && <p className="mb-6"><span className="chapter">{banner}</span></p>}
      <h1 className="name-pop text-[clamp(2.75rem,8vw,7rem)] leading-[0.95] tracking-[-0.035em]">{title}</h1>
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
