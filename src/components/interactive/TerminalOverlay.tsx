"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { TerminalData } from "@/lib/terminal";
import { Terminal } from "./Terminal";

export const OPEN_TERMINAL_EVENT = "open-terminal";

/** A terminal that opens over any page with the ` key (or a small button in the footer). Esc or "exit" closes it. */
export function TerminalOverlay({ data }: { data: TerminalData }) {
  const t = useTranslations("terminal");
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      d.querySelector<HTMLInputElement>("#terminal-input")?.focus(); // after showModal, which would otherwise focus the Esc button
    }
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return;
      if ((e.key === "`" || e.code === "Backquote") && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); setOpen((o) => !o); }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_TERMINAL_EVENT, onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener(OPEN_TERMINAL_EVENT, onOpen); };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={t("title")}
      onClose={() => setOpen(false)}
      onClick={(e) => { if (e.target === ref.current) setOpen(false); }}
      className="m-0 mx-auto mt-[8vh] w-[min(52rem,calc(100vw-1.5rem))] border-2 border-outline bg-surface p-0 text-fg shadow-[8px_8px_0_var(--accent)]"
    >
      {open && (
        <div>
          <div className="flex items-center justify-between bg-[#0a0a0c] px-4 py-2 text-white">
            <span className="label !text-white">{t("overlayTitle")}</span>
            <button type="button" className="tap border border-white/50 px-2 py-1 font-mono text-[0.7rem] uppercase tracking-wider hover:border-white" onClick={() => setOpen(false)}>Esc</button>
          </div>
          <Terminal data={data} onExit={() => setOpen(false)} />
        </div>
      )}
    </dialog>
  );
}

export function OpenTerminalButton({ className = "" }: { className?: string }) {
  const t = useTranslations("terminal");
  return (
    <button type="button" className={className} aria-haspopup="dialog" onClick={() => window.dispatchEvent(new Event(OPEN_TERMINAL_EVENT))}>
      <span aria-hidden>›_</span><span className="sr-only">{t("open")}</span>
    </button>
  );
}
