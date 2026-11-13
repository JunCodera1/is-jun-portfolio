"use client";

import { useEffect } from "react";
import { animate, reducedMotion, spring, stagger } from "@/lib/motion";
import { Parallax } from "@/components/motion/Parallax";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Mascot, Neko } from "@/components/ui/Art";
import { useWorld } from "./WorldProvider";

/** The title screen. Enter / Space / click starts. Nothing plays or moves unless the visitor chooses (sound is off by default). */
export function Entrance() {
  const t = useTranslations("entrance");
  const th = useTranslations("hud");
  const { go, soundOn, toggleSound, sfx } = useWorld();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.closest("a, button, input, select, textarea, [role=radio]"))) return; // let focused controls keep their own Enter/Space
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sfx("select"); go("/city"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, sfx]);

  // idle float for the characters (anime.js); still under reduced motion
  useEffect(() => {
    if (reducedMotion()) return;
    const slabs = animate(".title-slab", { translateX: [-90, 0], duration: 1000, delay: stagger(140), ease: spring({ stiffness: 130, damping: 13 }) });
    const rest = animate(".enter-rise", { translateY: [22, 0], duration: 700, delay: stagger(90, { start: 520 }), ease: "outQuart" });
    const a = animate(".float-a", { translateY: [0, -12], duration: 2600, alternate: true, loop: true, ease: "inOutSine" });
    const b = animate(".float-b", { translateY: [0, -7], duration: 1900, alternate: true, loop: true, ease: "inOutSine", delay: 400 });
    return () => { a.revert(); b.revert(); slabs.revert(); rest.revert(); };
  }, []);

  return (
    <section aria-labelledby="entrance-title" className="stage-entrance relative isolate flex min-h-dvh flex-col overflow-hidden bg-bg">
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-8">
        <p className="plate !text-sm">{t("kicker")}</p>
        <div className="border-2 border-outline bg-[#0a0a0c] text-white [&_a]:!text-white/70 [&_a[aria-current=true]]:!text-white"><LanguageSwitcher /></div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-4 pb-10 sm:px-8 lg:px-16">
        <h1 id="entrance-title" className="stage-title -rotate-3 text-[clamp(3.6rem,15vw,12rem)] leading-[1.02]">
          <span className="slab title-slab block w-fit text-[0.55em]">{t("w1")}</span>
          <span className="slab slab-red title-slab -mt-1 ml-[0.4em] block w-fit">{t("w2")}</span>
          <span className="slab title-slab ml-[0.9em] mt-1 block w-fit" style={{ ["--slab-bg" as string]: "#0a0a0c", ["--slab-fg" as string]: "#fff", ["--slab-shadow" as string]: "var(--fg)" }}>{t("w3")}</span>
        </h1>

        <p className="enter-rise mt-10 max-w-[34ch] text-lg font-medium text-fg md:text-xl">{t("lead")}</p>

        <div className="enter-rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <button type="button" className="stage-cta" onClick={() => { sfx("select"); go("/city"); }}>
            {t("start")} <span aria-hidden>▶</span>
          </button>
          <Link href="/classic" className="btn !border-2 !border-white !bg-[#0a0a0c] !text-white">{th("classic")}</Link>
          <p className="label blink !text-fg-2" aria-hidden>{t("press")}</p>
        </div>

        <div className="enter-rise mt-6 flex flex-wrap items-center gap-3 text-sm">
          <button type="button" className="link" aria-pressed={soundOn} onClick={toggleSound}>{th("sound")}: {soundOn ? th("on") : th("off")}</button>
        </div>
        <p className="enter-rise label mt-6 max-w-[60ch] !normal-case !tracking-normal">{t("hint")}</p>
      </div>

      <Parallax strength={20} className="pointer-events-none absolute bottom-0 right-[4%] z-10 hidden lg:block"><Mascot mood="wave" className="float-a h-[min(58vh,30rem)] w-auto" /></Parallax>
      <Parallax strength={34} className="pointer-events-none absolute bottom-3 right-[26%] z-10 hidden xl:block"><Neko className="float-b h-24 w-auto" /></Parallax>
    </section>
  );
}
