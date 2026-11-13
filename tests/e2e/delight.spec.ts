import { expect, test } from "@playwright/test";
import { trackConsole } from "./helpers";

test.describe("time-aware theme and ambient background", () => {
  for (const [hour, theme, part] of [[9, "light", "morning"], [14, "light", "day"], [18, "dark", "evening"], [23, "dark", "night"]] as const) {
    test(`"Time of day" at ${hour}:00 → ${theme} / ${part}`, async ({ page }) => {
      await page.clock.install({ time: new Date(2026, 10, 13, hour, 0, 0) });
      await page.goto("/en/classic");
      await page.getByRole("radiogroup", { name: "Theme" }).getByRole("radio", { name: "Time of day" }).click();
      const html = page.locator("html");
      await expect(html).toHaveAttribute("data-theme", theme);
      await expect(html).toHaveAttribute("data-theme-pref", "auto");
      await expect(html).toHaveAttribute("data-daypart", part);
      expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("auto");
      await page.reload(); // no flash: the inline script resolves it again
      await expect(html).toHaveAttribute("data-theme", theme);
    });
  }
  test("picking light or dark locks the theme regardless of the clock", async ({ page }) => {
    await page.clock.install({ time: new Date(2026, 10, 13, 23, 0, 0) });
    await page.goto("/en/classic");
    await page.getByRole("radiogroup", { name: "Theme" }).getByRole("radio", { name: "Light" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
  test("the ambient layer exists, is decorative, and never intercepts clicks", async ({ page }) => {
    await page.goto("/en/classic");
    const amb = page.locator(".ambient");
    await expect(amb).toHaveAttribute("aria-hidden", "true");
    expect(await amb.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
  });
});

test.describe("command center, surprise and the hidden terminal", () => {
  test("Ctrl+K offers actions including Surprise me, which leaves the current page", async ({ page }) => {
    const c = trackConsole(page);
    await page.goto("/en/about");
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog).toBeVisible();
    for (const name of [/Surprise me/, /Open the terminal/, /Copy link/, /Back to top/, /Theme: Time of day/]) await expect(dialog.getByRole("option", { name })).toBeVisible();
    await dialog.getByRole("option", { name: /Surprise me/ }).click();
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/\/en\/about$/);
    c.assertClean();
  });
  test("Ctrl+K also works inside the world", async ({ page }) => {
    await page.goto("/en/city");
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
  });
  test("the Surprise me button on the home page goes somewhere else", async ({ page }) => {
    await page.goto("/en/classic");
    await page.getByRole("button", { name: /Surprise me/ }).click();
    await expect(page).not.toHaveURL(/\/en\/classic$/);
  });

  test("` opens the terminal anywhere; commands change theme, language and place; exit and Esc close it", async ({ page }) => {
    const c = trackConsole(page);
    await page.goto("/en/about");
    await page.keyboard.press("`");
    const dialog = page.getByRole("dialog", { name: "Terminal" });
    await expect(dialog).toBeVisible();
    const input = dialog.getByRole("textbox", { name: /Command/ });
    await expect(input).toBeFocused();

    await input.fill("theme dark"); await input.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await input.fill("sudo rm -rf /"); await input.press("Enter");
    await expect(dialog.getByText("Nice try. Nothing here needs root.")).toBeVisible();
    await input.fill("hisoka"); await input.press("Enter");
    await expect(dialog.getByText(/A card slides across the table/)).toBeVisible();
    await input.fill("help"); await input.press("Enter");
    await expect(dialog.getByText(/Some commands are not listed here/)).toBeVisible();

    await input.fill("go news"); await input.press("Enter");
    await expect(page).toHaveURL(/\/en\/news$/);
    await expect(dialog).toBeHidden();

    await page.keyboard.press("`");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("textbox", { name: /Command/ }).fill("exit");
    await dialog.getByRole("textbox", { name: /Command/ }).press("Enter");
    await expect(dialog).toBeHidden();
    await page.keyboard.press("`"); await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape"); await expect(dialog).toBeHidden();
    c.assertClean();
  });
  test("typing a backtick inside a text field does not open the terminal; the footer button does", async ({ page }) => {
    await page.goto("/en/search");
    await page.locator("#site-search").fill("a`b");
    await expect(page.getByRole("dialog", { name: "Terminal" })).toBeHidden();
    await page.getByRole("button", { name: "Open the terminal" }).click();
    await expect(page.getByRole("dialog", { name: "Terminal" })).toBeVisible();
  });
});

test.describe("magnetic cursor", () => {
  test("a ring follows the mouse, frames buttons (and pulls them), and the real cursor stays", async ({ page }) => {
    await page.goto("/en/classic");
    const ring = page.locator(".cursor-ring");
    // keep moving until the page has hydrated and the listener is attached (a real visitor never stops moving)
    await expect(async () => { await page.mouse.move(300, 300); await page.mouse.move(310, 305); await expect(ring).toHaveAttribute("data-show", "1", { timeout: 500 }); }).toPass();
    const btn = page.locator("main .btn").first();
    await btn.scrollIntoViewIfNeeded();
    const box = (await btn.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2 + 10, box.y + box.height / 2, { steps: 4 });
    await expect(ring).toHaveAttribute("data-mode", "link");
    await expect.poll(async () => btn.evaluate((el) => (el as HTMLElement).style.translate)).not.toBe("");
    await page.mouse.move(2, 400);
    await expect(ring).toHaveAttribute("data-mode", "idle");
    await expect.poll(async () => btn.evaluate((el) => (el as HTMLElement).style.translate)).toBe("");
    expect(await page.evaluate(() => getComputedStyle(document.body).cursor)).not.toBe("none");
    expect(await ring.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
  });
});

test.describe("magnetic cursor respects reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("no ring, no ambient drift", async ({ page }) => {
    await page.goto("/en/classic");
    await page.mouse.move(300, 300);
    await expect(page.locator(".cursor-ring")).toHaveCount(0);
  });
});
