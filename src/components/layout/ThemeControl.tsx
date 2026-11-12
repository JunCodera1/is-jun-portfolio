"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { applyTheme, currentThemePref, syncSystemTheme, type ThemePref } from "@/lib/theme";
import { MonitorIcon, MoonIcon, SunIcon } from "@/components/ui/Icons";

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme-pref"] });
  return () => mo.disconnect();
}

export function ThemeControl({ className = "" }: { className?: string }) {
  const t = useTranslations("theme");
  // Server snapshot is "system"; the real value is read from <html> (set by the inline no-flash script).
  const pref = useSyncExternalStore(subscribe, currentThemePref, () => "system" as ThemePref);

  // While following the system, react to OS theme changes live.
  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => syncSystemTheme();
    onChange(); // resync once on mount: covers an OS change between the inline script and hydration (reads the real preference; never writes storage)
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  const options: { value: ThemePref; label: string; Icon: typeof SunIcon }[] = [
    { value: "system", label: t("system"), Icon: MonitorIcon },
    { value: "light", label: t("light"), Icon: SunIcon },
    { value: "dark", label: t("dark"), Icon: MoonIcon },
  ];

  return (
    <div role="radiogroup" aria-label={t("label")} className={`inline-flex border border-line ${className}`}>
      {options.map(({ value, label, Icon }) => {
        const checked = pref === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={label}
            title={label}
            onClick={() => applyTheme(value)}
            className={`tap grid h-9 w-9 place-items-center transition-colors ${
              checked ? "bg-accent text-accent-ink" : "text-fg-2 hover:text-fg"
            }`}
          >
            <Icon width={16} height={16} />
          </button>
        );
      })}
    </div>
  );
}
