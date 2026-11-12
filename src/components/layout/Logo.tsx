import { Link } from "@/i18n/navigation";

/**
 * The monogram is drawn with CSS generated content (data-char → ::before) so it is not part of the link's
 * text: the accessible name is then exactly the visible wordmark (+ "Home"), satisfying WCAG 2.5.3 label-in-name.
 */
export function Logo({ monogram, label, name }: { monogram: string; label: string; name: string }) {
  return (
    <Link href="/" aria-label={label} className="group inline-flex items-center gap-3">
      <span
        aria-hidden
        data-char={monogram}
        className="relative grid h-9 w-9 place-items-center border border-line-strong font-display text-lg font-medium transition-colors before:content-[attr(data-char)] group-hover:border-fg"
      >
        <span className="absolute -bottom-[3px] -right-[3px] h-[7px] w-[7px] bg-accent" />
      </span>
      <span className="label sr-only !text-fg-2 sm:not-sr-only">{name}</span>
    </Link>
  );
}
