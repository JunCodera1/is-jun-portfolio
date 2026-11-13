import { concepts } from "./concepts";
import { decisions } from "./decisions";
import { glossary } from "./glossary";
import { ideas } from "./ideas";
import { learning } from "./learning";
import { mistakes } from "./mistakes";
import { reading } from "./reading";
import { research } from "./research";
import { roadmap } from "./roadmap";
import type { ModuleId } from "./types";

export * from "./types";
export { concepts, decisions, glossary, ideas, learning, mistakes, reading, research, roadmap };
export { STAGES } from "./ideas";

/** How many entries each module holds (shown on the hub). */
export const moduleCounts: Record<ModuleId, number> = {
  concepts: concepts.length, research: research.length, mistakes: mistakes.length, decisions: decisions.length, ideas: ideas.length,
  glossary: glossary.length, reading: reading.length, learning: learning.length, roadmap: roadmap.reduce((n, t) => n + t.steps.length, 0),
};
