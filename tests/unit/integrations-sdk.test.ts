import { beforeEach, describe, expect, it } from "vitest";
import { HttpError, assertAllowedUrl, clearIntegrationData, healthSnapshot, resetState, runIntegration, type Deps, type Integration } from "@/core/integrations/sdk";

type Reply = { status?: number; body?: unknown; headers?: Record<string, string>; throws?: Error };
function harness(replies: Reply[], extra: Partial<Deps> = {}) {
  let t = 1_000_000; const slept: number[] = []; const calls: { url: string; headers: Headers }[] = [];
  const deps: Partial<Deps> = {
    now: () => t, sleep: async (ms) => { slept.push(ms); t += ms; }, random: () => 0, env: {}, timeoutMs: 50, maxAttempts: 3, maxWaitMs: 1500,
    fetch: (async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), headers: new Headers(init?.headers) });
      const r = replies.shift() ?? { status: 200, body: { ok: true } };
      if (r.throws) throw r.throws;
      if (init?.signal?.aborted) throw new DOMException("aborted", "AbortError");
      return new Response(JSON.stringify(r.body ?? {}), { status: r.status ?? 200, headers: r.headers });
    }) as typeof fetch,
    ...extra,
  };
  return { deps, slept, calls, advance: (ms: number) => { t += ms; } };
}
const make = (over: Partial<Integration<{ n: number }, { v: number }>> = {}): Integration<{ n: number }, { v: number }> => ({
  id: "test.svc", name: "Test", kind: "news", auth: { type: "none" }, scopes: ["public:read"], allowedHosts: ["api.example.com", ".cdn.example.org"],
  rateLimit: { max: 5, perMs: 1000 }, ttlMs: 60_000, attribution: { label: "Example", url: "https://example.com" }, privacy: "public-data", probe: { n: 1 },
  fetch: async (ctx, a) => ({ v: ((await ctx.getJson("https://api.example.com/x")) as { v?: number }).v ?? a.n }), ...over,
});
beforeEach(() => resetState());

describe("integration SDK: happy path, cache, fallback", () => {
  it("returns live data with a health record, then serves the cache within the ttl without calling the network", async () => {
    const h = harness([{ body: { v: 7 } }]);
    const a = await runIntegration(make(), { n: 1 }, h.deps);
    expect(a.data).toEqual({ v: 7 }); expect(a.health).toMatchObject({ status: "ok", source: "live", attempts: 1 });
    const b = await runIntegration(make(), { n: 1 }, h.deps);
    expect(b.health.source).toBe("cache"); expect(h.calls).toHaveLength(1);
    h.advance(61_000);
    const c = await runIntegration(make(), { n: 1 }, h.deps); // ttl expired → a real call again (the default reply)
    expect(c.health.source).toBe("live"); expect(h.calls).toHaveLength(2);
  });
  it("different arguments are cached separately", async () => {
    const h = harness([{ body: {} }, { body: {} }]);
    await runIntegration(make(), { n: 1 }, h.deps); await runIntegration(make(), { n: 2 }, h.deps);
    expect(h.calls).toHaveLength(2);
  });
  it("uses the fallback when the service is down (degraded, never throws), and fails cleanly without one", async () => {
    const down = Array.from({ length: 5 }, () => ({ status: 503 }));
    const withFb = await runIntegration(make({ fallback: () => ({ v: -1 }) }), { n: 1 }, harness([...down]).deps);
    expect(withFb.data).toEqual({ v: -1 }); expect(withFb.health).toMatchObject({ status: "degraded", source: "fallback" });
    resetState();
    const noFb = await runIntegration(make(), { n: 1 }, harness([...down]).deps);
    expect(noFb.data).toBeUndefined(); expect(noFb.health.status).toBe("failed"); expect(noFb.health.error).toContain("503");
  });
  it("serves stale cache (degraded) when a refresh fails", async () => {
    const h = harness([{ body: { v: 1 } }, { status: 500 }, { status: 500 }, { status: 500 }]);
    await runIntegration(make(), { n: 1 }, h.deps);
    h.advance(61_000);
    const r = await runIntegration(make(), { n: 1 }, h.deps);
    expect(r.data).toEqual({ v: 1 }); expect(r.health).toMatchObject({ status: "degraded", source: "cache" });
  });
});

describe("integration SDK: retry policy", () => {
  it("retries 5xx and network errors with backoff, then succeeds", async () => {
    const h = harness([{ status: 500 }, { throws: new TypeError("fetch failed") }, { body: { v: 3 } }]);
    const r = await runIntegration(make(), { n: 1 }, h.deps);
    expect(r.data).toEqual({ v: 3 }); expect(r.health.attempts).toBe(3); expect(h.slept).toEqual([200, 400]); expect(h.calls).toHaveLength(3);
  });
  it("honours Retry-After (capped) on 429", async () => {
    const h = harness([{ status: 429, headers: { "retry-after": "1" } }, { body: { v: 1 } }]);
    await runIntegration(make(), { n: 1 }, h.deps);
    expect(h.slept[0]).toBe(1000);
    resetState();
    const h2 = harness([{ status: 429, headers: { "retry-after": "60" } }, { body: {} }]);
    await runIntegration(make(), { n: 1 }, h2.deps);
    expect(h2.slept[0]).toBe(2000);
  });
  it("does not retry client errors (404/401)", async () => {
    const h = harness([{ status: 404 }]);
    const r = await runIntegration(make(), { n: 1 }, h.deps);
    expect(h.calls).toHaveLength(1); expect(r.health).toMatchObject({ status: "failed", attempts: 1 });
    expect(h.slept).toEqual([]); // no backoff for a client error
  });
  it("gives up after maxAttempts and times out hanging requests", async () => {
    const h = harness([], { fetch: ((_u: unknown, init?: RequestInit) => new Promise((_r, rej) => init!.signal!.addEventListener("abort", () => rej(new DOMException("t", "TimeoutError"))))) as typeof fetch, timeoutMs: 20 });
    const r = await runIntegration(make(), { n: 1 }, h.deps);
    expect(r.health.status).toBe("failed");
  });
});

describe("integration SDK: rate limiting", () => {
  it("waits for tokens when the bucket is empty, and refuses when the wait would be too long", async () => {
    const i = make({ rateLimit: { max: 2, perMs: 1000 }, fetch: async (ctx) => { await ctx.getJson("https://api.example.com/a"); await ctx.getJson("https://api.example.com/b"); await ctx.getJson("https://api.example.com/c"); return { v: 1 }; } });
    const h = harness([]);
    const r = await runIntegration(i, { n: 1 }, h.deps);
    expect(r.health.status).toBe("ok"); expect(h.slept.length).toBeGreaterThan(0);
    resetState();
    const slow = make({ rateLimit: { max: 1, perMs: 60_000 }, fetch: async (ctx) => { await ctx.getJson("https://api.example.com/a"); await ctx.getJson("https://api.example.com/b"); return { v: 1 }; } });
    const r2 = await runIntegration(slow, { n: 1 }, harness([]).deps);
    expect(r2.health.status).toBe("failed"); expect(r2.health.error).toContain("rate limit");
  });
});

describe("integration SDK: SSRF and URL safety", () => {
  it("allows only listed https hosts (exact or subdomain of a dotted entry)", () => {
    const hosts = ["api.example.com", ".cdn.example.org"];
    expect(assertAllowedUrl("https://api.example.com/x", hosts).hostname).toBe("api.example.com");
    expect(assertAllowedUrl("https://a.cdn.example.org/x", hosts).hostname).toBe("a.cdn.example.org");
    for (const bad of ["http://api.example.com/x", "https://evil.test/x", "https://api.example.com.evil.test/x", "https://user:pw@api.example.com/x", "https://cdn.example.org.evil.test/", "https://127.0.0.1/", "https://[::1]/", "https://localhost/", "file:///etc/passwd", "javascript:alert(1)", "not a url"]) expect(() => assertAllowedUrl(bad, hosts), bad).toThrow();
  });
  it("an adapter cannot reach a disallowed host, and the attempt is a failure that is not retried", async () => {
    const h = harness([]);
    const r = await runIntegration(make({ fetch: async (ctx) => (await ctx.getJson("https://169.254.169.254/latest/meta-data")) as { v: number } }), { n: 1 }, h.deps);
    expect(h.calls).toHaveLength(0); expect(r.health.status).toBe("failed"); expect(r.health.error).toContain("not allowed");
  });
  it("follows redirects only to allowed hosts", async () => {
    const ok = harness([{ status: 302, headers: { location: "https://a.cdn.example.org/y" } }, { body: { v: 9 } }]);
    expect((await runIntegration(make(), { n: 1 }, ok.deps)).data).toEqual({ v: 9 });
    resetState();
    const bad = harness([{ status: 302, headers: { location: "http://169.254.169.254/" } }]);
    const r = await runIntegration(make(), { n: 1 }, bad.deps);
    expect(r.health.status).toBe("failed"); expect(bad.calls).toHaveLength(1);
  });
});

describe("integration SDK: credentials, redaction, switches, disconnect", () => {
  it("needs-auth without a required key; optional keys are used when present and never leak into health or errors", async () => {
    const needs = await runIntegration(make({ auth: { type: "apiKey", env: "SVC_KEY" } }), { n: 1 }, harness([]).deps);
    expect(needs.health).toMatchObject({ status: "needs-auth", attempts: 0 });
    resetState();
    const h = harness([{ status: 401 }], { env: { SVC_KEY: "sk-supersecretvalue1234567890" } });
    const r = await runIntegration(make({ auth: { type: "apiKey", env: "SVC_KEY" } }), { n: 1 }, h.deps);
    expect(h.calls[0]!.headers.get("authorization")).toBe("Bearer sk-supersecretvalue1234567890");
    expect(JSON.stringify(r.health)).not.toContain("supersecret");
    resetState();
    const opt = harness([{ body: { v: 1 } }]);
    await runIntegration(make({ auth: { type: "apiKey", env: "SVC_KEY", optional: true } }), { n: 1 }, opt.deps);
    expect(opt.calls[0]!.headers.has("authorization")).toBe(false);
  });
  it("an error message that contains a token is redacted", async () => {
    const r = await runIntegration(make({ fetch: async () => { throw new Error("boom Authorization: Bearer abcdefghijklmnopqrstuvwxyz"); } }), { n: 1 }, harness([]).deps);
    expect(r.health.error).not.toContain("abcdefghijklmnop");
  });
  it("OAuth is declared but no flow is installed, so it reports needs-auth honestly", async () => {
    const r = await runIntegration(make({ auth: { type: "oauth2", scopes: ["read"] } }), { n: 1 }, harness([]).deps);
    expect(r.health.status).toBe("needs-auth"); expect(r.health.error).toContain("no flow");
  });
  it("the owner can switch an integration off with INTEGRATIONS_DISABLED", async () => {
    const h = harness([], { env: { INTEGRATIONS_DISABLED: "other, test.svc" } });
    const r = await runIntegration(make(), { n: 1 }, h.deps);
    expect(r.health.status).toBe("disabled"); expect(h.calls).toHaveLength(0);
  });
  it("disconnect forgets cached data and health", async () => {
    const h = harness([{ body: { v: 1 } }]);
    await runIntegration(make(), { n: 1 }, h.deps);
    expect(healthSnapshot()).toHaveLength(1);
    expect(clearIntegrationData("test.svc")).toBeGreaterThan(0);
    expect(healthSnapshot()).toHaveLength(0);
    await runIntegration(make(), { n: 1 }, harness([{ body: { v: 2 } }]).deps);
    expect(healthSnapshot()[0]!.source).toBe("live"); // not served from cache any more
  });
  it("HttpError exposes the status", () => { expect(new HttpError(418).status).toBe(418); });
});
