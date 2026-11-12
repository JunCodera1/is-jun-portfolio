import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { profile } from "@/content/data/profile";
import { formatDate } from "@/lib/format";
import type { RepoFeed } from "@/lib/github-feed";
import { LText } from "@/components/ui/LText";
import { Placeholder } from "@/components/ui/Placeholder";
import { ArrowRight } from "@/components/ui/Icons";
import { LocalClock } from "@/components/interactive/LocalClock";
import { Petals } from "@/components/ui/Petals";

const GREETINGS: { locale: Locale; text: string }[] = [
  { locale: "en", text: "Hello" },
  { locale: "ja", text: "こんにちは" },
  { locale: "vi", text: "Xin chào" },
];

/** Size the oversized name so any name — not only "Jun" — stays inside the viewport. */
function nameSize(name: string): string {
  const n = [...name].length;
  if (n <= 5) return "text-[clamp(6rem,26vw,23rem)]";
  if (n <= 9) return "text-[clamp(4.5rem,18vw,16rem)]";
  if (n <= 14) return "text-[clamp(3.25rem,12vw,11rem)]";
  return "text-[clamp(2.5rem,8vw,7rem)]";
}

export async function Hero({ locale, feed }: { locale: Locale; feed: RepoFeed }) {
  const t = await getTranslations({ locale, namespace: "home" });
  const latest = feed.repos[0];

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden border-b border-line">
      <div aria-hidden className="atmosphere absolute inset-0 -z-20" />
      <div aria-hidden className="bg-grid absolute inset-0 -z-10" />
      <div aria-hidden className="speed absolute inset-0 -z-10" />
      <div aria-hidden className="tone absolute -bottom-10 -right-10 -z-10 h-[55%] w-[55%] opacity-90 [mask-image:linear-gradient(to_top_left,#000,transparent_72%)]" />
      <Petals />
      {/* decorative: hand-lettered sound effect + vertical Japanese tagline (aria-hidden, skipped by screen readers) */}
      <span aria-hidden lang="ja" className="sfx pointer-events-none absolute right-[4%] top-[14%] -z-10 hidden rotate-[8deg] text-[clamp(7rem,16vw,15rem)] md:block">ドン</span>
      <span aria-hidden lang="ja" className="vtext absolute right-3 top-28 hidden text-sm lg:block">個人のデジタル空間</span>

      <div className="page pb-10 pt-8 md:pb-14 md:pt-12">
        <div className="flex items-start justify-between gap-6">
          <p className="label max-w-[28ch]">{t("eyebrow")}</p>
          <p className="label hidden text-right sm:block">{t("metaLine")}</p>
        </div>

        <h1
          id="hero-title"
          className={`name-pop relative mt-8 -ml-[0.05em] font-display leading-[0.8] tracking-[-0.055em] md:mt-12 ${nameSize(profile.displayName)}`}
        >
          {profile.displayName}
          <span aria-hidden className="text-accent-fg">.</span>
          <span aria-hidden className="reg absolute -right-1 top-3 hidden h-px w-px md:block" />
        </h1>

        <div className="mt-10 grid gap-10 md:mt-16 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="label mb-3">{t("greetingLabel")}</p>
            <ul className="flex flex-col items-start gap-6 pb-3 font-display text-2xl leading-[1.15] tracking-tight md:text-4xl">
              {GREETINGS.map((g, i) => {
                const active = g.locale === locale;
                return (
                  <li
                    key={g.locale}
                    lang={g.locale}
                    aria-current={active ? "true" : undefined}
                    className={`bubble ${active ? "" : "!text-fg-2"}`}
                    style={{ transform: `rotate(${[-2.5, 1.5, -1][i]}deg) translateX(${[0, 22, 6][i]}px)` }}
                  >
                    {g.text}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <p className="text-xl leading-snug text-fg md:text-2xl">
              <LText value={profile.tagline} locale={locale} />
            </p>
            <div className="mt-5 max-w-[52ch] text-fg-2">
              {profile.intro ? (
                <LText value={profile.intro} locale={locale} block />
              ) : (
                <Placeholder locale={locale} compact>{t("introPlaceholder")}</Placeholder>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#index" className="btn btn-primary">{t("ctaExplore")}<ArrowRight width={16} height={16} /></a>
              <Link href="/projects" className="btn">{t("ctaProjects")}</Link>
            </div>
          </div>
        </div>

        {/* Dashboard widgets (row 28): only data that is real — the visitor's clock and the cached GitHub feed. */}
        <dl className="mt-14 grid grid-cols-2 border-t border-line md:mt-20 md:grid-cols-4">
          <div className="border-b border-line py-4 pr-4 md:border-b-0">
            <dt className="label">{t("localTime")}</dt>
            <dd className="mt-1 font-display text-2xl"><LocalClock part="time" /></dd>
          </div>
          <div className="border-b border-line py-4 pr-4 md:border-b-0 md:border-l md:pl-5">
            <dt className="label">{t("today")}</dt>
            <dd className="mt-1 font-display text-2xl"><LocalClock part="date" /></dd>
          </div>
          <div className="col-span-2 py-4 md:border-l md:pl-5">
            <dt className="label">{t("lastPush")}</dt>
            <dd className="mt-1 font-display text-2xl">
              {latest ? (
                <>
                  <a href={latest.url} target="_blank" rel="noopener noreferrer" className="link">{latest.name}</a>
                  <span className="ml-3 font-mono text-sm text-fg-2">{formatDate(latest.pushedAt, locale, "short")}</span>
                </>
              ) : "—"}
            </dd>
            <dd className="label mt-1 !normal-case !tracking-normal">
              {feed.source === "live" ? t("pulseSourceLive") : t("pulseSourceSnapshot", { date: formatDate(feed.asOf, locale, "short") })}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
