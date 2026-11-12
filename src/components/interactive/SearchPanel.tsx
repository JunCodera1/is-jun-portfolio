"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { search, type SearchEntry } from "@/lib/search";

export function SearchPanel({ entries }: { entries: SearchEntry[] }) {
  const t = useTranslations("search");
  const tt = useTranslations("translation");
  const locale = useLocale();
  // Deep link: /search?q=term. The URL is an external store (empty on the server); once the visitor types, their text wins.
  const urlQuery = useSyncExternalStore(
    (cb) => { window.addEventListener("popstate", cb); return () => window.removeEventListener("popstate", cb); },
    () => new URLSearchParams(window.location.search).get("q") ?? "",
    () => "",
  );
  const [typed, setTyped] = useState<string | null>(null);
  const q = typed ?? urlQuery;
  const setQ = setTyped;

  // Keep the URL in sync without a navigation (history.replaceState does not trigger a render).
  // Only after the visitor types: on hydration `q` is still the server value, and writing it would erase ?q=.
  useEffect(() => {
    if (typed === null) return;
    const url = new URL(window.location.href);
    if (typed) url.searchParams.set("q", typed); else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }, [typed]);

  const results = useMemo(() => search(entries, q, 50), [entries, q]);

  return (
    <div>
      <label htmlFor="site-search" className="label mb-2 block">{t("label")}</label>
      <input
        id="site-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("placeholder")}
        autoComplete="off"
        autoFocus
        className="h-14 w-full border border-line-strong bg-transparent px-4 text-xl text-fg outline-none placeholder:text-fg-3 focus:border-accent-fg"
      />
      <p className="label mt-3 min-h-5" role="status" aria-live="polite">
        {q.trim() ? (results.length ? t("results", { count: results.length }) : t("none", { query: q.trim() })) : t("idle")}
      </p>
      <ul className="mt-4 border-t border-line-strong">
        {results.map((r) => (
          <li key={r.id} className="border-b border-line">
            <Link href={r.href} className="index-row grid gap-x-6 gap-y-1 px-2 py-5 md:grid-cols-[8rem_1fr] md:px-4">
              <span className="label pt-1.5">{t(`types.${r.type}`)}</span>
              <span>
                <span lang={r.lang !== locale ? r.lang : undefined} className="block font-display text-2xl tracking-tight">{r.title}</span>
                {r.summary && <span lang={r.lang !== locale ? r.lang : undefined} className="mt-1 block max-w-[64ch] text-fg-2">{r.summary}</span>}
                {r.status !== "translated" && <span className="label mt-2 inline-block border border-line px-1.5 py-px text-[0.62rem]">{tt(r.status)}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
