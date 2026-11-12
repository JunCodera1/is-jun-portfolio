"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { runCommand, type TerminalData, type TLine } from "@/lib/terminal";

interface Entry { id: number; input: string; lines: TLine[] }

export function Terminal({ data }: { data: TerminalData }) {
  const t = useTranslations("terminal");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [entries]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = value;
    if (input.trim()) setHistory((h) => [...h, input]);
    const res = runCommand(input, data);
    if (res.clear) setEntries([]);
    else if (input.trim()) setEntries((prev) => [...prev, { id: idRef.current++, input, lines: res.lines }]);
    setValue("");
    setCursor(null);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next); setValue(history[next]!);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor === null) return;
      const next = cursor + 1;
      if (next >= history.length) { setCursor(null); setValue(""); } else { setCursor(next); setValue(history[next]!); }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault(); setEntries([]);
    }
  };

  const renderLine = (l: TLine, i: number) => {
    const content = l.href
      ? l.href.startsWith("/")
        ? <Link href={l.href} className="underline decoration-accent-fg underline-offset-4 hover:text-accent-fg">{l.text}</Link>
        : <a href={l.href} target="_blank" rel="noopener noreferrer" className="underline decoration-accent-fg underline-offset-4 hover:text-accent-fg">{l.text}</a>
      : l.text;
    return <div key={i} className="whitespace-pre-wrap break-words">{content || " "}</div>;
  };

  return (
    <div
      className="border border-line-strong bg-surface font-mono text-[0.85rem] leading-relaxed text-fg"
      onClick={(e) => { if ((e.target as HTMLElement).tagName !== "A") inputRef.current?.focus(); }}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <span className="label">{t("prompt")}</span>
        <span className="label">⌃L clear · ↑↓ history</span>
      </div>

      <div role="log" aria-live="polite" aria-label={t("outputLabel")} className="max-h-[60dvh] min-h-[22rem] overflow-y-auto px-4 py-4">
        <div className="text-fg-2">{t("welcome")}</div>
        {entries.map((en) => (
          <div key={en.id} className="mt-3">
            <div><span className="text-accent-fg">{t("prompt")}$</span> {en.input}</div>
            <div className="mt-1 text-fg-2">{en.lines.map(renderLine)}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-line px-4 py-3">
        <label htmlFor="terminal-input" className="shrink-0 text-accent-fg">
          <span className="sr-only">{t("inputLabel")}: </span>{t("prompt")}$
        </label>
        <input
          id="terminal-input"
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("hintPlaceholder")}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={80}
          className="w-full bg-transparent text-base text-fg outline-none placeholder:text-fg-3"
        />
      </form>
    </div>
  );
}
