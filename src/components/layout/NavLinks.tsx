"use client";

import { Link, usePathname } from "@/i18n/navigation";

export function NavLinks({ items, label }: { items: { href: string; label: string }[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative isolate block px-4 py-2 text-[0.9rem] font-medium transition-colors ${
                  active ? "text-accent-ink" : "text-fg-2 hover:text-fg"
                }`}
              >
                {/* slanted selection plate: a skewed background layer (not clip-path), so the focus outline stays whole */}
                <span
                  aria-hidden
                  className={`absolute inset-0 -z-10 origin-left -skew-x-12 transition-transform duration-300 ease-out ${
                    active ? "scale-x-100 bg-accent" : "scale-x-0 bg-surface-2 group-hover:scale-x-100"
                  }`}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
