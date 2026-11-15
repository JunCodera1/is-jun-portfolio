import type { Health } from "@/core/integrations/sdk";
import type { LanguageModel } from "@/core/ai/provider";
import { readable, type Actor } from "@/core/policy";
import { suggestConnections, type Knowledge } from "@/lib/knowledge/types";
import type { ToolDef } from "./runtime";

/** Shared tools. Agents get only the ones they are granted; every tool filters what it returns by the calling actor's read rights. */
export interface ToolDeps { knowledge: () => Promise<Knowledge>; model: LanguageModel | null; refreshHealth: () => Promise<Health[]>; locales: readonly string[]; knowledgeFor?: (locale: string) => Promise<Knowledge> }

const visible = (k: Knowledge, actor: Actor): Knowledge => { const items = readable(actor, k.items); const ids = new Set(items.map((i) => i.id)); return { items, edges: k.edges.filter((e) => ids.has(e.from) && ids.has(e.to)) }; };

export function createTools(d: ToolDeps): Map<string, ToolDef> {
  const tools: ToolDef[] = [
    { name: "kg.read", action: { kind: "read" }, async run(args: { kinds?: string[] }, actor) { const k = visible(await d.knowledge(), actor); return k.items.filter((i) => !args.kinds || args.kinds.includes(i.kind)).map((i) => ({ id: i.id, kind: i.kind, title: i.title, href: i.href, visibility: i.visibility, authorship: i.authorship, status: i.status })); } },
    { name: "kg.suggest", action: { kind: "read" }, async run(_a: never, actor) { return suggestConnections(visible(await d.knowledge(), actor), 2, 8).map((s) => ({ a: { id: s.a.id, title: s.a.title, href: s.a.href, kind: s.a.kind }, b: { id: s.b.id, title: s.b.title, href: s.b.href, kind: s.b.kind }, shared: s.shared })); } },
    { name: "i18n.coverage", action: { kind: "read" }, async run(_a: never, actor) {
      const out: { locale: string; id: string; title: string; href: string; status: string }[] = [];
      for (const l of d.locales) { const k = visible(await (d.knowledgeFor ?? (() => d.knowledge()))(l), actor); for (const i of k.items) if (!["topic", "tech", "log", "event"].includes(i.kind) && i.status !== "translated") out.push({ locale: l, id: i.id, title: i.title, href: i.href, status: i.status }); }
      return out; } },
    { name: "ai.draftTranslation", action: { kind: "draft" }, async run(args: { title: string; summary: string; target: string }) {
      if (!d.model) return { available: false as const };
      const r = await d.model.generate({ system: "You translate short website text. Reply with the translation only, no commentary. Keep names and technical terms.", user: `Translate to ${args.target}:\n\nTitle: ${args.title}\nSummary: ${args.summary}`.slice(0, 1200), maxTokens: 300 });
      return { available: true as const, text: r.text.trim().slice(0, 1500) }; } },
    { name: "integrations.refresh", action: { kind: "operate", name: "integrations.refresh", lowRisk: true }, async run() { return d.refreshHealth(); } },
  ];
  return new Map(tools.map((t) => [t.name, t]));
}
