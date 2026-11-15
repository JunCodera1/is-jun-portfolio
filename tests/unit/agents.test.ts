import { describe, expect, it, vi } from "vitest";
import { integrationMonitor, knowledgeOrganizer, translationAssistant } from "@/core/agents/catalog";
import { cancelTask, decideProposal, runTask, type AgentDef, type Proposal, type ToolDef } from "@/core/agents/runtime";
import { createTools } from "@/core/agents/tools";
import type { Health } from "@/core/integrations/sdk";
import { createMemoryStore } from "@/core/store";
import type { Item, Knowledge } from "@/lib/knowledge/types";

let n = 0;
const base = () => ({ store: createMemoryStore(), now: () => new Date("2026-11-15T12:00:00Z"), newId: () => `id-${++n}`, running: new Map<string, AbortController>() });
const tool = (name: string, action: ToolDef["action"], run: ToolDef["run"] = async () => "ok"): ToolDef => ({ name, action, run });
const agent = (level: 1 | 2 | 3 | 4, tools: string[], body: AgentDef["run"], allow?: string[]): AgentDef => ({ id: `a${level}`, name: "t", description: "t", level, tools, allow, run: body });
const audit = async (s: ReturnType<typeof createMemoryStore>) => (await s.tail("audit", 100)) as { action: string; outcome: string; actor: string }[];

describe("agent runtime: permission boundaries are enforced, and visible in the audit log", () => {
  it("level 1 (read-only) can read but not draft or write; denial fails the task and is audited", async () => {
    const d = base(); const write = vi.fn(async () => "x");
    const tools = new Map([tool("read", { kind: "read" }), tool("draft", { kind: "draft" }), tool("write", { kind: "write" }, write)].map((t) => [t.name, t]));
    const ok = await runTask(agent(1, ["read"], async (c) => { await c.call("read"); return "done"; }), { ...d, tools });
    expect(ok).toMatchObject({ status: "succeeded", summary: "done", steps: 1 });
    const bad = await runTask(agent(1, ["draft", "write"], async (c) => { await c.call("draft"); }), { ...d, tools });
    expect(bad.status).toBe("failed"); expect(bad.error).toContain("level 1 is read-only");
    const bad2 = await runTask(agent(1, ["write"], async (c) => { await c.call("write"); }), { ...d, tools });
    expect(bad2.status).toBe("failed"); expect(write).not.toHaveBeenCalled();
    expect((await audit(d.store)).filter((a) => a.outcome === "deny").map((a) => a.action)).toEqual(["tool:draft", "tool:write"]);
  });
  it("level 1 and 2 cannot propose in level 1; level 2 can draft proposals but never write", async () => {
    const d = base(); const tools = new Map([tool("write", { kind: "write" })].map((t) => [t.name, t]));
    const l1 = await runTask(agent(1, [], async (c) => { await c.propose({ kind: "link", title: "x", rationale: "r", evidence: [], dedupeKey: "k" }); }), { ...d, tools });
    expect(l1.status).toBe("failed");
    const l2 = await runTask(agent(2, [], async (c) => { await c.propose({ kind: "link", title: "x", rationale: "r", evidence: [], dedupeKey: "k" }); }), { ...d, tools });
    expect(l2.status).toBe("succeeded");
    const w = await runTask(agent(2, ["write"], async (c) => { await c.call("write"); }), { ...d, tools });
    expect(w.status).toBe("failed");
  });
  it("hard limits hold even at level 4 with everything allow-listed: publish, delete, credentials, irreversible external actions", async () => {
    const d = base(); const run = vi.fn(async () => "x");
    const list: ToolDef[] = [tool("pub", { kind: "publish" }, run), tool("del", { kind: "delete" }, run), tool("cred", { kind: "credentials" }, run), tool("ext", { kind: "external", irreversible: true }, run)];
    const tools = new Map(list.map((t) => [t.name, t]));
    for (const t of list) {
      const r = await runTask(agent(4, [t.name], async (c) => { await c.call(t.name); }, [t.name]), { ...d, tools });
      expect(r.status, t.name).toBe("failed");
    }
    expect(run).not.toHaveBeenCalled();
  });
  it("a tool that was not granted to the agent cannot be called, even if it exists", async () => {
    const d = base(); const tools = new Map([tool("read", { kind: "read" })].map((t) => [t.name, t]));
    const r = await runTask(agent(1, [], async (c) => { await c.call("read"); }), { ...d, tools });
    expect(r.status).toBe("failed"); expect(r.error).toContain("not granted");
  });
});

describe("agent runtime: approval flow", () => {
  it("level 3 writes are parked as a proposal, not executed; the owner's approval runs exactly that call; rejection never runs it", async () => {
    const d = base(); const write = vi.fn(async (a: { x: number }) => `wrote ${a.x}`);
    const tools = new Map([tool("write", { kind: "write" }, write as ToolDef["run"])].map((t) => [t.name, t]));
    const r = await runTask(agent(3, ["write"], async (c) => { await c.call("write", { x: 1 }); }), { ...d, tools });
    expect(r.status).toBe("awaiting-approval"); expect(write).not.toHaveBeenCalled();
    const [key] = await d.store.keys("proposal."); const p = (await d.store.get<Proposal>(key!))!;
    expect(p).toMatchObject({ kind: "action", status: "pending", action: { tool: "write", args: { x: 1 } } });
    // the same request again does not pile up duplicates
    await runTask(agent(3, ["write"], async (c) => { await c.call("write", { x: 1 }); }), { ...d, tools });
    expect(await d.store.keys("proposal.")).toHaveLength(1);
    const ok = await decideProposal(d.store, tools, p.id, "approve", d.now);
    expect(ok).toEqual({ ok: true, result: "wrote 1" }); expect(write).toHaveBeenCalledTimes(1);
    expect((await decideProposal(d.store, tools, p.id, "approve", d.now)).error).toBe("already_decided"); // not twice
    expect((await audit(d.store)).some((a) => a.actor === "owner" && a.action === "approve:action")).toBe(true);

    const r2 = await runTask(agent(3, ["write"], async (c) => { await c.call("write", { x: 2 }); }), { ...d, tools });
    const p2 = (await d.store.keys("proposal.")).map((k) => k);
    const pending = (await Promise.all(p2.map((k) => d.store.get<Proposal>(k)))).find((x) => x!.status === "pending")!;
    expect(r2.status).toBe("awaiting-approval");
    expect((await decideProposal(d.store, tools, pending.id, "reject", d.now)).ok).toBe(true); expect(write).toHaveBeenCalledTimes(1);
  });
  it("level 4 runs only allow-listed low-risk operations on its own; anything else waits for approval", async () => {
    const d = base(); const refresh = vi.fn(async () => "fresh"); const clear = vi.fn(async () => "cleared");
    const tools = new Map([tool("refresh", { kind: "operate", name: "refresh", lowRisk: true }, refresh), tool("clear", { kind: "operate", name: "clear", lowRisk: true }, clear)].map((t) => [t.name, t]));
    const a = agent(4, ["refresh", "clear"], async (c) => { await c.call("refresh"); await c.call("clear"); }, ["refresh"]);
    const r = await runTask(a, { ...d, tools });
    expect(refresh).toHaveBeenCalledTimes(1); expect(clear).not.toHaveBeenCalled(); expect(r.status).toBe("awaiting-approval");
  });
});

describe("agent runtime: bounded execution", () => {
  it("stops at the step cap instead of looping forever", async () => {
    const d = base(); const tools = new Map([tool("read", { kind: "read" })].map((t) => [t.name, t]));
    const r = await runTask(agent(1, ["read"], async (c) => { for (;;) await c.call("read"); }), { ...d, tools, maxSteps: 5 });
    expect(r.status).toBe("failed"); expect(r.error).toContain("step limit"); expect(r.steps).toBe(6);
  });
  it("times out a task that never finishes", async () => {
    const d = base();
    const r = await runTask(agent(1, [], () => new Promise(() => {})), { ...d, tools: new Map(), timeoutMs: 30 });
    expect(r.status).toBe("failed"); expect(r.error).toBe("timed out");
  });
  it("the owner can cancel a running task", async () => {
    const d = base();
    const p = runTask(agent(1, [], () => new Promise(() => {})), { ...d, tools: new Map() });
    await new Promise((r) => setTimeout(r, 10));
    const [id] = [...d.running.keys()];
    expect(cancelTask(d.running, id!)).toBe(true);
    const r = await p; expect(r.status).toBe("cancelled"); expect(d.running.size).toBe(0);
    expect(cancelTask(d.running, "nope")).toBe(false);
  });
  it("records an execution history with secrets redacted, and a final task record", async () => {
    const d = base(); const tools = new Map([tool("read", { kind: "read" })].map((t) => [t.name, t]));
    const r = await runTask(agent(1, ["read"], async (c) => { await c.call("read", { apiKey: "sk-abcdefghijklmnopqrstuv", q: "ok" }); }), { ...d, tools });
    const ev = (await d.store.tail("tasks", 50)) as { type: string; args?: Record<string, string> }[];
    expect(ev.map((e) => e.type)).toEqual(["started", "tool", "finished"]);
    expect(JSON.stringify(ev)).not.toContain("sk-abcdefghijklmnopqrstuv"); expect(ev[1]!.args!.q).toBe("ok");
    expect(await d.store.get(`task.${r.id}`)).toMatchObject({ status: "succeeded" });
  });
});

const item = (id: string, title: string, over: Partial<Item> = {}): Item => ({ id, kind: "note", title, summary: "", tags: ["python", "speech"], href: `/${id}`, source: "owner", provenance: { origin: "t" }, visibility: "public", authorship: "owner", status: "translated", lang: "en", ...over });
const kg = (items: Item[]): Knowledge => ({ items, edges: [] });
const toolsFor = (k: Knowledge, model = null as never, health: Health[] = []) => createTools({ knowledge: async () => k, knowledgeFor: async () => k, model, refreshHealth: async () => health, locales: ["en", "ja"] });

describe("shipped agents", () => {
  it("Knowledge Organizer proposes links with evidence, never reads restricted data, and does not duplicate proposals", async () => {
    const d = base();
    const k = kg([item("a", "Speech in Python"), item("b", "Python speech notes"), item("secret", "Python speech secret", { visibility: "restricted" }), item("c", "Cooking", { tags: ["food"] })]);
    const tools = toolsFor(k);
    const r1 = await runTask(knowledgeOrganizer, { ...d, tools });
    expect(r1).toMatchObject({ status: "succeeded" }); expect(r1.summary).toContain("1 new proposals");
    const ps = (await Promise.all((await d.store.keys("proposal.")).map((x) => d.store.get<Proposal>(x)))) as Proposal[];
    expect(ps).toHaveLength(1);
    expect(ps[0]).toMatchObject({ kind: "link", status: "pending", evidence: ["/a", "/b"] });
    expect(JSON.stringify(ps)).not.toContain("secret"); expect(ps[0]!.rationale).toContain("not a statement by the owner");
    await runTask(knowledgeOrganizer, { ...d, tools });
    expect(await d.store.keys("proposal.")).toHaveLength(1);
  });
  it("Translation Assistant reports gaps without a model, and with one attaches an AI draft flagged for human review (never published)", async () => {
    const d = base();
    const k = kg([item("x", "Hello", { status: "untranslated" })]);
    await runTask(translationAssistant(false), { ...d, tools: toolsFor(k) });
    const p0 = (await d.store.get<Proposal>((await d.store.keys("proposal."))[0]!))!;
    expect(p0.draft).toBeUndefined(); expect(p0.rationale).toContain("No AI model");
    const d2 = base();
    const model = { id: "fake", generate: async () => ({ text: "こんにちは", usage: { inputTokens: 1, outputTokens: 1 } }) };
    await runTask(translationAssistant(true), { ...d2, tools: toolsFor(k, model as never) });
    const p1 = (await d2.store.get<Proposal>((await d2.store.keys("proposal."))[0]!))!;
    expect(p1.draft).toEqual({ text: "こんにちは", authorship: "ai", reviewStatus: "needs-human-review" }); expect(p1.status).toBe("pending");
  });
  it("Integration Monitor (autonomous, one allow-listed operation) flags failing sources and completes without approval", async () => {
    const d = base();
    const health: Health[] = [{ id: "news.a", status: "ok", checkedAt: "", latencyMs: 1, attempts: 1, source: "live" }, { id: "news.b", status: "failed", checkedAt: "", latencyMs: 1, attempts: 3, source: "none", error: "503" }];
    const r = await runTask(integrationMonitor, { ...d, tools: toolsFor(kg([]), null as never, health) });
    expect(r.status).toBe("succeeded"); expect(r.summary).toContain("1 new flags");
    expect((await audit(d.store)).some((a) => a.action === "tool:integrations.refresh" && a.outcome === "allow")).toBe(true);
    const again = await runTask(integrationMonitor, { ...d, tools: toolsFor(kg([]), null as never, health) });
    expect(again.summary).toContain("0 new flags"); // same failure is not flagged twice
  });
});
