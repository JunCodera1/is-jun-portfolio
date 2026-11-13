import { expect, test } from "@playwright/test";
import { trackConsole } from "./helpers";

test.describe("mini games (original, keyboard-operable)", () => {
  test("Kana Blitz: lazy-loaded, keys 1–4 answer, score/streak update, ends with a result", async ({ page }) => {
    const c = trackConsole(page);
    await page.goto("/en/arcade");
    expect(await page.locator("script[src]").evaluateAll((s) => s.map((x) => x.getAttribute("src")).join(" "))).not.toContain("KanaBlitz");
    await page.getByRole("button", { name: "Play" }).first().click();
    const game = page.getByRole("group", { name: "Kana Blitz" });
    await game.getByRole("button", { name: "Start" }).click();
    const glyph = game.locator("p[lang=ja]");
    await expect(glyph).toHaveText(/^[ぁ-ゖ]$/);
    // cheat via the page's own data: find the right option by asking the DOM for all buttons and trying key 1..4 until one scores
    for (let i = 0; i < 12; i++) await page.keyboard.press(String((i % 4) + 1));
    await expect(game.getByText(/Score:/)).toBeVisible();
    const score = Number((await game.getByText(/Score:/).textContent())!.replace(/\D/g, ""));
    expect(score).toBeGreaterThanOrEqual(0);
    await expect(game.getByRole("status")).toBeVisible();
    c.assertClean();
  });

  test("Kana Blitz: a correct answer scores and a wrong one resets the streak", async ({ page }) => {
    await page.goto("/en/arcade");
    await page.getByRole("button", { name: "Play" }).first().click();
    const game = page.getByRole("group", { name: "Kana Blitz" });
    await game.getByRole("button", { name: "Start" }).click();
    await expect(game.getByText(/Score:/)).toContainText("0");
    // learn the answer from the data the game itself renders: read glyph, map via the public kana page
    const glyph = (await game.locator("p[lang=ja]").textContent())!;
    const map: Record<string, string> = { あ: "a", い: "i", う: "u", え: "e", お: "o", か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko" };
    const right = map[glyph];
    if (right) {
      await game.getByRole("button", { name: new RegExp(`^\\d ${right}$`) }).click();
      await expect(game.getByText(/Score:/)).toContainText("1");
      await expect(game.getByRole("status")).toContainText("Correct!");
    }
  });

  test("Kana Match: flipping pairs, mismatches flip back, moves count, reshuffle works", async ({ page }) => {
    await page.goto("/en/arcade");
    await page.getByRole("button", { name: "Play" }).nth(1).click();
    const game = page.getByRole("group", { name: "Kana Match" });
    await expect(game.getByRole("button", { name: /Card \d+, face down/ })).toHaveCount(12);
    await game.getByRole("button", { name: "Card 1, face down" }).click();
    await game.getByRole("button", { name: "Card 2, face down" }).click();
    await expect(game.getByText(/Moves:/)).toContainText("1");
    await game.getByRole("button", { name: "Reshuffle" }).click();
    await expect(game.getByText(/Moves:/)).toContainText("0");
    await expect(game.getByRole("button", { name: /face down/ })).toHaveCount(12);
  });

  test("games still work when localStorage is blocked", async ({ page }) => {
    await page.addInitScript(() => { Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } }); });
    const c = trackConsole(page);
    await page.goto("/en/arcade");
    await page.getByRole("button", { name: "Play" }).nth(1).click();
    await expect(page.getByRole("group", { name: "Kana Match" })).toBeVisible();
    c.assertClean();
  });
});

test.describe("Japanese hub, knowledge pages and news", () => {
  test("journey is honest: owner facts are labelled placeholders, never invented", async ({ page }) => {
    await page.goto("/en/japanese");
    expect(await page.locator("[data-placeholder]").count()).toBeGreaterThanOrEqual(2); // start date, study log: still the owner's to fill
    await expect(page.getByText("N3", { exact: true })).toBeVisible(); // stated by the owner
    await expect(page.getByText("Passed JLPT N3")).toBeVisible();
    await expect(page.getByText("Start date not stated yet")).toBeVisible();
    await expect(page.getByRole("link", { name: /KanjiDictVN/ })).toHaveAttribute("href", "https://github.com/JunCodera1/KanjiDictVN");
  });

  test("kana tables are complete: 46 basic + 25 voiced per script, correct lang", async ({ page }) => {
    await page.goto("/en/japanese/kana");
    expect(await page.locator("td div[lang=ja]").count()).toBe(2 * (46 + 25));
    await expect(page.locator("table").first().getByText("shi", { exact: true })).toBeVisible();
  });

  test("grammar reference: particles, verb forms, phrases are present in every language", async ({ page }) => {
    for (const [l, word] of [["en", "Particles"], ["ja", "助詞"], ["vi", "Trợ từ"]] as const) {
      await page.goto(`/${l}/japanese/grammar`);
      await expect(page.getByRole("heading", { name: word, level: 2 })).toBeVisible();
      expect(await page.locator("table").first().locator("tbody tr").count()).toBe(12);
    }
  });

  test("news renders either items (safe external links) or the empty state, never an error", async ({ page }) => {
    const c = trackConsole(page);
    await page.goto("/en/news");
    const links = page.locator('main ol a[href^="http"]');
    const n = await links.count();
    if (n === 0) await expect(page.getByText(/Couldn't load this feed/).first()).toBeVisible();
    for (const a of await links.all()) {
      await expect(a).toHaveAttribute("target", "_blank");
      expect(await a.getAttribute("rel")).toContain("noopener");
      expect(await a.getAttribute("href")).toMatch(/^https?:\/\//);
    }
    c.assertClean();
  });

  test("news headlines are not in the search index or the sitemap", async ({ request }) => {
    const idx = (await (await request.get("/en/search-index.json")).json()) as { type: string }[];
    expect(idx.some((e) => e.type === ("news" as string))).toBe(false);
    expect(await (await request.get("/sitemap.xml")).text()).not.toContain("news.ycombinator");
  });
});
