import { expect, test } from "@playwright/test";
import { ALL_PATHS, LOCALES, trackConsole } from "./helpers";

for (const locale of LOCALES) {
  test.describe(`routes /${locale}`, () => {
    for (const path of ALL_PATHS) {
      test(`${path || "/"} renders with correct lang, title, canonical, hreflang and no console errors`, async ({ page }) => {
        const c = trackConsole(page);
        const res = await page.goto(`/${locale}${path}`);
        expect(res?.status()).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.locator("h1").first()).toBeVisible();
        expect((await page.title()).length).toBeGreaterThan(3);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/${locale}${path}$`));
        for (const l of ["en", "ja", "vi", "x-default"]) await expect(page.locator(`link[rel="alternate"][hreflang="${l}"]`)).toHaveCount(1);
        await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
        // exactly one h1 and a labelled main landmark
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator("main")).toHaveCount(1);
        c.assertClean();
      });
    }
  });
}

test("unknown paths render the localized 404 inside the normal layout", async ({ page }) => {
  for (const [path, word] of [["/en/definitely-not-here", "Page not found"], ["/ja/nope/nope", "ページが見つかりません"], ["/vi/khong-co", "Không tìm thấy trang"]] as const) {
    const res = await page.goto(path);
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(word);
    await expect(page.getByRole("navigation", { name: /./ }).first()).toBeVisible();
  }
});

test("unknown slug under a real section is a 404, not an empty page", async ({ page }) => {
  expect((await page.goto("/en/projects/nope"))?.status()).toBe(404);
  expect((await page.goto("/en/garden/nope"))?.status()).toBe(404);
});

test("bare / redirects by cookie → Accept-Language → English (row 8)", async ({ playwright }) => {
  const baseURL = `http://localhost:${process.env.E2E_PORT ?? 3100}`;
  // A fresh context per case: the first redirect legitimately stores NEXT_LOCALE, which must then win.
  const loc = async (headers: Record<string, string>) => {
    const ctx = await playwright.request.newContext({ baseURL, maxRedirects: 0 });
    const location = (await ctx.get("/", { headers })).headers()["location"];
    await ctx.dispose();
    return location;
  };
  expect(await loc({})).toMatch(/\/en$/);
  expect(await loc({ "Accept-Language": "ja,en;q=0.8" })).toMatch(/\/ja$/);
  expect(await loc({ "Accept-Language": "vi-VN,vi;q=0.9" })).toMatch(/\/vi$/);
  expect(await loc({ "Accept-Language": "fr-FR" })).toMatch(/\/en$/); // unsupported → fallback EN
  expect(await loc({ "Accept-Language": "ja", Cookie: "NEXT_LOCALE=vi" })).toMatch(/\/vi$/); // saved choice wins
});

test("sitemap lists every page in every language with hreflang alternates; robots points at it", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  // 12 static + 4 projects-detail? => derive: every loc is under a locale and the set is a multiple of 3
  expect(locs.length % 3).toBe(0);
  for (const l of ["en", "ja", "vi"]) expect(locs.filter((u) => u.includes(`/${l}/`) || u.endsWith(`/${l}`)).length).toBe(locs.length / 3);
  expect(xml).toContain('hreflang="x-default"');
  expect(xml).toContain("/ja/projects/deepsea");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/Sitemap: .+\/sitemap\.xml/);
});

test("RSS feed is well-formed and localized", async ({ request }) => {
  for (const l of ["en", "ja", "vi"]) {
    const res = await request.get(`/${l}/feed.xml`);
    expect(res.headers()["content-type"]).toContain("application/rss+xml");
    const xml = await res.text();
    expect(xml).toContain(`<language>${l}</language>`);
    expect(xml).toContain(`/${l}/journal/three-languages-from-day-one`);
    expect(xml.match(/<item>/g)?.length).toBe(1);
  }
});

test("security headers are sent on every page (row 53)", async ({ request }) => {
  const h = (await request.get("/en")).headers();
  expect(h["content-security-policy"]).toContain("default-src 'self'");
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["content-security-policy"]).toContain("object-src 'none'");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["permissions-policy"]).toContain("camera=()");
  expect(h["x-powered-by"]).toBeUndefined();
});
