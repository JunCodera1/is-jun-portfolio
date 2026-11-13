"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { staggerIn } from "@/lib/motion";

/** Wraps a list or grid; every descendant with `data-stagger` slides in one after another (anime.js). Re-runs when `watch` changes. */
export function Stagger({ as = "div", watch, className, children, ...rest }: { as?: "div" | "ul" | "ol" | "section"; watch?: string; className?: string; children: ReactNode } & React.AriaAttributes) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as as "div";
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const anim = staggerIn([...root.querySelectorAll("[data-stagger]")]);
    return () => { anim?.revert(); };
  }, [watch]);
  return <Tag ref={ref} className={className} {...rest}>{children}</Tag>;
}
