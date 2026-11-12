"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { locales, localeMeta, type Locale } from "@/i18n/routing";
import { applyTheme, type ThemePref } from "@/lib/theme";
import { normalize, search, type SearchEntry } from "@/lib/search";
import { SearchIcon, ArrowRight } from "@/components/ui/Icons";

export interface PalettePage { id: string; href: string; label: string; desc?: string }

type Group = "pages" | "content" | "actions";
interface Item {
  id: string;
  group: Group;
  label: string;
  hint?: string;
  badge?: string;
  lang?: string;
  run: () => void;
}

export const OPEN_PALETTE_EVENT = "open-command-palette";

export function CommandPalette({ pages, githubUrl }: { pages: PalettePage[]; githubUrl: string }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [remote, setRemote] = useState<SearchEntry[] | "error" | null>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => { setIsMac(/Mac|iPhone|iPad/.test(navigator.platform)); }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);
  const open = useCallback(() => {
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
  }, []);

  // Global shortcut (Ctrl/Cmd + K) and an event other components can dispatch.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const d = dialogRef.current;
        if (d?.open) d.close(); else open();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, open);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, open);
    };
  }, [open]);

  // Lazy-load the per-locale static search index the first time the palette opens.
  const loadIndex = useCallback(() => {
    if (remote !== null) return;
    fetch(`/${locale}/search-index.json`)
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<SearchEntry[]>; })
      .then(setRemote)
      .catch(() => setRemote("error"));
  }, [locale, remote]);

  const go = useCallback((href: string) => { close(); router.push(href); }, [close, router]);

  const pageEntries: SearchEntry[] = useMemo(
    () => pages.map((p) => ({ id: `page:${p.id}`, type: "page", title: p.label, summary: p.desc ?? "", tags: [], href: p.href, lang: locale, status: "translated" })),
    [pages, locale],
  );

  const actions: Item[] = useMemo(() => {
    const themeItems = (["system", "light", "dark"] as ThemePref[]).map<Item>((mode) => ({
      id: `theme:${mode}`, group: "actions",
      label: t("palette.theme", { mode: t(`theme.${mode}`) }),
      run: () => { close(); applyTheme(mode); },
    }));
    const langItems = locales.filter((l) => l !== locale).map<Item>((l) => ({
      id: `lang:${l}`, group: "actions",
      label: t("palette.language", { name: localeMeta[l].name }),
      run: () => { close(); router.replace(pathname, { locale: l }); },
    }));
    const github: Item = {
      id: "github", group: "actions", label: t("palette.github"), hint: "github.com",
      run: () => { close(); window.open(githubUrl, "_blank", "noopener,noreferrer"); },
    };
    return [...themeItems, ...langItems, github];
  }, [t, locale, close, router, pathname, githubUrl]);

  const items: Item[] = useMemo(() => {
    const q = query.trim();
    const toItem = (e: SearchEntry): Item => ({
      id: e.id,
      group: e.type === "page" ? "pages" : "content",
      label: e.title,
      hint: e.type === "page" ? e.summary : t(`search.types.${e.type}`),
      badge: e.status === "translated" ? undefined : t(`translation.${e.status}`),
      lang: e.lang !== locale ? e.lang : undefined,
      run: () => go(e.href),
    });
    if (!q) return [...pageEntries.map(toItem), ...actions];
    const corpus = remote && remote !== "error" ? remote : pageEntries;
    const hits = search(corpus, q, 12).map(toItem);
    const nq = normalize(q);
    const actionHits = actions.filter((a) => normalize(a.label).includes(nq));
    return [...hits, ...actionHits];
  }, [query, remote, pageEntries, actions, go, locale, t]);

  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (items.length ? (a + 1) % items.length : 0)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (items.length ? (a - 1 + items.length) % items.length : 0)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(Math.max(0, items.length - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); items[active]?.run(); }
  };

  const groupLabel: Record<Group, string> = {
    pages: t("palette.groupPages"), content: t("palette.groupContent"), actions: t("palette.groupActions"),
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-label={t("common.openPalette")}
        className="tap inline-flex h-9 items-center gap-2 border border-line-strong px-2.5 text-fg-2 transition-colors hover:border-fg hover:text-fg"
      >
        <SearchIcon width={16} height={16} />
        <span className="hidden font-mono text-[0.7rem] tracking-wider md:inline">{isMac ? "⌘K" : "Ctrl K"}</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={t("palette.title")}
        onClose={() => { setQuery(""); setActive(0); }}
        onToggle={(e) => { if ((e.target as HTMLDialogElement).open) loadIndex(); }}
        onClick={(e) => { if (e.target === dialogRef.current) close(); }}
        className="m-0 mx-auto mt-[8vh] max-h-[80dvh] w-[min(42rem,calc(100vw-1.5rem))] overflow-hidden border border-line-strong bg-surface p-0 text-fg"
      >
        <div className="flex max-h-[80dvh] flex-col">
          <div className="flex items-center gap-3 border-b border-line px-4">
            <SearchIcon width={18} height={18} className="shrink-0 text-fg-3" />
            <input
              autoFocus
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={items[active] ? `${listId}-${active}` : undefined}
              aria-label={t("palette.title")}
              placeholder={t("palette.placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              spellCheck={false}
              className="h-14 w-full bg-transparent text-base text-fg outline-none placeholder:text-fg-3"
            />
            <button type="button" onClick={close} className="label tap shrink-0 border border-line px-2 py-1 hover:border-fg-2">Esc</button>
          </div>

          <ul ref={listRef} id={listId} role="listbox" aria-label={t("palette.title")} className="overflow-y-auto py-2">
            {items.length === 0 && <li role="presentation" className="px-4 py-6 text-sm text-fg-2">{t("palette.empty")}</li>}
            {items.map((item, i) => {
              const showGroup = i === 0 || items[i - 1]!.group !== item.group;
              return (
                <li key={item.id} role="presentation">
                  {showGroup && <p className="label px-4 pb-1 pt-3">{groupLabel[item.group]}</p>}
                  <div
                    id={`${listId}-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={i === active}
                    onMouseMove={() => setActive(i)}
                    onClick={item.run}
                    lang={item.lang}
                    className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${i === active ? "bg-surface-2" : ""}`}
                  >
                    <ArrowRight width={14} height={14} className={`shrink-0 ${i === active ? "text-accent-fg" : "text-fg-3"}`} />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.badge && <span className="label border border-line px-1.5 py-px text-[0.62rem]">{item.badge}</span>}
                    {item.hint && <span className="label hidden max-w-[16rem] truncate sm:inline">{item.hint}</span>}
                  </div>
                </li>
              );
            })}
            {remote === "error" && query && <li role="presentation" className="px-4 py-3 text-xs text-fg-3">{t("palette.loadError")}</li>}
          </ul>

          <p className="label border-t border-line px-4 py-2.5">{t("palette.hint")}</p>
        </div>
      </dialog>
    </>
  );
}
