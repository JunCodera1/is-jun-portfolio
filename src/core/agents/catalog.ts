import type { Health } from "@/core/integrations/sdk";
import type { AgentDef } from "./runtime";

type Suggest = { a: { id: string; title: string; href: string; kind: string }; b: { id: string; title: string; href: string; kind: string }; shared: string[] }[];
type Gap = { locale: string; id: string; title: string; href: string; status: string }[];

/**
 * The shipped agents. Two draft proposals for the owner to review (assisted, level 2); one re-checks integration health
 * under the autonomous level for exactly one explicitly allow-listed, low-risk operation. None of them can change the site.
 */
export const knowledgeOrganizer: AgentDef = {
  id: "knowledge-organizer", name: "Knowledge Organizer", level: 2, tools: ["kg.suggest"],
  description: "Finds entries that share terms but are not linked, and proposes a link with its evidence. Nothing is written.",
  async run(ctx) {
    const found = (await ctx.call("kg.suggest")) as Suggest; let made = 0;
    for (const s of found) {
      const key = [s.a.id, s.b.id].sort().join("<>");
      if (await ctx.propose({ kind: "link", title: `Link “${s.a.title}” ↔ “${s.b.title}”`, rationale: `They share: ${s.shared.join(", ")}. This is a suggestion from word overlap, not a statement by the owner.`, evidence: [s.a.href, s.b.href], patch: `Add \`related: [${s.b.id.split(":").pop()}]\` to ${s.a.id} (or the reverse) if you agree.`, dedupeKey: `link:${key}` })) made++;
    }
    return `${found.length} candidates, ${made} new proposals`;
  },
};

export const translationAssistant = (haveModel: boolean): AgentDef => ({
  id: "translation-assistant", name: "Translation Assistant", level: 2, tools: haveModel ? ["i18n.coverage", "ai.draftTranslation"] : ["i18n.coverage"],
  description: "Lists what is not yet translated. With an AI model configured it also drafts a translation, marked AI-written and needing human review; drafts are never published.",
  async run(ctx) {
    const gaps = ((await ctx.call("i18n.coverage")) as Gap).filter((g) => g.locale !== "en").slice(0, 6); let made = 0;
    for (const g of gaps) {
      let draft: { text: string; authorship: "ai"; reviewStatus: "needs-human-review" } | undefined;
      if (haveModel) { const r = (await ctx.call("ai.draftTranslation", { title: g.title, summary: "", target: g.locale })) as { available: boolean; text?: string }; if (r.available && r.text) draft = { text: r.text, authorship: "ai", reviewStatus: "needs-human-review" }; }
      if (await ctx.propose({ kind: "translation", title: `${g.locale}: “${g.title}” is ${g.status === "untranslated" ? "English only" : "a draft"}`, rationale: draft ? "AI draft attached. It needs review by a native speaker before it is used." : "No AI model is configured, so only the gap is reported.", evidence: [g.href], draft, dedupeKey: `tr:${g.locale}:${g.id}` })) made++;
    }
    return `${gaps.length} gaps, ${made} new proposals`;
  },
});

export const integrationMonitor: AgentDef = {
  id: "integration-monitor", name: "Integration Monitor", level: 4, allow: ["integrations.refresh"], tools: ["integrations.refresh"],
  description: "Re-checks every connected source (the one operation it may run on its own) and flags sources that are failing.",
  async run(ctx) {
    const h = (await ctx.call("integrations.refresh")) as Health[]; let made = 0;
    for (const x of h.filter((y) => y.status === "failed" || y.status === "degraded"))
      if (await ctx.propose({ kind: "attention", title: `${x.id} is ${x.status}`, rationale: x.error ?? "no detail", evidence: [], dedupeKey: `health:${x.id}:${x.status}` })) made++;
    return `${h.length} checked, ${h.filter((y) => y.status === "ok").length} ok, ${made} new flags`;
  },
};
