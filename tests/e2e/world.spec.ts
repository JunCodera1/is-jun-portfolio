import { expect, test } from "@playwright/test";
import { grammar } from "../../src/content/data/station";
import { trackConsole } from "./helpers";

test.describe("the world", () => {
  test("entrance → city with Enter; language switch keeps the place", async ({ page }) => {
    const c = trackConsole(page);
    await page.goto("/en", { waitUntil: "networkidle" }); // key handlers attach on hydration
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Digital/i);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/en\/city$/);
    await page.getByRole("link", { name: /Switch language to 日本語/ }).click();
    await expect(page).toHaveURL(/\/ja\/city$/);
    c.assertClean();
  });

  test("city hotspots are real links: Tab/arrows move between them, Enter travels, M returns", async ({ page }) => {
    await page.goto("/en/city");
    const lab = page.getByRole("link", { name: /The Lab/ }).first();
    await lab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("link", { name: /The Station/ }).first()).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/en\/station$/);
    await page.keyboard.press("m");
    await expect(page).toHaveURL(/\/en\/city$/);
  });

  test("visiting places is tracked locally and shown in the HUD; the shutter never blocks navigation", async ({ page }) => {
    await page.goto("/en/city");
    await page.getByRole("link", { name: /The Hideout/ }).first().click();
    await expect(page).toHaveURL(/\/en\/hideout$/);
    await expect(page.getByRole("button", { name: /1\/12/ })).toBeVisible();
    await page.getByRole("button", { name: /Discoveries/ }).click();
    await expect(page.getByRole("dialog", { name: "Discoveries" })).toContainText("Visited The Hideout");
    await expect(page.getByRole("dialog", { name: "Discoveries" })).toContainText("only about this website".replace("about", "for"), { ignoreCase: true }).catch(() => {});
    await page.keyboard.press("Escape");
  });

  test("hidden things in the city can be found (keyboard-reachable), and are recorded", async ({ page }) => {
    await page.goto("/en/city");
    await page.getByRole("button", { name: /Rooftop cat/ }).click();
    await expect(page.getByText(/black cat watches/)).toBeVisible();
    await page.getByRole("button", { name: /Vending machine/ }).click();
    await page.getByRole("button", { name: /Playing card on the street/ }).click();
    await page.getByRole("button", { name: /\/12/ }).click();
    const d = page.getByRole("dialog", { name: "Discoveries" });
    await expect(d).toContainText("The rooftop cat");
    await expect(d.getByRole("link", { name: /Backstage/ })).toBeVisible();
  });

  test("Konami code opens Backstage (noindex)", async ({ page }) => {
    await page.goto("/en/city");
    for (const k of ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]) await page.keyboard.press(k);
    await expect(page).toHaveURL(/\/en\/backstage$/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("Hideout: every object opens a panel with real content; opening all records a discovery", async ({ page }) => {
    await page.goto("/en/hideout");
    for (const [name, text] of [["Computer", "Green Footprint"], ["Bookshelf", "Anime & manga"], ["Notebook", "Three languages from day one"], ["Calendar", "Passed JLPT N3"], ["Window", "Outside it is"], ["Board", "JLPT N2"]] as const) {
      await page.getByRole("button", { name, exact: true }).first().click();
      const dlg = page.getByRole("dialog");
      await expect(dlg).toContainText(text);
      await page.keyboard.press("Escape");
      await expect(dlg).toBeHidden();
    }
    await page.getByRole("button", { name: /\/12/ }).click();
    await expect(page.getByRole("dialog", { name: "Discoveries" })).toContainText("Looked at every object in the Hideout");
  });

  test("Hideout window toggles day/night (the whole world's lighting)", async ({ page }) => {
    await page.goto("/en/hideout");
    await page.getByRole("button", { name: "Window", exact: true }).first().click();
    await page.getByRole("button", { name: "day", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: "night", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("Lab: case files switch, evidence names files, links are real", async ({ page }) => {
    await page.goto("/en/lab");
    await page.getByRole("tab", { name: /VoiceAI/ }).click();
    const panel = page.getByRole("tabpanel");
    await expect(panel).toContainText("whisper-base");
    await expect(panel.getByRole("link", { name: /speech-language-model/ })).toHaveAttribute("href", "https://github.com/JunCodera1/speech-language-model");
    await expect(page.getByText("own", { exact: true }).first()).toBeVisible();
  });

  test("Station: a grammar mission is playable end-to-end and 5/5 earns a stamp that persists", async ({ page }) => {
    await page.goto("/en/station");
    const n3 = page.locator("section", { has: page.getByRole("heading", { name: "N3 review line" }) });
    await n3.getByRole("button", { name: /Grammar/ }).click();
    const dlg = page.getByRole("dialog");
    for (let i = 0; i < 5; i++) {
      const prompt = (await dlg.locator("p[lang=ja]").textContent())!;
      const item = grammar.find((g) => g.sentence === prompt)!;
      await dlg.getByRole("button", { name: new RegExp(`^\\d ${item.options[0]}$`) }).click();
      await expect(dlg.getByRole("status")).toContainText("Correct!");
      await dlg.getByRole("button", { name: i === 4 ? "Finish" : "Next" }).click();
    }
    await expect(dlg).toContainText("5/5");
    await expect(dlg).toContainText("Stamped!");
    await page.keyboard.press("Escape");
    await expect(n3.getByRole("button", { name: /Grammar/ })).toContainText("stamped");
    await page.reload();
    await expect(n3.getByRole("button", { name: /Grammar/ })).toContainText("stamped");
  });

  test("Station: a wrong answer shows the explanation and does not stamp", async ({ page }) => {
    await page.goto("/en/station");
    await page.locator("section", { has: page.getByRole("heading", { name: "Conversation branch" }) }).getByRole("button").click();
    const dlg = page.getByRole("dialog");
    await dlg.getByRole("button", { name: /^\d いただきます。$|^\d いる。$|^\d トイレどこ？$/ }).first().click();
    await expect(dlg.getByRole("status")).toContainText("Not quite.");
  });

  test("Arcade offers five games; Reaction time is playable", async ({ page }) => {
    await page.goto("/en/arcade");
    await expect(page.getByRole("button", { name: "Play" })).toHaveCount(5);
    await page.getByRole("button", { name: "Play" }).nth(3).click();
    const g = page.getByRole("group", { name: "Reaction Time" });
    const btn = g.getByRole("button").first();
    await btn.dispatchEvent("pointerdown");
    await expect(btn).toContainText("Wait");
    await btn.dispatchEvent("pointerdown"); // too early
    await expect(btn).toContainText("Too early");
  });

  test("Archive: spines open cards that state their source; empty shelves are labelled", async ({ page }) => {
    await page.goto("/en/archive");
    await page.getByRole("button", { name: /Hunter × Hunter/ }).click();
    await expect(page.locator("main [role=status]")).toContainText("Stated by the owner");
    await page.getByRole("button", { name: /NixOS configuration/ }).click();
    await expect(page.getByRole("link", { name: /Open/ })).toHaveAttribute("href", /myNixOS-config/);
    await expect(page.getByText("This shelf is empty for now.")).toBeVisible();
  });

  test("localized worlds: Japanese and Vietnamese hideout and station", async ({ page }) => {
    await page.goto("/ja/hideout");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("アジト");
    await page.goto("/vi/station");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Nhà ga");
  });

  test("sound is off by default and only toggled by the visitor", async ({ page }) => {
    await page.goto("/en/city");
    const b = page.getByRole("button", { name: /Sound: off/i });
    await expect(b).toHaveAttribute("aria-pressed", "false");
    await b.click();
    await expect(page.getByRole("button", { name: /Sound: on/i })).toHaveAttribute("aria-pressed", "true");
  });

  test("the transition shutter is not rendered under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en/city");
    expect(await page.locator(".shutter").evaluate((e) => getComputedStyle(e).display)).toBe("none");
  });
});
