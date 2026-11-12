"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { DISCOVERIES, type DiscoveryId } from "@/content/data/world";
import { playSfx, type Sfx } from "@/lib/sfx";
import { progressStore, soundStore } from "@/lib/world-store";

interface WorldCtx {
  go: (href: string) => void;
  sfx: (name: Sfx) => void;
  soundOn: boolean;
  toggleSound: () => void;
  discovered: readonly string[];
  discover: (id: DiscoveryId) => void;
}
const Ctx = createContext<WorldCtx | null>(null);
/** Null outside the world (e.g. the same games rendered on the classic /play page). */
export const useWorldOptional = () => useContext(Ctx);
export const useWorld = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWorld must be used inside <WorldProvider>");
  return v;
};

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function WorldProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("discoveries");
  const router = useRouter();
  const pathname = usePathname();
  const discovered = useSyncExternalStore(progressStore.subscribe, progressStore.get, progressStore.server);
  const soundOn = useSyncExternalStore(soundStore.subscribe, soundStore.get, soundStore.server);
  const [toast, setToast] = useState<{ n: number; id: DiscoveryId } | null>(null);

  // ── page transition: the shutter masks the swap; navigation itself is never delayed ──
  const [phase, setPhase] = useState<"idle" | "cover" | "reveal">("idle");
  const [prev, setPrev] = useState(pathname);
  if (prev !== pathname) {
    setPrev(pathname);
    if (phase === "cover") setPhase("reveal");
  }
  useEffect(() => {
    if (phase !== "cover") return;
    const id = setTimeout(() => setPhase("reveal"), 2500); // navigation failed or stalled: never leave the screen covered
    return () => clearTimeout(id);
  }, [phase]);

  const sfx = useCallback((n: Sfx) => { if (soundStore.get()) playSfx(n); }, []);
  const go = useCallback((href: string) => {
    sfx("whoosh");
    if (!reduced()) setPhase("cover");
    router.push(href);
  }, [router, sfx]);

  // ↑ ↑ ↓ ↓ ← → ← → B A  opens Backstage
  useEffect(() => {
    const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = k === code[i] ? i + 1 : k === code[0] ? 1 : 0;
      if (i === code.length) { i = 0; sfx("success"); go("/backstage"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, sfx]);

  const discover = useCallback((id: DiscoveryId) => {
    const cur = progressStore.get();
    if (cur.includes(id) || !(DISCOVERIES as readonly string[]).includes(id)) return;
    progressStore.set([...cur, id]);
    setToast((x) => ({ n: (x?.n ?? 0) + 1, id }));
    sfx("success");
  }, [sfx]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3400);
    return () => clearTimeout(id);
  }, [toast]);

  const toggleSound = useCallback(() => {
    const next = !soundStore.get();
    soundStore.set(next);
    if (next) playSfx("select");
  }, []);

  const value = useMemo<WorldCtx>(() => ({ go, sfx, soundOn, toggleSound, discovered, discover }), [go, sfx, soundOn, toggleSound, discovered, discover]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="shutter" data-phase={phase} aria-hidden>
        <i />
        <i onAnimationEnd={() => { if (phase === "reveal") setPhase("idle"); }} />
      </div>
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[90] -translate-x-1/2 px-4" role="status" aria-live="polite">
        {toast && (
          <p key={toast.n} className="toast-pop plate !text-base">
            <span aria-hidden className="mr-2 text-accent-fg">★</span>{t("found", { name: t(`items.${toast.id}`) })}
          </p>
        )}
      </div>
    </Ctx.Provider>
  );
}
