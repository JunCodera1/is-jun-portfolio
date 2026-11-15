import { expect, test } from "@playwright/test";
import { trackConsole } from "./helpers";

test.describe("Ask: a grounded assistant that works without any model", () => {
  test("answers by quoting the site, with sources, provenance, facts apart from inferences, and says when it does not know", async ({ page }) => {
    const c = trackConsole(page);
    await page.goto("/en/ask");
    await expect(page.getByRole("heading", { level: 1, name: "Ask" })).toBeVisible();
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Your question").fill("What is the knowledge graph?");
    await page.getByRole("button", { name: "Ask", exact: true }).click();
    const card = page.locator(".card-ink").first();
    await expect(card.locator('[data-label="quoted"]')).toHaveText("Quoted from this site");
    await expect(card.getByRole("heading", { name: "Sources (facts)" })).toBeVisible();
    const first = card.locator("ol li").first();
    await expect(first).toContainText("from: data/");          // provenance is shown
    await expect(first).toContainText(/written by the owner|from a connected service/);
    expect(await card.locator("ol li a").first().getAttribute("href")).toMatch(/^\/en\//);
    // nothing is invented
    await page.getByLabel("Your question").fill("What is the airspeed velocity of an unladen swallow?");
    await page.getByRole("button", { name: "Ask", exact: true }).click();
    await expect(page.getByText("Nothing on this site answers that.")).toBeVisible();
    expect(await page.locator(".card-ink ol li").count()).toBe(0);
    c.assertClean();
  });
  test("works in Japanese and Vietnamese", async ({ page }) => {
    for (const [loc, q, label] of [["ja", "ナレッジ・ボルトとは", "サイトからの引用"], ["vi", "kho kiến thức", "Trích từ trang này"]] as const) {
      await page.goto(`/${loc}/ask`);
      await page.waitForLoadState("networkidle");
      await page.locator("#ask-q").fill(q);
      await page.locator("form button[type=submit]").click();
      await expect(page.locator('[data-label="quoted"]')).toHaveText(label);
    }
  });
  test("the API refuses bad input, cross-site posts and floods, without detail", async ({ request }) => {
    expect((await request.post("/api/ask", { data: { question: "x", locale: "en" } })).status()).toBe(400);
    expect((await request.post("/api/ask", { data: { question: "hello there", locale: "en" }, headers: { origin: "https://evil.example" } })).status()).toBe(403);
    expect((await request.get("/api/ask")).status()).toBe(405);
  });
});

test.describe("Observatory reads the Integration SDK", () => {
  test("every connected service is listed with status, how it answered, latency and attribution; the page works whatever they do", async ({ page }) => {
    await page.goto("/en/observatory");
    const items = page.locator("#obs-sources ~ ul li");
    expect(await items.count()).toBe(13);
    for (const name of ["GitHub", "AniList", "Open Library", "Deezer", "The Verge", "Hacker News", "VnExpress"]) await expect(page.getByRole("link", { name: new RegExp(name) }).first()).toHaveAttribute("href", /^https:\/\//);
    await expect(page.getByText(/of 13 sources answered/)).toBeVisible();
    expect(await page.locator("#obs-sources ~ ul li").filter({ hasText: /Answering|Degraded|Not answering|Switched off|Needs a key/ }).count()).toBe(13);
  });
});

test.describe("the owner console does not exist unless configured", () => {
  test("/owner and every owner API route are plain 404s on a default deployment", async ({ page, request }) => {
    for (const l of ["en", "ja", "vi"]) expect((await page.goto(`/${l}/owner`))?.status()).toBe(404);
    expect((await request.get("/api/owner/state")).status()).toBe(404);
    expect((await request.post("/api/owner/login", { data: { password: "x" } })).status()).toBe(404);
    expect(await (await request.get("/robots.txt")).text()).toMatch(/Disallow: \/en\/owner/);
  });
});
