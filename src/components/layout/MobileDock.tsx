"use client";

import { useEffect, useRef } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { animate, spring, reducedMotion } from "@/lib/motion";

export interface DockItem { href: string; label: string; glyph: string }

/** Thumb-reach navigation for phones. An ink bar springs (anime.js) under the active tab. Hidden from lg up, where the header nav is shown. */
export function MobileDock({ items, label }: { items: DockItem[]; label: string }) {
  const pathname = usePathname();
  const bar = useRef<HTMLSpanElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const first = useRef(true);
  const idx = items.findIndex((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));

  useEffect(() => {
    const b = bar.current, ul = list.current;
    if (!b || !ul || idx < 0) return;
    const li = ul.children[idx] as HTMLElement;
    const x = li.offsetLeft + li.offsetWidth * 0.2, w = li.offsetWidth * 0.6;
    b.style.width = `${w}px`;
    if (first.current || reducedMotion()) { b.style.transform = `translateX(${x}px)`; first.current = false; return; }
    animate(b, { translateX: x, duration: 600, ease: spring({ stiffness: 220, damping: 18 }) });
  }, [idx]);

  return (
    <nav aria-label={label} className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-outline bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
      <ul ref={list} className="relative grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((it, i) => (
          <li key={it.href}>
            <Link href={it.href} aria-current={i === idx ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[0.68rem] font-medium leading-tight ${i === idx ? "text-fg" : "text-fg-2"}`}>
              <span aria-hidden className="font-display text-lg leading-none">{it.glyph}</span>
              <span className="max-w-full truncate">{it.label}</span>
            </Link>
          </li>
        ))}
        <span ref={bar} aria-hidden className="pointer-events-none absolute left-0 top-0 h-[3px] bg-accent" style={{ opacity: idx < 0 ? 0 : 1 }} />
      </ul>
    </nav>
  );
}
