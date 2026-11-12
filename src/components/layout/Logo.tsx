import { Link } from "@/i18n/navigation";

export function Logo({ monogram, label, name }: { monogram: string; label: string; name: string }) {
  return (
    <Link href="/" aria-label={label} className="group inline-flex items-center gap-3">
      <span className="relative grid h-9 w-9 place-items-center border border-line-strong font-display text-lg font-medium transition-colors group-hover:border-fg">
        {monogram}
        <span aria-hidden className="absolute -bottom-[3px] -right-[3px] h-[7px] w-[7px] bg-accent" />
      </span>
      <span className="label hidden !text-fg-2 sm:inline">{name}</span>
    </Link>
  );
}
