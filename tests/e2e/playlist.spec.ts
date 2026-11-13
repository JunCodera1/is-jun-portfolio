import { expect, test } from "@playwright/test";
import { trackConsole } from "./helpers";

test.describe("playlist", () => {
  test("the chart playlist loads nothing until a track is chosen, then shows a player with a safe audio source", async ({ page }) => {
    const c = trackConsole(page);
    const requests: string[] = [];
    page.on("request", (r) => requests.push(r.url()));
    await page.goto("/en/library");
    await expect(page.getByRole("heading", { name: "Music charts" })).toBeVisible();
    // no audio element and no third-party player before interaction
    expect(await page.locator("audio, iframe").count()).toBe(0);
    expect(requests.some((u) => u.includes("/api/deezer-preview/"))).toBe(false);

    const list = page.getByRole("list", { name: "Music charts" });
    if ((await list.count()) === 0) { await expect(page.getByText(/Couldn't load this list/).first()).toBeVisible(); return; }
    await list.getByRole("button").nth(1).click();
    const audio = page.locator("audio");
    await expect(audio).toBeVisible();
    expect(await audio.getAttribute("src")).toMatch(/^\/api\/deezer-preview\/\d+$/);
    await expect(page.getByText("Now playing")).toBeVisible();
    await page.getByRole("button", { name: /Next/ }).click();
    await expect(list.getByRole("button").nth(2)).toHaveAttribute("aria-current", "true");
    c.assertClean();
  });

  test("the preview endpoint rejects bad ids and never redirects off Deezer's CDN", async ({ request }) => {
    expect((await request.get("/api/deezer-preview/abc", { maxRedirects: 0 })).status()).toBe(400);
    expect((await request.get("/api/deezer-preview/1%3Bdrop", { maxRedirects: 0 })).status()).toBe(400);
    const ok = await request.get("/api/deezer-preview/3135556", { maxRedirects: 0 });
    if (ok.status() === 302) expect(ok.headers()["location"]).toMatch(/^https:\/\/[a-z0-9.-]+\.dzcdn\.net\//);
    else expect([404, 502]).toContain(ok.status());
  });
});
