import { expect, test } from "@playwright/test";
import { trackConsole } from "./helpers";

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
});

test.describe("kinetic type", () => {
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
    expect(await page.locator("[data-ch]").first().evaluate((el) => (el as HTMLElement).style.transform)).toBe("");
    await ctx.close();
  });
});
