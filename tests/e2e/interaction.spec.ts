import { expect, test } from "@playwright/test";
import { trackConsole } from "./helpers";

test.describe("theme system (rows 27, 36)", () => {
  test("system / light / dark apply immediately and persist across reloads", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/en/classic");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.getByRole("radio", { name: "Light" }).click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(page.getByRole("radio", { name: "Light" })).toHaveAttribute("aria-checked", "true");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(page.getByRole("radio", { name: "Light" })).toHaveAttribute("aria-checked", "true");
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(244, 244, 240)");
    await page.getByRole("radio", { name: "System" }).click();
    await expect(html).toHaveAttribute("data-theme", "dark"); // follows emulated OS scheme again
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBeNull();
  });

  test("system mode follows live OS changes", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/en/classic");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("no flash: the stored theme is applied before first paint", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    await page.goto("/en", { waitUntil: "commit" });
    // The inline script runs while the document is still parsing, i.e. before hydration.
    await page.waitForFunction(() => document.documentElement.dataset.theme === "light", null, { timeout: 5000 });
  });

  test("a blocked localStorage does not break the page", async ({ page }) => {
    await page.addInitScript(() => { Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } }); });
    const c = trackConsole(page);
    await page.goto("/en/classic");
    await page.getByRole("radio", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    c.assertClean();
  });
});

test.describe("command palette (row 25)", () => {
  test("Ctrl+K opens, searches pages/projects/notes, Enter navigates, Esc closes", async ({ page }) => {
    await page.goto("/en/classic");
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("combobox")).toBeFocused();
    await dialog.getByRole("combobox").fill("voice");
    await expect(dialog.getByRole("option", { name: /VoiceAI/ })).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/en\/projects\/voiceai$/);
    await expect(dialog).toBeHidden();

    await page.keyboard.press("Control+k");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("arrow keys move the active option and the combobox exposes aria-activedescendant", async ({ page }) => {
    await page.goto("/en/classic");
    await page.keyboard.press("Control+k");
    const input = page.getByRole("combobox");
    const first = await input.getAttribute("aria-activedescendant");
    await page.keyboard.press("ArrowDown");
    expect(await input.getAttribute("aria-activedescendant")).not.toBe(first);
    await page.keyboard.press("ArrowUp");
    expect(await input.getAttribute("aria-activedescendant")).toBe(first);
  });

  test("can switch theme and language by keyboard", async ({ page }) => {
    await page.goto("/en/about");
    await page.keyboard.press("Control+k");
    await page.getByRole("combobox").fill("light");
    await page.getByRole("option", { name: /Theme: Light/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.keyboard.press("Control+k");
    await page.getByRole("combobox").fill("japanese");
    await page.getByRole("option", { name: /Language: 日本語/ }).click();
    await expect(page).toHaveURL(/\/ja\/about$/);
  });

  test("finds Vietnamese content without typing diacritics, in the Vietnamese UI", async ({ page }) => {
    await page.goto("/vi/classic");
    await page.keyboard.press("Control+k");
    await page.getByRole("combobox").fill("noi dung giu cho");
    await expect(page.getByRole("option", { name: /Nội dung giữ chỗ/ })).toBeVisible();
  });

  test("the visible trigger button works for mouse/touch users (no keyboard-only feature)", async ({ page }) => {
    await page.goto("/en/classic");
    await page.getByRole("button", { name: "Open command palette" }).click();
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
  });

  test("an unreachable search index degrades to pages + actions only", async ({ page }) => {
    await page.route("**/search-index.json", (r) => r.fulfill({ status: 500, body: "x" }));
    await page.goto("/en/classic");
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("option", { name: /About/ }).first()).toBeVisible();
    await page.getByRole("combobox").fill("about");
    await expect(page.getByRole("option", { name: /About/ }).first()).toBeVisible();
  });
});

test.describe("index menu (also the mobile menu)", () => {
  test("opens a dialog listing every page, closes on Esc and after navigating", async ({ page }) => {
    await page.goto("/en/classic");
    await page.getByRole("button", { name: "Open the site index" }).click();
    const dialog = page.getByRole("dialog", { name: "Index of the site" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link")).toHaveCount(21);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await page.getByRole("button", { name: "Open the site index" }).click();
    await dialog.getByRole("link", { name: /Timeline/ }).click();
    await expect(page).toHaveURL(/\/en\/timeline$/);
    await expect(dialog).toBeHidden();
  });
});

test.describe("terminal (row 26)", () => {
  test("runs the advertised commands, shows errors for unknown ones, never a real shell", async ({ page }) => {
    await page.goto("/en/terminal");
    const input = page.getByRole("textbox", { name: /Command/ });
    const log = page.getByRole("log");
    await input.fill("help"); await input.press("Enter");
    for (const c of ["about", "projects", "skills", "interests", "journal", "garden", "now", "contact", "clear"]) await expect(log).toContainText(c);
    await input.fill("projects"); await input.press("Enter");
    await expect(log.getByRole("link", { name: /Green Footprint/ })).toHaveAttribute("href", "/en/projects/green-footprint");
    await input.fill("cat /etc/passwd"); await input.press("Enter");
    await expect(log).toContainText("command not found: cat");
    await expect(log).not.toContainText("root:");
    await input.fill("clear"); await input.press("Enter");
    await expect(log).not.toContainText("command not found");
    await expect(log).toContainText("Welcome");
  });

  test("history recall with ArrowUp and localized output", async ({ page }) => {
    await page.goto("/ja/terminal");
    const input = page.getByRole("textbox", { name: /コマンド/ });
    await input.fill("garden"); await input.press("Enter");
    await input.press("ArrowUp");
    await expect(input).toHaveValue("garden");
    await expect(page.getByRole("log")).toContainText("このスペースのつくり");
  });
});

test.describe("filters and search actually filter (row 9)", () => {
  test("projects: kind chips filter and announce the count", async ({ page }) => {
    await page.goto("/en/projects");
    await expect(page.getByRole("status")).toHaveText("Showing 7 of 7");
    await page.getByRole("button", { name: "Mobile" }).click();
    await expect(page.getByRole("status")).toHaveText("Showing 1 of 7");
    await expect(page.getByRole("button", { name: "Mobile" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("link", { name: /DeepSea/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /VoiceAI/ })).toHaveCount(0);
    await page.getByRole("button", { name: "All" }).click();
    await expect(page.getByRole("status")).toHaveText("Showing 7 of 7");
  });

  test("garden: text and tag filters", async ({ page }) => {
    await page.goto("/en/garden");
    await expect(page.getByRole("status")).toHaveText("2 notes");
    await page.getByLabel("Filter notes").fill("placeholders");
    await expect(page.getByRole("status")).toHaveText("1 note");
    await page.getByLabel("Filter notes").fill("zzzz");
    await expect(page.getByText("No notes match.")).toBeVisible();
    await page.getByLabel("Filter notes").fill("");
    await page.getByRole("button", { name: "#Next.js" }).click();
    await expect(page.getByRole("status")).toHaveText("1 note");
  });

  test("search page: results, deep link ?q=, empty state, Japanese substring", async ({ page }) => {
    await page.goto("/en/search?q=prisma");
    await expect(page.getByRole("link", { name: /Green Footprint/ })).toBeVisible();
    await page.getByLabel("Search the site").fill("zzzzqq");
    await expect(page.getByRole("status")).toContainText("No results for “zzzzqq”.");
    await page.goto("/ja/search");
    await page.getByLabel("サイト内検索").fill("三つの言語");
    await expect(page.getByRole("link", { name: /最初から三つの言語で/ })).toBeVisible();
  });
});

test("project detail: evidence table, repo + demo links, owner-needed slots are labelled placeholders", async ({ page }) => {
  await page.goto("/en/projects/green-footprint");
  await expect(page.getByRole("table")).toContainText("schema.prisma");
  await expect(page.getByRole("link", { name: /green-footprint-backend/ })).toHaveAttribute("href", "https://github.com/JunCodera1/green-footprint-backend");
  await expect(page.getByRole("link", { name: /Live demo/ }).first()).toHaveAttribute("href", /vercel\.app/);
  expect(await page.locator("[data-placeholder]").count()).toBeGreaterThanOrEqual(5); // problem, goals, role, challenges, results, lessons
  await expect(page.locator("[data-placeholder]").first()).toContainText("To be written by the owner");
});

test("contact: no fake mailto, no form; GitHub link is real (row 20)", async ({ page }) => {
  await page.goto("/en/contact");
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.getByText("Email address not set yet")).toBeVisible();
  await expect(page.getByRole("link", { name: /GitHub/ }).first()).toHaveAttribute("href", "https://github.com/JunCodera1");
});

test("no dead links: every internal link on every top-level page resolves", async ({ page, request }) => {
  const seen = new Set<string>();
  for (const path of ["/en", "/en/projects", "/en/profile", "/en/about", "/en/timeline", "/en/garden", "/en/journal"]) {
    await page.goto(path);
    const hrefs = await page.locator("a[href]").evaluateAll((els) => els.map((e) => e.getAttribute("href")!).filter((h) => h.startsWith("/") && !h.startsWith("//")));
    hrefs.forEach((h) => seen.add(h.split("#")[0]!));
  }
  seen.delete("");
  for (const h of seen) {
    const res = await request.get(h);
    expect(res.status(), h).toBe(200);
  }
  expect(seen.size).toBeGreaterThan(20);
});

test("external links open safely in a new tab", async ({ page }) => {
  await page.goto("/en/projects/green-footprint");
  const ext = page.locator('a[href^="http"]');
  for (const a of await ext.all()) {
    await expect(a).toHaveAttribute("target", "_blank");
    expect(await a.getAttribute("rel")).toContain("noopener");
  }
});

test("keyboard: skip link is first tab stop and moves focus to main", async ({ page }) => {
  await page.goto("/en/about");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("focus is always visible on interactive elements", async ({ page }) => {
  await page.goto("/en/classic");
  for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");
  const outline = await page.evaluate(() => { const s = getComputedStyle(document.activeElement!); return `${s.outlineStyle} ${s.outlineWidth}`; });
  expect(outline).toMatch(/solid 2px/);
});

test("reduced motion: smooth scrolling and animations are disabled (row 38)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/classic");
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  expect(await page.evaluate(() => getComputedStyle(document.querySelector(".reveal")!).animationName)).not.toBe("reveal-in");
});

test("dashboard widgets show real data: the visitor's clock and the latest repository push (row 28)", async ({ page }) => {
  await page.goto("/en/classic");
  const time = page.locator("dd", { has: page.locator("span.tabular-nums") }).first();
  await expect(time).toContainText(/\d{1,2}:\d{2}/);
  const widget = page.getByText("Last repository push").locator("..");
  await expect(widget.getByRole("link")).toHaveAttribute("href", /^https:\/\/github\.com\/JunCodera1\//);
  await expect(widget).toContainText(/GitHub/);
});

test("typography: spec fonts are loaded, with a Japanese-capable fallback stack (row 37)", async ({ page }) => {
  await page.goto("/ja/classic");
  await page.evaluate(() => document.fonts.ready);
  const stacks = await page.evaluate(() => ({
    h1: getComputedStyle(document.querySelector("h1")!).fontFamily,
    body: getComputedStyle(document.body).fontFamily,
    mono: getComputedStyle(document.querySelector(".label")!).fontFamily,
  }));
  expect(stacks.h1).toContain("Space Grotesk");
  expect(stacks.body).toContain("Inter");
  expect(stacks.mono).toContain("JetBrains Mono");
  for (const s of [stacks.h1, stacks.body]) expect(s).toMatch(/Hiragino|Yu Gothic|Noto Sans/);
  expect(await page.evaluate(() => document.fonts.check('16px "Inter Variable"'))).toBe(true);
});

test("social preview image is generated and referenced in og/twitter metadata", async ({ page, request }) => {
  await page.goto("/vi/classic");
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toMatch(/opengraph-image/);
  const res = await request.get(new URL(og!).pathname);
  expect(res.headers()["content-type"]).toContain("image/png");
  await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(1);
});

test.describe("game-style interaction layer", () => {
  test("index menu is keyboard-driven: arrows, Home/End and 1–9 move focus; Enter opens", async ({ page }) => {
    await page.goto("/en/classic");
    await page.getByRole("button", { name: "Open the site index" }).click();
    const dialog = page.getByRole("dialog", { name: "Index of the site" });
    const links = dialog.getByRole("link");
    await page.keyboard.press("ArrowDown");
    await expect(links.nth(0)).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(links.nth(1)).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(links.nth(0)).toBeFocused();
    await page.keyboard.press("End");
    await expect(links.last()).toBeFocused();
    await page.keyboard.press("Home");
    await expect(links.first()).toBeFocused();
    await page.keyboard.press("9");
    await expect(links.nth(8)).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/en\/timeline$/);
  });

  test("route wipe plays after a client navigation, never on first load, and never blocks input", async ({ page }) => {
    await page.goto("/en/classic");
    await expect(page.locator(".wipe")).toHaveCount(0);
    await page.getByRole("link", { name: "About", exact: true }).first().click();
    await expect(page).toHaveURL(/\/en\/about$/);
    await expect(page.locator(".wipe")).toHaveCount(1);
    expect(await page.locator(".wipe").evaluate((e) => getComputedStyle(e).pointerEvents)).toBe("none");
    // navigation is not delayed by the animation: another click goes through immediately
    await page.getByRole("link", { name: "Projects", exact: true }).first().click();
    await expect(page).toHaveURL(/\/en\/projects$/);
  });

  test("route wipe is removed under prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en/classic");
    await page.getByRole("link", { name: "About", exact: true }).first().click();
    await expect(page).toHaveURL(/\/en\/about$/);
    expect(await page.locator(".wipe").evaluate((e) => getComputedStyle(e).display)).toBe("none");
  });

  test("selected nav item uses a skewed plate layer, so the focus outline is never clipped", async ({ page }) => {
    await page.goto("/en/projects");
    const link = page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Projects" });
    await link.focus();
    const s = await link.evaluate((e) => { const c = getComputedStyle(e); return { clip: c.clipPath, outline: c.outlineStyle, w: c.outlineWidth }; });
    expect(s.clip).toBe("none");
    expect(s.outline).toBe("solid");
    expect(s.w).toBe("2px");
  });
});

test("a saved light/dark choice survives page loads in every area (regression: hydration must not reset it)", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/en/classic");
  await page.getByRole("radio", { name: "Light" }).click();
  for (const path of ["/en/classic", "/en/city", "/en/hideout"]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("light");
  }
});
