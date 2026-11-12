import { Link } from "@/i18n/navigation";

/**
 * A hanko (red seal) monogram. The character is drawn with CSS generated content (data-char → ::before) so it is not
 * part of the link's text: the accessible name is then exactly the visible wordmark (+ "Home"), satisfying WCAG 2.5.3.
 */
export function Logo({ monogram, label, name }: { monogram: string; label: string; name: string }) {
  return (
    <Link href="/" aria-label={label} className="group inline-flex items-center gap-3">
      <span
        aria-hidden
        data-char={monogram}
        className="hanko grid h-10 w-10 place-items-center font-display text-xl font-bold transition-transform before:content-[attr(data-char)] group-hover:rotate-[4deg] group-hover:scale-105"
      />
      <span className="label sr-only !text-fg-2 sm:not-sr-only">{name}</span>
    </Link>
  );
}
