export function PageHeader({
  eyebrow, title, lead, children,
}: { eyebrow?: string; title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <header className="relative border-b border-line pb-10 pt-14 md:pb-14 md:pt-20">
      {eyebrow && <p className="label mb-6">{eyebrow}</p>}
      <h1 className="text-[clamp(2.75rem,8vw,7rem)] font-medium leading-[0.95] tracking-[-0.035em]">{title}</h1>
      {lead && <p className="mt-6 max-w-[46ch] text-lg text-fg-2 md:text-xl">{lead}</p>}
      {children}
    </header>
  );
}

export function SectionTitle({ id, number, children }: { id?: string; number?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="flex items-baseline gap-4 border-b border-line pb-3 text-2xl md:text-3xl">
      {number && <span className="label text-fg-3">{number}</span>}
      <span>{children}</span>
    </h2>
  );
}
