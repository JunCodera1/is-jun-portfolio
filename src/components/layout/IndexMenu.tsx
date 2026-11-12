"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { CloseIcon, MenuIcon } from "@/components/ui/Icons";
import { ThemeControl } from "./ThemeControl";

export interface MenuItem { id: string; href: string; label: string; desc?: string }

/** Full-screen index of every page. It is also the mobile menu. Native <dialog>: focus trap, Esc, inert background for free. */
export function IndexMenu({ items }: { items: MenuItem[] }) {
  const t = useTranslations();
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close when navigation happens.
  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  const show = () => { ref.current?.showModal(); setOpen(true); };
  const hide = () => ref.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t("common.openMenu")}
        className="tap inline-flex h-9 items-center gap-2 border border-line-strong px-3 font-mono text-[0.72rem] uppercase tracking-wider transition-colors hover:border-fg"
      >
        <MenuIcon width={16} height={16} />
        <span>{t("nav.menu")}</span>
      </button>

      <dialog
        ref={ref}
        aria-labelledby="index-menu-title"
        onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === ref.current) hide(); }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-bg p-0 text-fg"
      >
        <div className="page flex min-h-dvh flex-col pb-10">
          <div className="flex h-16 items-center justify-between border-b border-line">
            <h2 id="index-menu-title" className="label !text-fg-2">{t("nav.menuTitle")}</h2>
            <button type="button" onClick={hide} className="tap inline-flex h-9 items-center gap-2 border border-line-strong px-3 font-mono text-[0.72rem] uppercase tracking-wider hover:border-fg">
              <CloseIcon width={16} height={16} />
              <span>{t("nav.close")}</span>
            </button>
          </div>

          <nav aria-label={t("nav.menuTitle")} className="flex-1">
            <ol className="divide-y divide-line border-b border-line">
              {items.map((item, i) => (
                <li key={item.id}>
                  <Link href={item.href} onClick={hide} className="index-row grid grid-cols-[3rem_1fr] items-baseline gap-x-3 py-4 md:grid-cols-[5rem_1fr_1.4fr] md:py-5">
                    <span className="label">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-3xl tracking-tight md:text-5xl">{item.label}</span>
                    {item.desc && <span className="col-start-2 mt-1 text-sm text-fg-2 md:col-start-3 md:mt-0">{item.desc}</span>}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-8 flex items-center justify-between gap-4">
            <span className="label">{t("common.theme")}</span>
            <ThemeControl />
          </div>
        </div>
      </dialog>
    </>
  );
}
