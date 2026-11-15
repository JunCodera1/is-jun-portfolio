import type { Authorship, Visibility } from "@/lib/knowledge/types";

/**
 * The permission and policy engine: one pure function that decides whether an actor may perform an action on a resource.
 * Everything that reads, drafts, writes or operates — API routes, the AI runtime, agents — asks it first. It has no dependencies.
 */
export type AgentLevel = 1 | 2 | 3 | 4; // 1 read-only · 2 assisted · 3 approval-required · 4 autonomous (low-risk allow-list only)

export type Actor =
  | { type: "visitor" }
  | { type: "owner" }
  | { type: "agent"; id: string; level: AgentLevel; /** operations an autonomous agent may run without approval */ allow?: readonly string[] };

export type Action =
  | { kind: "read" }
  | { kind: "draft" }                                   // create a proposal or draft (private, authorship ai)
  | { kind: "write" }                                   // change stored or published state
  | { kind: "operate"; name: string; lowRisk: boolean } // e.g. refresh a cache, re-check health
  | { kind: "publish" } | { kind: "delete" } | { kind: "credentials" }
  | { kind: "external"; irreversible: boolean };

export interface Resource { visibility: Visibility; authorship: Authorship }
export interface Decision { allow: boolean; requires: "none" | "approval"; reason: string }

const deny = (reason: string): Decision => ({ allow: false, requires: "none", reason });
const allow = (reason: string): Decision => ({ allow: true, requires: "none", reason });
const needsApproval = (reason: string): Decision => ({ allow: true, requires: "approval", reason });

export const LEVEL_NAME: Record<AgentLevel, string> = { 1: "read-only", 2: "assisted", 3: "approval-required", 4: "autonomous" };

export function decide(actor: Actor, action: Action, resource?: Resource): Decision {
  switch (actor.type) {
    case "visitor":
      return action.kind === "read" && resource?.visibility === "public" ? allow("public data") : deny("visitors may only read public data");

    case "owner":
      // The owner is the authority. An AI-authored item still needs the owner's explicit act to be published, which this call represents.
      return allow("owner");

    case "agent": {
      // hard limits: no level, ever
      if (action.kind === "publish") return deny("agents never publish");
      if (action.kind === "delete") return deny("agents never delete data");
      if (action.kind === "credentials") return deny("agents never touch credentials");
      if (action.kind === "external" && action.irreversible) return deny("agents never take irreversible external actions");
      if (action.kind === "read" && resource?.visibility === "restricted") return deny("restricted data is never exposed to agents");

      switch (action.kind) {
        case "read": return allow("read within scope");
        case "draft": return actor.level >= 2 ? allow("drafts are private proposals") : deny("level 1 is read-only");
        case "write": return actor.level >= 3 ? needsApproval("writes need the owner's approval") : deny(`${LEVEL_NAME[actor.level]} agents cannot write`);
        case "external": return actor.level >= 3 ? needsApproval("external actions need approval") : deny(`${LEVEL_NAME[actor.level]} agents cannot act externally`);
        case "operate":
          if (actor.level < 3) return deny(`${LEVEL_NAME[actor.level]} agents cannot operate`);
          if (actor.level === 4 && action.lowRisk && (actor.allow ?? []).includes(action.name)) return allow("explicitly authorised low-risk operation");
          return needsApproval(action.lowRisk ? "operation is not on the autonomous allow-list" : "operation is not low-risk");
      }
    }
  }
}

/** Filter items down to what an actor may read. The single place read-access to collections is decided. */
export function readable<T extends Resource>(actor: Actor, items: readonly T[]): T[] {
  return items.filter((i) => decide(actor, { kind: "read" }, i).allow);
}
