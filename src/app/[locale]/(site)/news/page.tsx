import { getFormatter, getTranslations } from "next-intl/server";
import { getNews } from "@/lib/news-feed";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { NewsBoard, type BoardItem } from "@/components/news/NewsBoard";

export const revalidate = 1800;
export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "news", "/news");

export default async function NewsPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "news" });
  const f = await getFormatter({ locale });
  const { items, sources } = await getNews(10);
  const now = new Date();
  const board: BoardItem[] = items.slice(0, 90).map((n) => {
    const host = new URL(n.url).hostname.replace(/^www\./, "");
    const meta = [host, n.points !== undefined && t("points", { n: n.points }), n.comments !== undefined && t("comments", { n: n.comments }), n.time && f.relativeTime(new Date(n.time), now)].filter(Boolean).join(" · ");
    return { id: n.id, title: n.title, url: n.url, source: n.source ?? "", group: n.group, lang: n.lang, meta };
  });
  const okCount = sources.filter((s) => s.ok).length;
  return (
    <div className="page pb-8">
      <PageHeader navId="news" title={t("title")} lead={t("lead")} />
      <p className="label mt-6 !normal-case !tracking-normal">{t("note")}</p>
      <p className="label mt-1 !normal-case !tracking-normal">{t("sourcesOk", { ok: okCount, total: sources.length })}</p>
      <div className="mt-8">
        <NewsBoard
          items={board}
          labels={{
            all: t("all"), sources: t("sources"), empty: t("empty"), opensNewTab: t("opensNewTab"), shown: t("shown", { n: "{n}" }),
            groups: { world: t("groups.world"), dev: t("groups.dev"), ja: t("groups.ja"), vi: t("groups.vi") },
          }}
        />
      </div>
      <ul className="label mt-12 flex flex-wrap gap-x-4 gap-y-1 !normal-case !tracking-normal" aria-label={t("sources")}>
        {sources.map((s) => (<li key={s.id}>{s.name}{s.ok ? "" : ` (${t("down")})`}</li>))}
      </ul>
    </div>
  );
}
