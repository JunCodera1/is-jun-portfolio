/** Location banner: the page's h1, set on slanted slabs, plus a lead line. */
export function WorldTitle({ title, lead, tone = "red" }: { title: string; lead?: string; tone?: "red" | "white" }) {
  return (
    <header className="page pt-20 md:pt-24">
      <h1 className="stage-title -rotate-2 text-[clamp(2.6rem,9vw,6.5rem)]">
        <span className={`slab slab-in ${tone === "red" ? "slab-red" : ""}`}>{title}</span>
      </h1>
      {lead && <p className="mt-6 max-w-[52ch] text-lg font-medium text-fg md:text-xl">{lead}</p>}
    </header>
  );
}
