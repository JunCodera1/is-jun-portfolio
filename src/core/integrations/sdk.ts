import "server-only";
import { redact } from "@/core/policy/audit";

/**
 * Integration SDK. An integration is a small declaration plus one `fetch` function; everything operational lives here:
 * credential lookup (server env only), host allow-list (SSRF), timeouts, token-bucket rate limiting, retry with backoff,
 * caching, a fallback for outages, health records and secret redaction. Replacing or adding a service means writing one adapter file.
 */
export type AuthSpec = { type: "none" } | { type: "apiKey"; env: string; optional?: boolean; /** "manual": the adapter attaches the key itself (e.g. an x-api-key header) */ header?: "bearer" | "manual" } | { type: "oauth2"; scopes: string[] };
export type IntegrationKind = "development" | "media" | "news" | "knowledge" | "social";
export type Status = "ok" | "degraded" | "failed" | "disabled" | "needs-auth";

export interface Ctx { credential?: string; signal: AbortSignal; getJson(url: string, init?: RequestInit): Promise<unknown>; getText(url: string, init?: RequestInit): Promise<string> }

export interface Integration<A, T> {
  id: string; name: string; kind: IntegrationKind;
  auth: AuthSpec;
  /** What the integration asks of the remote service, in the service's own words ("public:read"). Shown to the owner. */
  scopes: readonly string[];
  /** Exact hosts, or ".example.com" for a domain and its subdomains. Nothing else may be contacted. */
  allowedHosts: readonly string[];
  rateLimit: { max: number; perMs: number };
  ttlMs: number;
  attribution: { label: string; url: string };
  privacy: "public-data" | "personal-data";
  meta?: Record<string, string>;
  /** Arguments for a cheap health probe. Omit for paid or quota-limited services: they are never probed, only measured when really used. */
  probe?: A;
  fetch(ctx: Ctx, args: A): Promise<T>;
  fallback?(args: A): T | undefined;
}

export interface Health { id: string; status: Status; checkedAt: string; latencyMs: number; attempts: number; source: "live" | "cache" | "fallback" | "none"; error?: string }
export interface RunResult<T> { data?: T; health: Health }

export class HttpError extends Error { constructor(public status: number, public retryAfterMs?: number) { super(`HTTP ${status}`); } }
export class BlockedError extends Error {}
export class RateLimitError extends Error {}

export interface Deps { now(): number; sleep(ms: number): Promise<void>; random(): number; env: Record<string, string | undefined>; fetch: typeof fetch; timeoutMs: number; maxAttempts: number; maxWaitMs: number }
export const realDeps = (): Deps => ({ now: () => Date.now(), sleep: (ms) => new Promise((r) => setTimeout(r, ms)), random: Math.random, env: process.env, fetch: (...a) => fetch(...a), timeoutMs: 6000, maxAttempts: 3, maxWaitMs: 1500 });

// ── state (per process) ──────────────────────────────────────────────────────────────────────────
const cache = new Map<string, { at: number; data: unknown }>();
const buckets = new Map<string, { tokens: number; at: number }>();
const healthById = new Map<string, Health>();
export const healthSnapshot = (): Health[] => [...healthById.values()].sort((a, b) => a.id.localeCompare(b.id));
export function resetState() { cache.clear(); buckets.clear(); healthById.clear(); }

/** Forget everything derived from an integration (cached data and health). The store-backed part is cleared by the caller. */
export function clearIntegrationData(id: string): number {
  let n = 0;
  for (const k of [...cache.keys()]) if (k.startsWith(`${id}\u0000`)) { cache.delete(k); n++; }
  buckets.delete(id);
  if (healthById.delete(id)) n++;
  return n;
}

// ── host allow-list ──────────────────────────────────────────────────────────────────────────────
export function assertAllowedUrl(raw: string, hosts: readonly string[]): URL {
  let u: URL;
  try { u = new URL(raw); } catch { throw new BlockedError("invalid URL"); }
  if (u.protocol !== "https:") throw new BlockedError("only https is allowed");
  if (u.username || u.password) throw new BlockedError("credentials in URLs are not allowed");
  const host = u.hostname.toLowerCase();
  const ok = hosts.some((h) => (h.startsWith(".") ? host === h.slice(1) || host.endsWith(h) : host === h));
  if (!ok) throw new BlockedError(`host not allowed: ${host}`);
  return u;
}

// ── token bucket ─────────────────────────────────────────────────────────────────────────────────
async function acquire(id: string, rl: { max: number; perMs: number }, d: Deps) {
  const b = buckets.get(id) ?? { tokens: rl.max, at: d.now() };
  const t = d.now();
  b.tokens = Math.min(rl.max, b.tokens + ((t - b.at) / rl.perMs) * rl.max);
  b.at = t;
  if (b.tokens < 1) {
    const wait = Math.ceil(((1 - b.tokens) / rl.max) * rl.perMs);
    if (wait > d.maxWaitMs) { buckets.set(id, b); throw new RateLimitError(`local rate limit (${rl.max}/${Math.round(rl.perMs / 1000)}s)`); }
    await d.sleep(wait);
    b.tokens = 0; b.at = d.now();
  } else b.tokens -= 1;
  buckets.set(id, b);
}

const retryable = (e: unknown) => e instanceof HttpError ? e.status === 429 || e.status >= 500 : !(e instanceof BlockedError || e instanceof RateLimitError);

function makeCtx<A, T>(i: Integration<A, T>, d: Deps, credential: string | undefined, outer: AbortSignal): Ctx {
  const manual = i.auth.type === "apiKey" && i.auth.header === "manual";
  const http = async (url: string, init: RequestInit = {}): Promise<Response> => {
    let target = assertAllowedUrl(url, i.allowedHosts);
    for (let hop = 0; hop < 4; hop++) {
      await acquire(i.id, i.rateLimit, d);
      const headers = new Headers(init.headers);
      if (!headers.has("User-Agent")) headers.set("User-Agent", "a-place-called-me/1.0");
      if (credential && manual === false && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${credential}`);
      const res = await d.fetch(target.toString(), { ...init, headers, redirect: "manual", signal: AbortSignal.any([outer, AbortSignal.timeout(d.timeoutMs)]), ...(typeof window === "undefined" ? { next: { revalidate: Math.max(1, Math.floor(i.ttlMs / 1000)) } } : {}) } as RequestInit);
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) { target = assertAllowedUrl(new URL(res.headers.get("location")!, target).toString(), i.allowedHosts); continue; }
      if (!res.ok) { const ra = Number(res.headers.get("retry-after")); throw new HttpError(res.status, Number.isFinite(ra) && ra > 0 ? ra * 1000 : undefined); }
      return res;
    }
    throw new BlockedError("too many redirects");
  };
  return { credential, signal: outer, getJson: async (u, init) => (await http(u, init)).json() as Promise<unknown>, getText: async (u, init) => (await http(u, init)).text() };
}

const health = (id: string, h: Omit<Health, "id" | "checkedAt">, d: Deps): Health => { const x: Health = { id, checkedAt: new Date(d.now()).toISOString(), ...h }; healthById.set(id, x); return x; };

/** Run an integration once, with every protection applied. Never throws: failures become health records (and a fallback when one exists). */
export async function runIntegration<A, T>(i: Integration<A, T>, args: A, deps: Partial<Deps> = {}, outer: AbortSignal = new AbortController().signal): Promise<RunResult<T>> {
  const d = { ...realDeps(), ...deps };
  const started = d.now();
  const key = `${i.id}\u0000${JSON.stringify(args)}`;
  const finish = (status: Status, source: Health["source"], attempts: number, error?: string, data?: T): RunResult<T> =>
    ({ data, health: health(i.id, { status, source, attempts, latencyMs: d.now() - started, ...(error ? { error: String(redact(error)).slice(0, 200) } : {}) }, d) });

  if ((d.env.INTEGRATIONS_DISABLED ?? "").split(",").map((s) => s.trim()).includes(i.id)) return finish("disabled", "none", 0, "disabled by the owner");

  let credential: string | undefined;
  if (i.auth.type === "apiKey") {
    credential = d.env[i.auth.env] || undefined;
    if (!credential && !i.auth.optional) return finish("needs-auth", "none", 0, `set ${i.auth.env} on the server`, i.fallback?.(args));
  } else if (i.auth.type === "oauth2") {
    return finish("needs-auth", "none", 0, "OAuth is part of the SDK contract but no flow is installed");
  }

  const hit = cache.get(key);
  if (hit && d.now() - hit.at < i.ttlMs) return finish("ok", "cache", 0, undefined, hit.data as T);

  const ctx = makeCtx(i, d, credential, outer);
  let last: unknown;
  let tried = 0;
  for (let attempt = 1; attempt <= d.maxAttempts; attempt++) {
    tried = attempt;
    try {
      const data = await i.fetch(ctx, args);
      cache.set(key, { at: d.now(), data });
      return finish("ok", "live", attempt, undefined, data);
    } catch (e) {
      last = e;
      if (outer.aborted || !retryable(e) || attempt === d.maxAttempts) break;
      const base = e instanceof HttpError && e.retryAfterMs ? Math.min(e.retryAfterMs, 2000) : 200 * 2 ** (attempt - 1);
      await d.sleep(base + Math.floor(d.random() * 100));
    }
  }
  const msg = last instanceof Error ? last.message : "unknown error";
  const fb = i.fallback?.(args);
  const stale = hit?.data as T | undefined;
  if (stale !== undefined) return finish("degraded", "cache", tried, `stale data: ${msg}`, stale);
  if (fb !== undefined) return finish("degraded", "fallback", tried, msg, fb);
  return finish("failed", "none", tried, msg);
}

// ── registry ─────────────────────────────────────────────────────────────────────────────────────
const registry = new Map<string, Integration<never, unknown>>();
export function defineIntegration<A, T>(i: Integration<A, T>): Integration<A, T> { registry.set(i.id, i as unknown as Integration<never, unknown>); return i; }
export const listIntegrations = () => [...registry.values()].sort((a, b) => a.id.localeCompare(b.id));
/** Probe every registered integration (cache-aware) and return fresh health. */
export async function refreshAll(deps: Partial<Deps> = {}): Promise<Health[]> {
  const probed = listIntegrations().filter((i) => (i as unknown as Integration<unknown, unknown>).probe !== undefined);
  const rs = await Promise.all(probed.map((i) => runIntegration(i as unknown as Integration<unknown, unknown>, (i as unknown as Integration<unknown, unknown>).probe, deps)));
  return rs.map((r) => r.health).sort((a, b) => a.id.localeCompare(b.id));
}
