import { getTranslations } from "next-intl/server";
import { paths } from "@/content/data/graph";
import { projects } from "@/content/data/projects";
import { skills } from "@/content/data/skills";
import { getEntries } from "@/lib/content";
import { layoutGraph, type GEdge } from "@/lib/graph";
import { textOf } from "@/lib/localized";
import { initLocale, pageMetadata, type LocaleParams } from "@/lib/page";
import { PageHeader } from "@/components/ui/PageHeader";
import { KnowledgeGraph, type GraphNode } from "@/components/graph/KnowledgeGraph";

export const generateMetadata = ({ params }: { params: LocaleParams }) => pageMetadata(params, "graph", "/graph");

export default async function GraphPage({ params }: { params: LocaleParams }) {
  const locale = await initLocale(params);
  const t = await getTranslations({ locale, namespace: "graph" });
  const entries = [...getEntries("garden", locale), ...getEntries("journal", locale)];
  const nodes: GraphNode[] = [];
  const edges: GEdge[] = [];
  const edge = (from: string, to: string) => { if (!edges.some((e) => (e.from === from && e.to === to) || (e.from === to && e.to === from))) edges.push({ from, to }); };

  // learning paths (owner-editable data): a chain of steps
  for (const p of paths) {
    p.steps.forEach((s, i) => {
      nodes.push({ id: s.id, label: textOf(s.label, locale), kind: "path", href: s.href, summary: s.note ? textOf(s.note, locale) : undefined, lines: [textOf(p.title, locale)] });
      if (i > 0) edge(p.steps[i - 1]!.id, s.id);
    });
  }
  // notes: from the Markdown content, linked by their `related` field
  const noteId = (collection: string, id: string) => `n:${collection}/${id}`;
  for (const e of entries) nodes.push({ id: noteId(e.collection, e.id), label: e.title, kind: "note", href: `/${e.collection}/${e.id}`, summary: e.summary, lang: e.lang !== locale ? e.lang : undefined, lines: e.tags.map((x) => `#${x}`) });
  for (const e of entries) for (const r of e.related) { const other = entries.find((x) => x.id === r); if (other) edge(noteId(e.collection, e.id), noteId(other.collection, other.id)); }
  // projects → technologies: each link has evidence in the repository
  for (const p of projects) nodes.push({ id: `p:${p.slug}`, label: p.name, kind: "project", href: `/projects/${p.slug}`, summary: textOf(p.summary, locale) });
  for (const s of skills) {
    nodes.push({ id: `t:${s.name}`, label: s.name, kind: "tech", href: "/profile", summary: t(`categories.${s.category}`), lines: s.usedIn.map((u) => `${projects.find((p) => p.slug === u.slug)?.name ?? u.slug} — ${u.evidence}`) });
    for (const u of s.usedIn) edge(`p:${u.slug}`, `t:${s.name}`);
  }

  const pos = layoutGraph(nodes, edges);
  return (
    <div className="page pb-8">
      <PageHeader navId="graph" title={t("title")} lead={t("lead")} />
      <p className="label mt-6 !normal-case !tracking-normal">{t("note")}</p>
      <div id="graph-top" className="mt-8"><KnowledgeGraph nodes={nodes} edges={edges} pos={pos} /></div>
    </div>
  );
}
