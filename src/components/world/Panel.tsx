"use client";

import { useEffect, useId, useRef } from "react";
import { useTranslations } from "next-intl";
import { CloseIcon } from "@/components/ui/Icons";

/** A modal "dialogue panel" on a native <dialog>: focus trap, Esc to close, backdrop click, focus returns to the opener. */
export function Panel({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const t = useTranslations("hud");
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="stage-panel m-auto w-[min(44rem,calc(100vw-1.5rem))] max-h-[86dvh] overflow-y-auto border-2 border-outline bg-surface p-0 text-fg shadow-[8px_8px_0_var(--accent)]"
    >
      {open && (
        <div>
          <div className="relative flex items-start justify-between gap-4 bg-[#0a0a0c] px-5 py-4 text-white">
            <h2 id={id} className="stage-title text-3xl md:text-4xl">{title}</h2>
            <button type="button" onClick={onClose} className="tap inline-flex h-9 items-center gap-2 border border-white/50 px-3 font-mono text-[0.72rem] uppercase tracking-wider hover:border-white">
              <CloseIcon width={16} height={16} /><span>{t("close")}</span>
            </button>
          </div>
          <div className="p-5 md:p-7">{children}</div>
        </div>
      )}
    </dialog>
  );
}
