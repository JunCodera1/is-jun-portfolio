import { concepts as conceptsAll } from "./concepts";
import { decisions as decisionsAll } from "./decisions";
import { glossary } from "./glossary";
import { ideas as ideasAll } from "./ideas";
import { learning } from "./learning";
import { mistakes as mistakesAll } from "./mistakes";
import { reading } from "./reading";
import { research as researchAll } from "./research";
import { roadmap } from "./roadmap";
import { isListed, type ModuleId } from "./types";

export * from "./types";
/**
 * What pages and public indexes see: only listed (public) entries. The unfiltered lists are exported as `*All` for the data layer,
 * which carries each entry's visibility so the owner console and agents (and nobody else) may read the private ones.
 */
export const concepts = conceptsAll.filter(isListed);
export const decisions = decisionsAll.filter(isListed);
export const ideas = ideasAll.filter(isListed);
export const mistakes = mistakesAll.filter(isListed);
export const research = researchAll.filter(isListed);
export { conceptsAll, decisionsAll, ideasAll, mistakesAll, researchAll, glossary, learning, reading, roadmap };
export { STAGES } from "./ideas";

/** How many entries each module holds (shown on the hub). */
export const moduleCounts: Record<ModuleId, number> = {
  concepts: concepts.length, research: research.length, mistakes: mistakes.length, decisions: decisions.length, ideas: ideas.length,
  glossary: glossary.length, reading: reading.length, learning: learning.length, roadmap: roadmap.reduce((n, t) => n + t.steps.length, 0),
};
