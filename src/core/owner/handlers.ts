import { cancelTask, decideProposal, runTask, type Proposal, type TaskRecord } from "@/core/agents/runtime";
import { clearCookie, readCookie, cookieName, sessionCookie, signSession, verifyPassword, verifySession } from "@/core/auth/owner";
import { clientIp, sameOrigin } from "@/core/auth/origin";
import { clearIntegrationData, healthSnapshot, listIntegrations } from "@/core/integrations/sdk";
import { LEVEL_NAME } from "@/core/policy";
import { auditEntry } from "@/core/policy/audit";
import type { OwnerContext } from "./context";

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) => Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
const bad = (status: number, error: string, headers: Record<string, string> = {}) => json({ error }, status, headers);
const authed = (req: Request, c: OwnerContext) => verifySession(readCookie(req, cookieName(c.secure)), c.secret);
const audit = (c: OwnerContext, e: Parameters<typeof auditEntry>[0]) => c.store.append("audit", auditEntry(e));

async function readJson(req: Request): Promise<unknown | null> {
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) return null;
  const raw = await req.text();
  if (raw.length > 4096) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/** Single dispatcher for /api/owner/*. Every route: owner session required (except login), same-origin on POST, rate limited, audited, generic errors. */
export async function handleOwner(req: Request, segments: string[], c: OwnerContext): Promise<Response> {
  const [a, b, d] = segments;
  const post = req.method === "POST", get = req.method === "GET";
  const ip = clientIp(req);

  if (a === "login" && post && segments.length === 1) {
    if (!sameOrigin(req)) return bad(403, "forbidden");
    const lim = c.loginIp.check(ip), all = c.loginAll.check("all");
    if (!lim.ok || !all.ok) { await audit(c, { actor: `ip:${ip}`, action: "login", outcome: "deny", reason: "rate limited" }); return bad(429, "rate_limited", { "Retry-After": String(Math.ceil(Math.max(lim.retryAfterMs, all.retryAfterMs) / 1000)) }); }
    const body = (await readJson(req)) as { password?: unknown } | null;
    const ok = typeof body?.password === "string" && body.password.length > 0 && body.password.length < 200 && (await verifyPassword(body.password, c.passwordHash));
    await audit(c, { actor: `ip:${ip}`, action: "login", outcome: ok ? "ok" : "deny" });
    if (!ok) return bad(401, "invalid_credentials");
    return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(signSession(c.secret, 8 * 3600_000), c.secure) });
  }

  if (!authed(req, c)) return bad(401, "unauthorized");
  if (post && !sameOrigin(req)) return bad(403, "forbidden");
  if (post && !c.actions.check("owner").ok) return bad(429, "rate_limited");

  if (a === "logout" && post) { await audit(c, { actor: "owner", action: "logout", outcome: "ok" }); return json({ ok: true }, 200, { "Set-Cookie": clearCookie(c.secure) }); }

  if (a === "state" && get) {
    const tasks = (await Promise.all((await c.store.keys("task.")).map((k) => c.store.get<TaskRecord>(k)))).filter((t): t is TaskRecord => !!t).sort((x, y) => (x.startedAt < y.startedAt ? 1 : -1)).slice(0, 20);
    const proposals = (await Promise.all((await c.store.keys("proposal.")).map((k) => c.store.get<Proposal>(k)))).filter((p): p is Proposal => !!p).sort((x, y) => (x.createdAt < y.createdAt ? 1 : -1)).slice(0, 50);
    return json({
      agents: c.agents.map((x) => ({ id: x.id, name: x.name, description: x.description, level: x.level, levelName: LEVEL_NAME[x.level], tools: x.tools })),
      tasks, proposals, audit: (await c.store.tail("audit", 50)).reverse(), health: healthSnapshot(),
      integrations: listIntegrations().map((i) => ({ id: i.id, name: i.name, auth: i.auth.type, scopes: i.scopes, hosts: i.allowedHosts, privacy: i.privacy })),
      ai: { provider: c.aiProvider, budget: c.budget() },
    });
  }

  if (a === "agents" && d === "run" && post) {
    const def = c.agents.find((x) => x.id === b);
    if (!def) return bad(404, "not_found");
    await audit(c, { actor: "owner", action: "run-agent", resource: def.id, outcome: "ok" });
    return json(await runTask(def, { store: c.store, tools: c.tools, running: c.running }));
  }

  if (a === "tasks" && d === "cancel" && post) { const ok = !!b && cancelTask(c.running, b); await audit(c, { actor: "owner", action: "cancel-task", resource: b, outcome: ok ? "ok" : "error" }); return ok ? json({ ok: true }) : bad(404, "not_found"); }

  if (a === "proposals" && post && b && (d === "approve" || d === "reject")) {
    const r = await decideProposal(c.store, c.tools, b, d);
    return r.ok ? json({ ok: true }) : bad(r.error === "not_found" ? 404 : 409, r.error ?? "error");
  }

  if (a === "integrations" && d === "disconnect" && post && b) {
    if (!listIntegrations().some((i) => i.id === b)) return bad(404, "not_found");
    const n = clearIntegrationData(b);
    await audit(c, { actor: "owner", action: "disconnect", resource: b, outcome: "ok", meta: { removed: n } });
    return json({ ok: true, removed: n });
  }

  if (a === "export" && get) {
    await audit(c, { actor: "owner", action: "export", outcome: "ok" });
    return new Response(JSON.stringify(await c.store.dump(), null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="owner-data.json"', "Cache-Control": "no-store" } });
  }

  if (a === "purge" && post) {
    const body = (await readJson(req)) as { confirm?: unknown; what?: unknown } | null;
    if (body?.confirm !== "DELETE" || !["tasks", "proposals", "audit", "all"].includes(String(body.what))) return bad(400, "invalid_request");
    const what = String(body.what); let removed = 0;
    if (what === "tasks" || what === "all") { removed += await c.store.purge({ prefix: "task." }); removed += await c.store.purge({ stream: "tasks" }); }
    if (what === "proposals" || what === "all") removed += await c.store.purge({ prefix: "proposal." });
    await audit(c, { actor: "owner", action: "purge", resource: what, outcome: "ok", meta: { removed } }); // the audit log is purged last and only on request
    if (what === "audit" || what === "all") removed += await c.store.purge({ stream: "audit" });
    return json({ ok: true, removed });
  }

  return bad(404, "not_found");
}
