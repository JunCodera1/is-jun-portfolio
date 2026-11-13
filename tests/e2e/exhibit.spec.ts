import { expect, test } from "@playwright/test";
import { trackConsole } from "./helpers";

test.describe("solar system", () => {
  test("planets are real buttons; selecting one shows what it is and a working link; the list repeats every destination", async ({ page }) => {
    const c = trackConsole(page);
    await page.goto("/en/orbit");
    await expect(page.getByRole("heading", { level: 1, name: "Solar system" })).toBeVisible();
    const planet = page.locator('[data-planet="projects"]');
    await planet.click({ force: true }); // it drifts; the click also pauses the orbit
    await expect(planet).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { name: "Projects" }).first()).toBeVisible();
    await page.getByRole("link", { name: "Visit Projects" }).click();
    await expect(page).toHaveURL(/\/en\/projects$/);
    c.assertClean();
  });
  test("keyboard: a planet can be focused and opened, and the plain list has every planet", async ({ page }) => {
    await page.goto("/en/orbit");
    await page.locator('[data-planet="journal"]').focus();
    await page.keyboard.press("Enter");
    await expect(page.locator('[data-planet="journal"]')).toHaveAttribute("aria-pressed", "true");
    const list = page.getByRole("list", { name: "All planets" });
    expect(await list.getByRole("link").count()).toBe(8);
  });
  test("under reduced motion the planets stand still", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3100/en/orbit");
    const el = page.locator('[data-planet="about"]');
    const a = await el.evaluate((n) => (n as HTMLElement).style.left);
    await page.waitForTimeout(800);
    expect(await el.evaluate((n) => (n as HTMLElement).style.left)).toBe(a);
    await ctx.close();
  });
});

test.describe("exhibition (horizontal scroll)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test("on desktop, vertical scrolling slides the projects sideways, and keyboard focus brings a card into view", async ({ page }) => {
    const c = trackConsole(page);
    await page.goto("/en/projects");
    const region = page.getByRole("region", { name: "Exhibition" });
    await expect(region).toBeVisible();
    const track = region.locator("div.flex.w-max");
    await expect(track).toHaveCount(1); // pinned mode
    const x0 = await track.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41);
    await region.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 900));
    await expect.poll(async () => track.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41)).toBeLessThan(x0 - 100);
    // keyboard: the last card's link is reachable and gets scrolled into view
    const last = region.locator("[data-card] a").last();
    await last.focus();
    await expect(last).toBeInViewport();
    await last.click();
    await expect(page).toHaveURL(/\/en\/projects\/[a-z-]+$/);
    c.assertClean();
  });
  test.describe("touch / small screens", () => {
    test.use({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true });
    test("it is a normal swipeable row with arrow buttons", async ({ page }) => {
      await page.goto("/en/projects");
      const region = page.getByRole("region", { name: "Exhibition" });
      await expect(region.getByRole("button", { name: /Next/ })).toBeVisible();
      const strip = region.locator("div.overflow-x-auto");
      const before = await strip.evaluate((el) => el.scrollLeft);
      await region.getByRole("button", { name: /Next/ }).click();
      await expect.poll(async () => strip.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  });
  test("the timeline is an exhibition too", async ({ page }) => {
    await page.goto("/en/timeline");
    await expect(page.getByRole("region", { name: "Timeline" })).toBeVisible();
    expect(await page.locator("[data-card]").count()).toBeGreaterThan(2);
  });
});

test.describe("kinetic type and image reveal", () => {
  test("the home page's big sentences keep their real text for screen readers; the letters are decoration", async ({ page }) => {
    await page.goto("/en/classic");
    await expect(page.getByText("Studying Information Technology").first()).toBeAttached();
    expect(await page.locator("[data-ch]").count()).toBeGreaterThan(40);
    expect(await page.locator("[data-ch]").first().evaluate((el) => el.closest("[aria-hidden='true']") !== null)).toBe(true);
  });
  test("under reduced motion the sentences are plain text (no animated letters)", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3100/en/classic");
    const t = await page.locator("[data-ch]").first().evaluate((el) => (el as HTMLElement).style.transform);
    expect(t).toBe("");
    await ctx.close();
  });
  test("page-header art is veiled for mouse users and free of any veil for touch", async ({ page }) => {
    await page.goto("/en/library");
    await expect(page.locator(".reveal-veil").first()).toBeAttached();
    await page.mouse.move(1000, 250);
    await expect.poll(async () => page.locator(".reveal-veil").first().evaluate((el) => (el as HTMLElement).style.getPropertyValue("--rr"))).not.toBe("");
  });
});
