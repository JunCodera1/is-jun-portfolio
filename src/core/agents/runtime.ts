import { decide, type Action, type Actor, type AgentLevel, type Resource } from "@/core/policy";
import { auditEntry, redact } from "@/core/policy/audit";
import type { Store } from "@/core/store";

/**
 * The agent runtime. An agent is a bounded task, not a loop with ambient authority: it receives named tools, every tool call is
 * checked by the policy engine and written to the audit log, steps and time are capped, tasks can be cancelled, and anything that
 * needs the owner's approval is parked as a proposal instead of being executed. Agents can draft; they can never publish, delete,
 * touch credentials or act irreversibly (the policy engine denies those at every level).
 */
export interface Proposal {
  id: string; agent: string; kind: "link" | "translation" | "attention" | "action"; title: string; rationale: string; evidence: string[];
  /** For humans to apply by hand: nothing in this release writes to the site's data files. */
  patch?: string;
  /** AI-written text is always flagged and never published automatically. */
  draft?: { text: string; authorship: "ai"; reviewStatus: "needs-human-review" };
  dedupeKey: string; status: "pending" | "approved" | "rejected"; createdAt: string; decidedAt?: string;
  action?: { tool: string; args: unknown };
}
export type TaskStatus = "running" | "succeeded" | "failed" | "cancelled" | "awaiting-approval";
export interface TaskRecord { id: string; agent: string; level: AgentLevel; status: TaskStatus; startedAt: string; finishedAt?: string; steps: number; summary?: string; error?: string }

export interface ToolDef { name: string; action: Action | ((args: never) => Action); resourceOf?: (args: never) => Resource | undefined; run(args: never, actor: Actor): Promise<unknown> }
export interface AgentCtx { call(tool: string, args?: unknown): Promise<unknown>; propose(p: Omit<Proposal, "id" | "agent" | "status" | "createdAt">): Promise<boolean>; signal: AbortSignal }
export interface AgentDef { id: string; name: string; description: string; level: AgentLevel; allow?: readonly string[]; tools: readonly string[]; run(ctx: AgentCtx): Promise<string | void> }

class PolicyDenied extends Error {}
class StepLimit extends Error {}
class AwaitingApproval extends Error {}

export interface RunDeps { store: Store; tools: ReadonlyMap<string, ToolDef>; now?: () => Date; newId?: () => string; maxSteps?: number; timeoutMs?: number; running?: Map<string, AbortController> }
export const defaultId = () => crypto.randomUUID();

export async function runTask(def: AgentDef, deps: RunDeps): Promise<TaskRecord> {
  const now = deps.now ?? (() => new Date()), newId = deps.newId ?? defaultId, maxSteps = deps.maxSteps ?? 20;
  const actor: Actor = { type: "agent", id: def.id, level: def.level, allow: def.allow };
  const task: TaskRecord = { id: newId(), agent: def.id, level: def.level, status: "running", startedAt: now().toISOString(), steps: 0 };
  const ctl = new AbortController();
  deps.running?.set(task.id, ctl);
  const signal = AbortSignal.any([ctl.signal, AbortSignal.timeout(deps.timeoutMs ?? 30_000)]);
  const event = (type: string, data: Record<string, unknown> = {}) => deps.store.append("tasks", { taskId: task.id, agent: def.id, ts: now().toISOString(), type, ...(redact(data) as object) });
  const audit = (action: string, outcome: "allow" | "deny" | "needs-approval" | "ok" | "error", reason?: string, meta?: Record<string, string | number | boolean | null>) =>
    deps.store.append("audit", auditEntry({ actor: `agent:${def.id}`, action, outcome, reason, meta: { task: task.id, ...meta } }, now()));
  await deps.store.set(`task.${task.id}`, task);
  await event("started", { level: def.level });

  const ctx: AgentCtx = {
    signal,
    async call(name, args = {}) {
      if (signal.aborted) throw signal.reason ?? new Error("aborted");
      if (++task.steps > maxSteps) throw new StepLimit(`step limit of ${maxSteps} reached`);
      const tool = deps.tools.get(name);
      if (!tool || !def.tools.includes(name)) { await audit(`tool:${name}`, "deny", "tool not granted to this agent"); throw new PolicyDenied(`tool not granted: ${name}`); }
      const action = typeof tool.action === "function" ? tool.action(args as never) : tool.action;
      const d = decide(actor, action, tool.resourceOf?.(args as never));
      if (!d.allow) { await audit(`tool:${name}`, "deny", d.reason); throw new PolicyDenied(`${name}: ${d.reason}`); }
      if (d.requires === "approval") {
        const p = await createProposal(deps.store, now, newId, def.id, { kind: "action", title: `Run ${name}`, rationale: d.reason, evidence: [], dedupeKey: `action:${name}:${JSON.stringify(args)}`, action: { tool: name, args } });
        await audit(`tool:${name}`, "needs-approval", d.reason, { proposal: p?.id ?? "existing" });
        throw new AwaitingApproval(name);
      }
      await audit(`tool:${name}`, "allow", d.reason);
      const out = await tool.run(args as never, actor);
      await event("tool", { tool: name, args });
      return out;
    },
    async propose(p) {
      const d = decide(actor, { kind: "draft" }, { visibility: "private", authorship: "ai" });
      if (!d.allow) { await audit("propose", "deny", d.reason); throw new PolicyDenied(`propose: ${d.reason}`); }
      const made = await createProposal(deps.store, now, newId, def.id, p);
      if (made) { await audit("propose", "allow", d.reason, { proposal: made.id }); await event("proposal", { id: made.id, title: made.title }); }
      return !!made;
    },
  };

  try {
    const abort = new Promise<never>((_, rej) => signal.addEventListener("abort", () => rej(signal.reason ?? new Error("aborted")), { once: true }));
    task.summary = (await Promise.race([def.run(ctx), abort])) ?? undefined;
    task.status = "succeeded";
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (e instanceof AwaitingApproval) { task.status = "awaiting-approval"; task.summary = `waiting for your approval: ${msg}`; }
    else if (ctl.signal.aborted) { task.status = "cancelled"; task.error = "cancelled by the owner"; }
    else { task.status = "failed"; task.error = (e instanceof DOMException && e.name === "TimeoutError") ? "timed out" : String(redact(msg)).slice(0, 300); }
  } finally { deps.running?.delete(task.id); }
  task.finishedAt = now().toISOString();
  await deps.store.set(`task.${task.id}`, task);
  await event("finished", { status: task.status, steps: task.steps, ...(task.error ? { error: task.error } : {}) });
  return task;
}

async function createProposal(store: Store, now: () => Date, newId: () => string, agent: string, p: Omit<Proposal, "id" | "agent" | "status" | "createdAt">): Promise<Proposal | null> {
  for (const k of await store.keys("proposal.")) { const x = await store.get<Proposal>(k); if (x && x.status === "pending" && x.dedupeKey === p.dedupeKey) return null; }
  const proposal: Proposal = { ...p, id: newId(), agent, status: "pending", createdAt: now().toISOString() };
  await store.set(`proposal.${proposal.id}`, proposal);
  return proposal;
}

export function cancelTask(running: Map<string, AbortController>, id: string): boolean { const c = running.get(id); if (!c) return false; c.abort(new Error("cancelled")); return true; }

/** The owner's decision on a proposal. Approving an `action` proposal runs that one tool call, with the owner as the authority. Everything is audited. */
export async function decideProposal(store: Store, tools: ReadonlyMap<string, ToolDef>, id: string, decision: "approve" | "reject", now: () => Date = () => new Date()): Promise<{ ok: boolean; error?: string; result?: unknown }> {
  const p = await store.get<Proposal>(`proposal.${id}`);
  if (!p) return { ok: false, error: "not_found" };
  if (p.status !== "pending") return { ok: false, error: "already_decided" };
  let result: unknown;
  if (decision === "approve" && p.kind === "action" && p.action) {
    const tool = tools.get(p.action.tool);
    if (!tool) return { ok: false, error: "tool_missing" };
    try { result = await tool.run(p.action.args as never, { type: "owner" }); } catch (e) { await store.append("audit", auditEntry({ actor: "owner", action: `approve:${p.action.tool}`, outcome: "error", reason: e instanceof Error ? e.message : "error" }, now())); return { ok: false, error: "tool_failed" }; }
  }
  p.status = decision === "approve" ? "approved" : "rejected"; p.decidedAt = now().toISOString();
  await store.set(`proposal.${id}`, p);
  await store.append("audit", auditEntry({ actor: "owner", action: `${decision}:${p.kind}`, resource: id, outcome: "ok" }, now()));
  return { ok: true, result };
}
