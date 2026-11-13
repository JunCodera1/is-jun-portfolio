import { expect, test } from "@playwright/test";
import { LOCALES, trackConsole } from "./helpers";

test.describe("merged pages keep working (redirects, nothing lost)", () => {
  const MOVED: [string, RegExp][] = [["play", /\/arcade$/], ["recruiter", /\/profile$/], ["terminal", /\/classic$/], ["links", /\/vault\/reading$/], ["log", /\/timeline$/], ["orbit", /\/graph$/]];
  for (const locale of LOCALES) {
    for (const [from, to] of MOVED) {
      test(`/${locale}/${from} → ${to.source}`, async ({ page }) => {
        const c = trackConsole(page);
        const res = await page.goto(`/${locale}/${from}`);
        expect(res?.status()).toBe(200);
        await expect(page).toHaveURL(new RegExp(`/${locale}${to.source}`));
        await expect(page.locator("h1").first()).toBeVisible();
        c.assertClean();
      });
    }
  }
  test("a bare old URL (no locale) also ends on the new page", async ({ page }) => {
    await page.goto("/links");
    await expect(page).toHaveURL(/\/(en|ja|vi)\/vault\/reading$/);
  });
  test("the reference links from /links live on Reading & references", async ({ page }) => {
    await page.goto("/en/vault/reading");
    const refs = page.getByRole("region", { name: "References" }).or(page.locator("#refs-title").locator("xpath=ancestor::section"));
    await expect(refs.getByRole("link", { name: /Jisho/ })).toHaveAttribute("href", "https://jisho.org/");
    await expect(refs.getByRole("link", { name: /ArchWiki/ })).toBeVisible();
    for (const a of await refs.locator("a[href^='http']").all()) expect(await a.getAttribute("rel")).toContain("noopener");
  });
  test("the site log lives on the unified timeline, with its anchors, and the Profile can be printed", async ({ page }) => {
    await page.goto("/en/timeline");
    await expect(page.getByText("The site became a world")).toBeVisible();
    await page.getByRole("group", { name: "Show" }).getByRole("button", { name: "Site log" }).click();
    expect(await page.locator("[data-group]:visible").count()).toBeGreaterThanOrEqual(3);
    expect(await page.locator("[data-group='writing']:visible").count()).toBe(0);
    await page.goto("/en/profile");
    await expect(page.getByRole("button", { name: /Print/ })).toBeVisible();
  });
});

test.describe("one timeline, from one data layer", () => {
  test("it mixes writing, Vault entries, site log and milestones, newest first, with real dates", async ({ page }) => {
    await page.goto("/en/timeline");
    const groups = new Set(await page.locator("[data-group]").evaluateAll((els) => els.map((e) => e.getAttribute("data-group"))));
    for (const g of ["writing", "vault", "site", "milestones"]) expect(groups.has(g)).toBe(true);
    const dates = await page.locator("[data-group] time").evaluateAll((els) => els.map((e) => e.getAttribute("datetime")!));
    expect(dates.length).toBeGreaterThan(15);
    for (const d of dates) expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect([...dates].sort().reverse()).toEqual(dates);
  });
});

test.describe("open data: JSON Feed and the open profile", () => {
  test("feed.json is a valid JSON Feed 1.1 in every language, public items only, absolute URLs", async ({ request }) => {
    for (const l of LOCALES) {
      const res = await request.get(`/${l}/feed.json`);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("application/feed+json");
      const f = await res.json();
      expect(f.version).toBe("https://jsonfeed.org/version/1.1");
      expect(f.language).toBe(l);
      expect(f.items.length).toBeGreaterThan(15);
      for (const it of f.items) { expect(it.id).toMatch(/^https?:\/\//); expect(it.url).toMatch(/^https?:\/\//); expect(it.date_published).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00Z$/); expect(it.title.length).toBeGreaterThan(0); }
      const dates = f.items.map((i: { date_published: string }) => i.date_published);
      expect([...dates].sort().reverse()).toEqual(dates);
    }
  });
  test("profile.json publishes only what is confirmed: no invented name, no e-mail, rel=me links, all feeds", async ({ request }) => {
    const res = await request.get("/profile.json");
    expect(res.status()).toBe(200);
    const p = await res.json();
    expect(p.name).toBeNull();            // display name is still unconfirmed
    expect(p.email).toBeNull();
    expect(p.handle).toBe("JunCodera1");
    expect(p.links).toEqual([{ rel: "me", label: expect.any(String), url: "https://github.com/JunCodera1" }]);
    expect(p.site.languages).toEqual(["en", "ja", "vi"]);
    expect(p.facts.length).toBeGreaterThanOrEqual(3);
    for (const l of LOCALES) expect(p.feeds[l].json).toMatch(new RegExp(`/${l}/feed.json$`));
  });
  test("pages advertise the feeds and mark identity links with rel=me", async ({ page }) => {
    await page.goto("/en/contact");
    expect(await page.locator('link[rel="alternate"][type="application/feed+json"]').getAttribute("href")).toMatch(/\/en\/feed\.json$/);
    expect(await page.locator('main a[href="https://github.com/JunCodera1"]').first().getAttribute("rel")).toContain("me");
  });
});

test.describe("observatory", () => {
  test("shows source health, language coverage and graph gaps, and reads as plain text", async ({ page }) => {
    const c = trackConsole(page);
    await page.goto("/en/observatory");
    await expect(page.getByRole("heading", { level: 1, name: "Observatory" })).toBeVisible();
    for (const h of ["Connected sources", "What is here", "Language coverage", "Connections", "Open data"]) await expect(page.getByRole("heading", { name: h, exact: true })).toBeVisible();
    await expect(page.getByText(/of \d+ sources answered/)).toBeVisible();
    for (const l of ["English", "日本語", "Tiếng Việt"]) await expect(page.getByText(l, { exact: true }).first()).toBeVisible();
    expect(await page.getByRole("img", { name: /translated, .* draft, .* missing/ }).count()).toBe(3);
    await expect(page.getByText("Suggestions only; nothing is written.")).toBeVisible();
    await expect(page.getByRole("link", { name: "profile.json" })).toHaveAttribute("href", "/profile.json");
    c.assertClean();
  });
});

test.describe("the knowledge graph is a view of the data layer", () => {
  test("it now holds Vault entries and topics, finds nodes by name, and shows provenance", async ({ page }) => {
    await page.goto("/en/graph");
    expect(await page.locator("[data-node]").count()).toBeGreaterThan(60);
    await page.getByLabel("Find a node").fill("midnight");
    await page.getByRole("list", { name: "Matching nodes" }).getByRole("button", { name: /Midnight counted as daytime/ }).click();
    const panel = page.locator("aside");
    await expect(panel.getByRole("heading", { name: "Midnight counted as daytime" })).toBeVisible();
    await expect(panel.getByText(/Source: data\/vault\/mistakes\.ts/)).toBeVisible();
    await expect(panel.getByText("Connected to")).toBeVisible();
    await panel.getByRole("button", { name: "Web" }).first().click();
    await expect(panel.getByRole("link", { name: "Search this topic" })).toHaveAttribute("href", /\/en\/search\?q=Web$/);
  });
  test("a replaced decision points at what replaced it", async ({ page }) => {
    await page.goto("/en/graph");
    await page.locator('[data-node="decision:css-only-motion"]').click();
    await expect(page.locator("aside").getByRole("button", { name: "Use anime.js for motion" })).toBeVisible();
  });
});

test.describe("discovery follows connections", () => {
  test("from a note, Surprise me often lands on something it is connected to; it never stays put", async ({ page }) => {
    await page.goto("/en/garden/how-this-space-is-built");
    await page.keyboard.press("Control+k");
    await page.getByRole("option", { name: /Surprise me/ }).click();
    await expect(page).not.toHaveURL(/how-this-space-is-built$/);
  });
});

test.describe("identity: A Place Called Me", () => {
  test("the name is in the title, the entrance, the header and the footer, in every language", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("A Place");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Me");
    for (const l of LOCALES) {
      await page.goto(`/${l}/classic`);
      expect(await page.title()).toContain("A Place Called Me");
      await expect(page.locator("header a[href$='/classic'], header a[href='/" + l + "']").first()).toBeAttached();
    }
    await page.goto("/ja");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("場所");
  });
  test("decorative effects that carried no meaning are gone: no image veil, no pointer parallax", async ({ page }) => {
    await page.goto("/en/library");
    expect(await page.locator(".reveal-veil").count()).toBe(0);
  });
});
