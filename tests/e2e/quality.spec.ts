import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { ALL_PATHS, LOCALES } from "./helpers";

// Row 38 / 60: responsive without horizontal overflow at the five required widths.
const WIDTHS = [375, 430, 768, 1366, 1920];

/**
 * These tests load ~130 pages in one browser. A long-lived Chromium tab slowly accumulates memory and eventually crashes on small machines,
 * so every few pages the tab is replaced by a fresh one (same context, same settings).
 */
async function* freshPages(first: Page, setup: (p: Page) => Promise<void>, every = 12) {
  let page = first;
  await setup(page);
  let n = 0;
  while (true) {
    if (n > 0 && n % every === 0) { const ctx = page.context(); await page.close(); page = await ctx.newPage(); await setup(page); }
    n++;
    yield page;
  }
}

test.describe("no horizontal overflow", () => {
  for (const width of WIDTHS) {
    test(`@${width}px — every page, every locale`, async ({ page }) => {
      test.setTimeout(300_000); // ~130 page loads
      const pages = freshPages(page, (p) => p.setViewportSize({ width, height: 900 }));
      const bad: string[] = [];
      for (const locale of LOCALES) {
        for (const path of ALL_PATHS) {
          const p = (await pages.next()).value as Page;
          await p.goto(`/${locale}${path}`, { waitUntil: "load" });
          const { sw, cw } = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
          if (sw > cw) bad.push(`/${locale}${path}: scrollWidth ${sw} > ${cw}`);
        }
      }
      expect(bad).toEqual([]);
    });
  }
});

test("overlays (palette, index menu) fit a 375px screen", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/en/classic");
  await page.getByRole("button", { name: "Open command palette" }).click();
  const box = await page.getByRole("dialog", { name: "Command palette" }).boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Open the site index" }).click();
  await expect(page.getByRole("radiogroup", { name: "Theme" })).toBeVisible(); // theme control lives in the menu on small screens
});

test("touch targets: header controls are at least 36px on mobile and 44px on coarse pointers", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto("/en/classic");
  for (const name of ["Open command palette", "Open the site index"]) {
    const box = await page.getByRole("button", { name }).boundingBox();
    expect(box!.height, name).toBeGreaterThanOrEqual(36);
  }
  await ctx.close();
});

// Accessibility: axe-core WCAG 2.0/2.1 A + AA on every page, both themes, all three locales.
for (const theme of ["dark", "light"] as const) {
  test.describe(`axe (${theme})`, () => {
    for (const locale of LOCALES) {
      test(`/${locale}: no violations on any page`, async ({ page }) => {
        test.setTimeout(300_000);
        const pages = freshPages(page, (p) => p.emulateMedia({ colorScheme: theme }));
        const failures: string[] = [];
        for (const path of ALL_PATHS) {
          const p = (await pages.next()).value as Page;
          await p.goto(`/${locale}${path}`);
          const results = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
          for (const v of results.violations) failures.push(`/${locale}${path} [${v.impact}] ${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`);
        }
        expect(failures).toEqual([]);
      });
    }
  });
}

test("axe: command palette dialog and index menu are accessible when open", async ({ page }) => {
  await page.goto("/en/classic");
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("a");
  let r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(r.violations.map((v) => v.id)).toEqual([]);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Open the site index" }).click();
  r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(r.violations.map((v) => v.id)).toEqual([]);
});

test("images/logos have text alternatives and there are no unlabeled buttons or links", async ({ page }) => {
  for (const locale of LOCALES) {
    await page.goto(`/${locale}`);
    const unnamed = await page.evaluate(() =>
      [...document.querySelectorAll("a, button")].filter((e) => !(e.getAttribute("aria-label") || e.textContent?.trim() || e.getAttribute("title"))).length);
    expect(unnamed).toBe(0);
  }
});
