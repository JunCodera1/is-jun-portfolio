"use client";

import { Link } from "@/i18n/navigation";
import { useWorld } from "./WorldProvider";

/** A real link (works without JS, middle-click and new-tab keep working) that plays the shutter transition on a plain click. */
export function WorldLink({ href, children, className, onMouseEnter, onFocus, ...rest }: React.ComponentProps<typeof Link>) {
  const { go, sfx } = useWorld();
  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={(e) => { sfx("tick"); onMouseEnter?.(e); }}
      onFocus={(e) => { sfx("tick"); onFocus?.(e); }}
      onClick={(e) => {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        go(typeof href === "string" ? href : String(href));
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
