import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

describe("environment validation (row 53)", () => {
  it("uses the validated NEXT_PUBLIC_SITE_URL and strips trailing slashes", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://me.example/");
    vi.resetModules();
    const { siteUrl } = await import("@/lib/site");
    expect(siteUrl()).toBe("https://me.example");
  });
  it("falls back to the Vercel production domain, then to localhost", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "my-space.vercel.app");
    vi.resetModules();
    expect((await import("@/lib/site")).siteUrl()).toBe("https://my-space.vercel.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.resetModules();
    expect((await import("@/lib/site")).siteUrl()).toBe("http://localhost:3000");
  });
  it("fails loudly on a malformed URL instead of shipping a broken canonical", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "not a url");
    vi.resetModules();
    await expect(import("@/lib/env")).rejects.toThrow(/Invalid environment variables/);
  });
  it("treats an empty GITHUB_TOKEN as unset", async () => {
    vi.stubEnv("GITHUB_TOKEN", "");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.test");
    vi.resetModules();
    expect((await import("@/lib/env")).env.GITHUB_TOKEN).toBeUndefined();
  });
});
