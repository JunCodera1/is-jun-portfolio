import { expect, test } from "@playwright/test";
import { trackConsole } from "./helpers";

test.describe("knowledge graph", () => {
  test("selecting a node shows what it is, its evidence, its neighbours, and a working link", async ({ page }) => {
    const c = trackConsole(page);
    await page.goto("/en/graph");
    await expect(page.getByRole("heading", { level: 1, name: "Knowledge graph" })).toBeVisible();
    const board = page.locator("[data-node]");
    expect(await board.count()).toBeGreaterThan(20);

    await page.locator('[data-node="t:Python"]').click();
    const panel = page.locator("aside");
    await expect(panel.getByRole("heading", { name: "Python" })).toBeVisible();
    await expect(panel).toContainText("requirements.txt"); // evidence for the link to a project
    await expect(panel.getByText("Connected to")).toBeVisible();

    // follow a neighbour, then open its case study
    await panel.getByRole("button", { name: "VoiceAI" }).click();
    await expect(panel.getByRole("heading", { name: "VoiceAI" })).toBeVisible();
    await panel.getByRole("link", { name: "Open the case study" }).click();
    await expect(page).toHaveURL(/\/en\/projects\/voiceai$/);
    c.assertClean();
  });

  test("a note node opens the note; filters remove node kinds; the list twin exists", async ({ page }) => {
    await page.goto("/en/graph");
    await page.locator('[data-node^="n:garden/how-this-space-is-built"]').click();
    await page.locator("aside").getByRole("link", { name: "Open the note" }).click();
    await expect(page).toHaveURL(/\/en\/garden\/how-this-space-is-built$/);

    await page.goto("/en/graph");
    const before = await page.locator("[data-node]").count();
    await page.getByRole("group", { name: "Show" }).getByRole("button", { name: "Technology" }).click();
    expect(await page.locator("[data-node]").count()).toBeLessThan(before);
    await expect(page.getByRole("heading", { name: "The same graph as a list" })).toBeVisible();
  });

  test("renders in ja and vi without horizontal overflow on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    for (const loc of ["ja", "vi"]) {
      await page.goto(`/${loc}/graph`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  });
});
