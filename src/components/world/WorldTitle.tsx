/** Location banner: the page's h1, set on slanted slabs, plus a lead line. */
export function WorldTitle({ title, lead, tone = "red", art }: { title: string; lead?: string; tone?: "red" | "white"; art?: React.ReactNode }) {
  return (
    <header className="page relative pt-20 md:pt-24">
      {art && <div aria-hidden className="pointer-events-none absolute right-4 top-16 hidden md:block">{art}</div>}
      <h1 className="stage-title -rotate-2 text-[clamp(2.6rem,9vw,6.5rem)]">
        <span className={`slab slab-in ${tone === "red" ? "slab-red" : ""}`}>{title}</span>
      </h1>
      {lead && <p className="mt-6 max-w-[52ch] text-lg font-medium text-fg md:text-xl">{lead}</p>}
    </header>
  );
}
