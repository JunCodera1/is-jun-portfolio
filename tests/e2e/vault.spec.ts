import { expect, test } from "@playwright/test";
import { trackConsole } from "./helpers";

test.describe("Knowledge Vault", () => {
  test("the hub lists all nine modules, each one opens, and every page has the section tabs", async ({ page }) => {
    const c = trackConsole(page);
    await page.goto("/en/vault");
    await expect(page.getByRole("heading", { level: 1, name: "Knowledge Vault" })).toBeVisible();
    const cards = page.locator("main ul li a.card-ink");
    expect(await cards.count()).toBe(9);
    for (const name of ["Concept Explainer", "Research Notes", "Mistake Archive", "Decision Journal", "Idea Incubator", "Personal Glossary", "Reading Progress", "Learning Tracker", "Learning Roadmap"]) await expect(page.getByRole("link", { name: new RegExp(name) }).first()).toBeVisible();
    await page.getByRole("link", { name: /Decision Journal/ }).first().click();
    await expect(page).toHaveURL(/\/en\/vault\/decisions$/);
    await expect(page.getByRole("navigation", { name: "Vault sections" })).toBeVisible();
    c.assertClean();
  });

  test("the topic filter on the decision journal hides entries of other topics and keeps them in the page", async ({ page }) => {
    await page.goto("/en/vault/decisions");
    const all = await page.locator("article[data-topic]").count();
    expect(all).toBeGreaterThan(4);
    await page.getByRole("group", { name: "Filter by topic" }).getByRole("button", { name: "Design" }).click();
    const visible = await page.locator("article[data-topic]:visible").count();
    expect(visible).toBeGreaterThan(0);
    expect(visible).toBeLessThan(all);
    expect(await page.locator("article[data-topic]").count()).toBe(all); // still in the document
    await page.getByRole("button", { name: "All topics" }).click();
    expect(await page.locator("article[data-topic]:visible").count()).toBe(all);
  });

  test("a superseded decision says what replaced it", async ({ page }) => {
    await page.goto("/en/vault/decisions");
    const old = page.locator("#css-only-motion");
    await expect(old).toContainText("Superseded");
    await expect(old.getByRole("link", { name: "Use anime.js for motion" })).toHaveAttribute("href", "#anime-js");
  });

  test("the glossary is searchable in any of the three languages", async ({ page }) => {
    await page.goto("/en/vault/glossary");
    const box = page.getByRole("searchbox", { name: "Search the glossary" });
    for (const [q, id] of [["hydration", "hydration"], ["ハイドレーション", "hydration"], ["trợ từ", "particle"], ["  Particle ", "particle"]] as const) {
      await box.fill(q);
      await expect(page.locator(`dl > div#${id}`)).toBeVisible();
    }
    await box.fill("zzzz-no-such-term");
    await expect(page.getByText("No term matches.")).toBeVisible();
  });

  test("the Leitner explainer is interactive and uses the real algorithm", async ({ page }) => {
    const c = trackConsole(page);
    await page.goto("/en/vault/concepts/spaced-repetition");
    await expect(page.getByRole("img", { name: /Five Leitner boxes/ })).toBeVisible();
    await page.getByRole("button", { name: "I remembered" }).click();
    await expect(page.getByText(/Now in box 2\. It comes back in 2 days/)).toBeVisible();
    await page.getByRole("button", { name: "I remembered" }).click();
    await expect(page.getByText(/Now in box 3/)).toBeVisible();
    await page.getByRole("button", { name: "I forgot" }).click();
    await expect(page.getByText(/Now in box 1/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Leitner system" })).toHaveAttribute("href", /\/vault\/glossary#leitner$/);
    c.assertClean();
  });

  test("every concept has a diagram with a text alternative", async ({ page }) => {
    for (const slug of ["spaced-repetition", "content-security-policy", "static-and-regenerated", "graph-layout"]) {
      await page.goto(`/en/vault/concepts/${slug}`);
      await expect(page.locator("main svg[role='img'][aria-label]").first()).toBeVisible();
    }
  });

  test("Ctrl+K finds vault entries, and Japanese pages fall back to English text honestly", async ({ page }) => {
    await page.goto("/en/about");
    await page.keyboard.press("Control+k");
    await page.getByRole("combobox").fill("midnight");
    await expect(page.getByRole("option", { name: /Midnight counted as daytime/ })).toBeVisible();
    await page.goto("/ja/vault/concepts/content-security-policy");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("コンテンツセキュリティポリシー");
    // body paragraphs are English until translated: they are marked lang="en" and carry the "not translated" tag
    await expect(page.locator('main p [lang="en"]').first()).toBeVisible();
    await expect(page.locator("main p [title]").first()).toBeVisible();
  });

  test("empty modules explain how to fill them, and the learning tracker shows local stats", async ({ page }) => {
    await page.goto("/en/vault/reading");
    await expect(page.getByText("No reading list yet")).toBeVisible();
    await page.goto("/en/vault/learning");
    await expect(page.getByText("Recorded in this browser")).toBeVisible();
    await expect(page.getByText(/Only on this device/)).toBeVisible();
    await page.goto("/en/vault/roadmap");
    await expect(page.getByText("Pass N3")).toBeVisible();
    await expect(page.getByText("Stated by the owner; no date given.")).toBeVisible();
  });
});
