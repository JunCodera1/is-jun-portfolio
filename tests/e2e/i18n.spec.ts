import { expect, test } from "@playwright/test";

test("language switcher keeps the current page (row 6)", async ({ page }) => {
  await page.goto("/en/projects/deepsea");
  await page.getByRole("link", { name: /Switch language to 日本語/ }).click();
  await expect(page).toHaveURL(/\/ja\/projects\/deepsea$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("DeepSea");
  await page.getByRole("link", { name: /Tiếng Việt/ }).click();
  await expect(page).toHaveURL(/\/vi\/projects\/deepsea$/);
  await expect(page.getByRole("link", { name: "Tất cả dự án" })).toBeVisible();
});

test("switcher marks the current language and exposes lang/hreflang on each option", async ({ page }) => {
  await page.goto("/vi");
  const nav = page.getByRole("navigation", { name: "Ngôn ngữ" });
  await expect(nav.locator('a[aria-current="true"]')).toHaveAttribute("hreflang", "vi");
  await expect(nav.locator('a[hreflang="ja"] span[lang="ja"]')).toHaveText("日本語");
});

test("the chosen language is remembered: bare / goes to the saved locale even if the browser prefers another (row 8)", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "en-US" });
  const page = await ctx.newPage();
  await page.goto("/en/about");
  await page.getByRole("link", { name: /Chuyển ngôn ngữ sang|Switch language to Tiếng Việt/ }).click();
  await expect(page).toHaveURL(/\/vi\/about$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/vi$/);
  await ctx.close();
});

test("missing translation → banner + English text with lang=en + link to the original (row 10)", async ({ page }) => {
  await page.goto("/vi/garden/how-this-space-is-built");
  const banner = page.getByRole("note");
  await expect(banner).toContainText("Chưa có bản dịch tiếng Việt");
  await expect(banner.getByRole("link", { name: "Đọc bản gốc tiếng Anh" })).toHaveAttribute("href", "/en/garden/how-this-space-is-built");
  await expect(page.locator('main .prose-space[lang="en"]')).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
});

test("draft translation is flagged; fully translated English has no banner", async ({ page }) => {
  await page.goto("/ja/garden/how-this-space-is-built");
  await expect(page.getByRole("note")).toContainText("翻訳（下書き）");
  await expect(page.locator('main .prose-space[lang="ja"]')).toBeVisible();
  await page.goto("/en/garden/how-this-space-is-built");
  await expect(page.getByRole("note")).toHaveCount(0);
});

test("lists show translation badges per item", async ({ page }) => {
  await page.goto("/vi/garden");
  await expect(page.getByText("Chỉ có tiếng Anh")).toBeVisible();
  await expect(page.getByText("Bản nháp")).toBeVisible();
});

test("dates, numbers and reading time are localized (row 11)", async ({ page }) => {
  await page.goto("/ja/journal/three-languages-from-day-one");
  await expect(page.locator("time").first()).toHaveText("2026年11月13日");
  await expect(page.getByText(/約\d+分で読めます/)).toBeVisible();
  await page.goto("/vi/journal/three-languages-from-day-one");
  await expect(page.getByText(/\d+ phút đọc/)).toBeVisible();
  await page.goto("/en/journal/three-languages-from-day-one");
  await expect(page.getByText(/\d+ min read/)).toBeVisible();
});

test("article has a table of contents whose links point at real heading ids (row 17)", async ({ page, isMobile }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/journal/three-languages-from-day-one");
  const links = page.locator('aside nav[aria-label="On this page"] a');
  expect(await links.count()).toBeGreaterThanOrEqual(3);
  for (const href of await links.evaluateAll((els) => els.map((e) => e.getAttribute("href")!))) {
    await expect(page.locator(href)).toHaveCount(1);
  }
  void isMobile;
});
