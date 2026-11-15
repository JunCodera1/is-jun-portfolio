import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { integrationMonitor, knowledgeOrganizer } from "@/core/agents/catalog";
import { createTools } from "@/core/agents/tools";
import { createLimiter } from "@/core/auth/ratelimit";
import { hashPassword, signSession } from "@/core/auth/owner";
import "@/core/integrations"; // registers the shipped adapters
import { resetState } from "@/core/integrations/sdk";
import type { OwnerContext } from "@/core/owner/context";
import { handleOwner } from "@/core/owner/handlers";
import { createMemoryStore } from "@/core/store";

const PASSWORD = "a long enough owner password";
const SECRET = "s".repeat(48);
let ctx: OwnerContext; let cookie = "";

const mkCtx = async (): Promise<OwnerContext> => ({
  secret: SECRET, passwordHash: await hashPassword(PASSWORD), secure: false, store: createMemoryStore(),
  tools: createTools({ knowledge: async () => ({ items: [], edges: [] }), model: null, refreshHealth: async () => [{ id: "x", status: "failed", checkedAt: "", latencyMs: 1, attempts: 3, source: "none", error: "503" }], locales: ["en"] }),
  agents: [knowledgeOrganizer, integrationMonitor], running: new Map(),
  loginIp: createLimiter({ max: 5, windowMs: 900_000 }), loginAll: createLimiter({ max: 30, windowMs: 3_600_000 }), actions: createLimiter({ max: 20, windowMs: 60_000 }), aiProvider: "extractive (no model)", budget: () => ({}),
});
const req = (method: string, path: string, body?: unknown, headers: Record<string, string> = {}) =>
  new Request(`https://site.test/api/owner/${path}`, { method, headers: { host: "site.test", "content-type": "application/json", ...(cookie ? { cookie } : {}), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
const hit = (method: string, path: string, body?: unknown, headers?: Record<string, string>) => handleOwner(req(method, path, body, headers), path.split("/"), ctx);
const login = async (pw = PASSWORD) => { const r = await hit("POST", "login", { password: pw }); const set = r.headers.get("set-cookie"); if (set) cookie = set.split(";")[0]!; return r; };

beforeAll(async () => { ctx = await mkCtx(); });
beforeEach(async () => { ctx = await mkCtx(); cookie = ""; resetState(); });

describe("owner API: login", () => {
  it("accepts the right password, sets an httpOnly SameSite=Strict cookie, and records it in the audit log (without the password)", async () => {
    const r = await login();
    expect(r.status).toBe(200);
    const set = r.headers.get("set-cookie")!; for (const a of ["HttpOnly", "SameSite=Strict", "Path=/"]) expect(set).toContain(a);
    expect(JSON.stringify(await ctx.store.tail("audit", 10))).not.toContain(PASSWORD);
    expect(((await ctx.store.tail("audit", 10)) as { action: string; outcome: string }[]).at(-1)).toMatchObject({ action: "login", outcome: "ok" });
  });
  it("rejects wrong, empty, non-string and oversized passwords with one generic 401, and never sets a cookie", async () => {
    let i = 0;
    for (const pw of ["wrong password here", "", 123, null, "x".repeat(500)] as unknown[]) { const r = await hit("POST", "login", { password: pw }, { "x-forwarded-for": `10.0.0.${++i}` }); expect(r.status).toBe(401); expect(await r.json()).toEqual({ error: "invalid_credentials" }); expect(r.headers.get("set-cookie")).toBeNull(); }
    expect((await hit("POST", "login", "not json" as never, { "content-type": "text/plain", "x-forwarded-for": "10.0.0.99" })).status).toBe(401);
  });
  it("locks a client out after 5 attempts per 15 minutes (even for the right password), with Retry-After", async () => {
    for (let i = 0; i < 5; i++) expect((await hit("POST", "login", { password: "wrong password here" }, { "x-forwarded-for": "1.2.3.4" })).status).toBe(401);
    const r = await hit("POST", "login", { password: PASSWORD }, { "x-forwarded-for": "1.2.3.4" });
    expect(r.status).toBe(429); expect(Number(r.headers.get("retry-after"))).toBeGreaterThan(0);
    expect((await hit("POST", "login", { password: PASSWORD }, { "x-forwarded-for": "5.6.7.8" })).status).toBe(200); // a different client is not locked
  });
  it("refuses cross-site login attempts", async () => { expect((await hit("POST", "login", { password: PASSWORD }, { origin: "https://evil.example" })).status).toBe(403); });
});

describe("owner API: everything else needs a valid session", () => {
  const ROUTES: [string, string][] = [["GET", "state"], ["GET", "export"], ["POST", "logout"], ["POST", "agents/knowledge-organizer/run"], ["POST", "tasks/x/cancel"], ["POST", "proposals/x/approve"], ["POST", "purge"], ["POST", "integrations/github.repos/disconnect"]];
  it("every route answers 401 without a session, and with a forged, expired or foreign-secret one", async () => {
    for (const [m, p] of ROUTES) expect((await hit(m, p, m === "POST" ? {} : undefined)).status, `${m} ${p}`).toBe(401);
    for (const bad of ["owner=garbage", `owner=${signSession(SECRET, -1000)}`, `owner=${signSession("z".repeat(48), 1000)}`]) { cookie = bad; expect((await hit("GET", "state")).status).toBe(401); }
  });
  it("state-changing requests also need a same-origin Origin, even with a valid session (CSRF)", async () => {
    await login();
    expect((await hit("POST", "agents/knowledge-organizer/run", {}, { origin: "https://evil.example" })).status).toBe(403);
    expect((await hit("POST", "purge", { confirm: "DELETE", what: "all" }, { origin: "https://evil.example" })).status).toBe(403);
    expect((await hit("POST", "agents/knowledge-organizer/run", {}, { origin: "https://site.test" })).status).toBe(200);
  });
  it("logout clears the cookie", async () => { await login(); const r = await hit("POST", "logout", {}); expect(r.headers.get("set-cookie")).toContain("Max-Age=0"); });
  it("unknown routes and ids are 404, not stack traces", async () => {
    await login();
    for (const [m, p] of [["GET", "nope"], ["POST", "agents/ghost/run"], ["POST", "tasks/ghost/cancel"], ["POST", "proposals/ghost/approve"], ["POST", "integrations/ghost/disconnect"]] as const) { const r = await hit(m, p, m === "POST" ? {} : undefined); expect(r.status, p).toBe(404); expect(JSON.stringify(await r.json())).not.toMatch(/stack|at /); }
  });
});

describe("owner API: agents, proposals, export, purge", () => {
  beforeEach(async () => { await login(); });
  it("runs an agent, shows tasks, proposals, audit and health in /state, and lets the owner decide a proposal", async () => {
    const run = await (await hit("POST", "agents/integration-monitor/run", {})).json();
    expect(run).toMatchObject({ agent: "integration-monitor", status: "succeeded", level: 4 });
    const st = await (await hit("GET", "state")).json();
    expect(st.agents.map((a: { id: string }) => a.id)).toEqual(["knowledge-organizer", "integration-monitor"]);
    expect(st.agents[1]).toMatchObject({ levelName: "autonomous" });
    expect(st.tasks[0]).toMatchObject({ id: run.id, status: "succeeded" });
    expect(st.proposals).toHaveLength(1); expect(st.proposals[0]).toMatchObject({ kind: "attention", status: "pending" });
    expect(st.audit.some((a: { action: string }) => a.action === "run-agent")).toBe(true);
    expect(JSON.stringify(st)).not.toMatch(/scrypt\$|ANTHROPIC|SESSION_SECRET/);
    const id = st.proposals[0].id;
    expect((await hit("POST", `proposals/${id}/approve`, {})).status).toBe(200);
    expect((await hit("POST", `proposals/${id}/approve`, {})).status).toBe(409); // cannot be decided twice
  });
  it("exports everything the console stores, as an attachment, without secrets", async () => {
    await hit("POST", "agents/integration-monitor/run", {});
    const r = await hit("GET", "export");
    expect(r.headers.get("content-disposition")).toContain("attachment");
    const dump = JSON.parse(await r.text());
    expect(Object.keys(dump.streams)).toEqual(expect.arrayContaining(["audit", "tasks"])); expect(Object.keys(dump.docs).some((k) => k.startsWith("proposal."))).toBe(true);
    expect(JSON.stringify(dump)).not.toMatch(/scrypt\$|owner password/i);
  });
  it("purge needs an explicit DELETE confirmation and a known target; it deletes what was asked and audits it", async () => {
    await hit("POST", "agents/integration-monitor/run", {});
    for (const body of [{}, { confirm: "yes", what: "all" }, { confirm: "DELETE", what: "everything" }, { confirm: "DELETE" }]) expect((await hit("POST", "purge", body)).status).toBe(400);
    expect((await ctx.store.keys("proposal.")).length).toBe(1);
    const r = await (await hit("POST", "purge", { confirm: "DELETE", what: "proposals" })).json();
    expect(r).toMatchObject({ ok: true, removed: 1 }); expect(await ctx.store.keys("proposal.")).toEqual([]); expect((await ctx.store.keys("task.")).length).toBe(1);
    expect(((await ctx.store.tail("audit", 50)) as { action: string }[]).some((a) => a.action === "purge")).toBe(true);
    await hit("POST", "purge", { confirm: "DELETE", what: "all" });
    expect(await ctx.store.keys("task.")).toEqual([]);
  });
  it("disconnecting an integration forgets its derived data and is audited", async () => {
    const r = await hit("POST", "integrations/github.repos/disconnect", {});
    expect(r.status).toBe(200); expect(await r.json()).toMatchObject({ ok: true });
    expect(((await ctx.store.tail("audit", 20)) as { action: string; resource?: string }[]).some((a) => a.action === "disconnect" && a.resource === "github.repos")).toBe(true);
  });
  it("owner actions are rate limited", async () => {
    let last = 200;
    for (let i = 0; i < 25; i++) last = (await hit("POST", "tasks/x/cancel", {})).status;
    expect(last).toBe(429);
  });
});

describe("owner console: fails closed", () => {
  it("the route is a 404 whenever the console is not configured (no password hash, no secret, or no writable disk)", async () => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({ env: {} }));
    vi.doMock("@/core/ai/runtime", () => ({ runtime: { model: null, budget: { snapshot: () => ({}) } } }));
    const { getOwnerContext } = await import("@/core/owner/context");
    expect(await getOwnerContext()).toBeNull();
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({ env: { OWNER_PASSWORD_HASH: "x".repeat(30), SESSION_SECRET: "y".repeat(40), DATA_DIR: "/proc/not-writable/x" } }));
    vi.doMock("@/core/ai/runtime", () => ({ runtime: { model: null, budget: { snapshot: () => ({}) } } }));
    const again = await import("@/core/owner/context");
    expect(await again.getOwnerContext()).toBeNull(); // misconfigured disk ⇒ off, not half-open
    vi.doUnmock("@/lib/env");
    vi.resetModules();
  });
});
