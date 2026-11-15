import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/ask/route";
import { runtime } from "@/core/ai/runtime";
import { sameOrigin } from "@/core/auth/origin";

vi.mock("next-intl/server", async () => (await import("./helpers/intl-mock")).intlServerMock);

const call = (body: unknown, headers: Record<string, string> = {}, raw?: string) =>
  POST(new Request("https://site.test/api/ask", { method: "POST", headers: { "content-type": "application/json", host: "site.test", ...headers }, body: raw ?? JSON.stringify(body) }));
beforeEach(() => runtime.requests.reset());

describe("POST /api/ask contract", () => {
  it("answers with a grounded, structured body and no-store caching", async () => {
    const r = await call({ question: "What is the knowledge graph?", locale: "en" });
    expect(r.status).toBe(200); expect(r.headers.get("cache-control")).toBe("no-store");
    const a = await r.json();
    expect(Object.keys(a).sort()).toEqual(expect.arrayContaining(["confidence", "inferred", "label", "mode", "notices", "sources", "suggestions", "text"]));
    expect(["quoted", "none"]).toContain(a.label); // no model is configured in tests
    for (const s of a.sources) { expect(s.href).toMatch(/^\//); expect(s.origin.length).toBeGreaterThan(2); }
  });
  it("is localized: Japanese and Vietnamese questions search the matching corpus", async () => {
    const ja = await (await call({ question: "ナレッジ・ボルトとは", locale: "ja" })).json();
    expect(ja.sources.length).toBeGreaterThan(0);
    const vi = await (await call({ question: "kho kiến thức", locale: "vi" })).json();
    expect(vi.sources.length).toBeGreaterThan(0);
  });
  it("only ever returns public items: nothing private or restricted can appear in any answer", async () => {
    const a = await (await call({ question: "python typescript decision mistake research idea", locale: "en" })).json();
    expect(a.sources.every((s: { id: string }) => !s.id.startsWith("topic:"))).toBe(true);
  });
  it.each([
    ["missing body fields", { locale: "en" }, 400], ["too short", { question: "hi", locale: "en" }, 400], ["bad locale", { question: "hello there", locale: "fr" }, 400],
    ["too long", { question: "x".repeat(301), locale: "en" }, 400], ["wrong type", { question: 42, locale: "en" }, 400],
  ])("rejects %s with 400 and no detail", async (_n, body, status) => {
    const r = await call(body); expect(r.status).toBe(status); expect(await r.json()).toEqual({ error: "invalid_request" });
  });
  it("rejects malformed JSON, wrong content types, oversized bodies and cross-site origins", async () => {
    expect((await call(null, {}, "{nope")).status).toBe(400);
    expect((await call({ question: "hello there", locale: "en" }, { "content-type": "text/plain" })).status).toBe(415);
    expect((await call(null, {}, JSON.stringify({ question: "x".repeat(3000), locale: "en" }))).status).toBe(413);
    expect((await call({ question: "hello there", locale: "en" }, { origin: "https://evil.example" })).status).toBe(403);
    expect((await call({ question: "hello there", locale: "en" }, { origin: "https://site.test" })).status).toBe(200);
  });
  it("rate-limits a client with Retry-After, per IP", async () => {
    for (let i = 0; i < 30; i++) expect((await call({ question: "hello there", locale: "en" }, { "x-forwarded-for": "9.9.9.9" })).status).toBe(200);
    const r = await call({ question: "hello there", locale: "en" }, { "x-forwarded-for": "9.9.9.9" });
    expect(r.status).toBe(429); expect(Number(r.headers.get("retry-after"))).toBeGreaterThan(0);
    expect((await call({ question: "hello there", locale: "en" }, { "x-forwarded-for": "8.8.8.8" })).status).toBe(200);
  });
  it("never leaks internals in an error body", async () => {
    const r = await call({ question: "x", locale: "en" }); expect(JSON.stringify(await r.json())).not.toMatch(/stack|at \w+ \(|zod|path/i);
  });
});

describe("same-origin helper", () => {
  const req = (h: Record<string, string>) => new Request("https://a.test/x", { method: "POST", headers: h });
  it("allows no Origin, a matching Origin (also behind a proxy host header), and refuses mismatches and garbage", () => {
    expect(sameOrigin(req({ host: "a.test" }))).toBe(true);
    expect(sameOrigin(req({ host: "a.test", origin: "https://a.test" }))).toBe(true);
    expect(sameOrigin(req({ host: "internal:3000", "x-forwarded-host": "a.test", origin: "https://a.test" }))).toBe(true);
    expect(sameOrigin(req({ host: "a.test", origin: "https://b.test" }))).toBe(false);
    expect(sameOrigin(req({ host: "a.test", origin: "null" }))).toBe(false);
  });
});
