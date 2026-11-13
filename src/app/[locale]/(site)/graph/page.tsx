import { getTranslations } from "next-intl/server";
import { getKnowledge } from "@/lib/knowledge/build";
import { degree, type Edge, type Kind } from "@/lib/knowledge/types";
import { layoutGraph, type NodeKind } from "@/lib/graph";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { KnowledgeGraph, type GraphNode } from "@/components/graph/KnowledgeGraph";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "graph", "/graph");

const GRAPH_KIND: Partial<Record<Kind, NodeKind>> = { project: "project", tech: "tech", note: "note", post: "note", concept: "vault", research: "vault", mistake: "vault", decision: "vault", idea: "vault", path: "path", topic: "topic" };

/** The knowledge graph is a view of the unified data layer: same items, same edges, same evidence as search, the timeline and the feeds. */
export default async function GraphPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "graph" });
  const k = await getKnowledge(locale);
  const shown = k.items.filter((i) => GRAPH_KIND[i.kind]);
  const ids = new Set(shown.map((i) => i.id));
  const edges: Edge[] = k.edges.filter((e) => ids.has(e.from) && ids.has(e.to));
  const titleOf = new Map(k.items.map((i) => [i.id, i.title]));

  const nodes: GraphNode[] = shown.map((i) => {
    const kind = GRAPH_KIND[i.kind]!;
    const lines = i.kind === "tech"
      ? k.edges.filter((e) => e.kind === "uses" && e.to === i.id).map((e) => `${titleOf.get(e.from)} \u2014 ${e.evidence}`)
      : i.tags.slice(0, 5).map((x) => (kind === "note" ? `#${x}` : x));
    return { id: i.id, label: i.title, kind, href: i.href, summary: i.kind === "tech" ? t(`categories.${i.tags[0]}`) : i.summary, lines, lang: i.lang !== locale ? i.lang : undefined, deg: degree(i.id, edges), date: i.date, origin: i.provenance.origin };
  });
  const pos = layoutGraph(nodes.map((n) => ({ id: n.id, label: n.label, big: (n.deg ?? 0) >= 5 })), edges);
  return (
    <div className="page pb-8">
      <PageHeader navId="graph" title={t("title")} lead={t("lead")} />
      <p className="label mt-6 !normal-case !tracking-normal">{t("note")}</p>
      <div id="graph-top" className="mt-8"><KnowledgeGraph nodes={nodes} edges={edges} pos={pos} /></div>
    </div>
  );
}
