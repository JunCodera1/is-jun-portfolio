import { expect, test } from "@playwright/test";
import { trackConsole } from "./helpers";

test.describe("flashcard review", () => {
  test("a session grades cards, saves progress in this browser, and updates the streak", async ({ page }) => {
    const c = trackConsole(page);
    await page.goto("/en/japanese/review");
    await expect(page.getByRole("heading", { level: 1, name: "Review cards" })).toBeVisible();
    await expect(page.getByText("Study streak")).toBeVisible();
    await page.getByRole("button", { name: /Start a session/ }).click();

    // keyboard: Space reveals, → grades "got it"
    await expect(page.getByText(/Card 1 of/)).toBeVisible();
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: "Got it" })).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByText(/Card 2 of/)).toBeVisible();
    // button: reveal then "Again"
    await page.getByRole("button", { name: "Show answer" }).click();
    await page.getByRole("button", { name: "Again" }).click();
    await expect(page.getByText(/Card 3 of/)).toBeVisible();

    // progress is persisted: reload shows 2 cards no longer "new", and a 1-day streak
    await page.reload();
    await expect(page.getByText("1 day", { exact: true }).first()).toBeVisible();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("world-srs-v1") ?? "{}"));
    expect(Object.keys(stored)).toHaveLength(2);
    expect(Object.values(stored as Record<string, { box: number }>).map((v) => v.box).sort()).toEqual([1, 2]);
    c.assertClean();
  });

  test("works in Japanese and Vietnamese, with no horizontal overflow on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    for (const loc of ["ja", "vi"]) {
      await page.goto(`/${loc}/japanese/review`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  });
});
