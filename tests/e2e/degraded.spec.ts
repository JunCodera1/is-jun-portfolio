import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { trackConsole } from "./helpers";

/**
 * Failure mode: EVERY external integration is down. A second copy of the site is built and served with all of them switched off
 * (the SDK reports them as disabled, exactly as it would report failures), and the core experience must be complete.
 */
const PORT = 3102, BASE = `http://localhost:${PORT}`, DIST = ".next-degraded";
const IDS = ["github.repos", "anilist", "openlibrary", "deezer", ...["verge", "ars", "bbc", "hn", "lobsters", "devto", "zenn", "gigazine", "vnexpress"].map((x) => `news.${x}`)].join(",");
let server: ChildProcess;

test.describe.configure({ mode: "serial" });
test.beforeAll(async () => {
  test.setTimeout(300_000);
  const env = { ...process.env, NEXT_DIST_DIR: DIST, INTEGRATIONS_DISABLED: IDS, NEXT_PUBLIC_SITE_URL: BASE };
  const build = spawnSync("npx", ["next", "build"], { env, stdio: "ignore", timeout: 240_000 });
  if (build.status !== 0) throw new Error("degraded build failed");
  server = spawn("npx", ["next", "start", "-p", String(PORT)], { env, stdio: "ignore" });
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`${BASE}/en`)).ok) return; } catch { /* starting */ } await new Promise((r) => setTimeout(r, 500)); }
  throw new Error("degraded server did not start");
});
test.afterAll(async () => { server?.kill("SIGTERM"); await new Promise((r) => setTimeout(r, 300)); fs.rmSync(DIST, { recursive: true, force: true }); });

test("with every integration down, every page still renders cleanly in every language", async ({ page }) => {
  test.setTimeout(240_000);
  const c = trackConsole(page);
  for (const l of ["en", "ja", "vi"]) for (const p of ["", "/classic", "/now", "/news", "/library", "/observatory", "/graph", "/vault", "/timeline", "/ask", "/projects", "/city"]) {
    const res = await page.goto(`${BASE}/${l}${p}`);
    expect(res?.status(), `/${l}${p}`).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
  }
  c.assertClean();
});

test("the empty states are honest: news and library say so, the Observatory reports 0 of 13, GitHub falls back to the committed snapshot", async ({ page }) => {
  await page.goto(`${BASE}/en/news`);
  await expect(page.getByText("0 of 13", { exact: false }).or(page.getByText(/0 of 9 sources loaded/))).toBeVisible();
  await expect(page.getByText(/Couldn't load this feed/).first()).toBeVisible();
  await page.goto(`${BASE}/en/library`);
  expect(await page.getByText(/Couldn't load this list/).count()).toBeGreaterThanOrEqual(3);
  await expect(page.getByText("Hunter x Hunter")).toHaveCount(0); // no invented card when the lookup service is down
  await page.goto(`${BASE}/en/observatory`);
  await expect(page.getByText(/0 of 13 sources answered/)).toBeVisible();
  expect(await page.locator("#obs-sources ~ ul li").filter({ hasText: "Switched off by the owner" }).count()).toBe(13);
  await page.goto(`${BASE}/en/now`);
  await expect(page.getByText(/is-jun-portfolio|snapshot/i).first()).toBeVisible(); // repository data still comes from the committed snapshot
});

test("search, the graph, the timeline, the Vault, Ask and the feeds do not depend on any integration", async ({ page, request }) => {
  await page.goto(`${BASE}/en/graph`);
  expect(await page.locator("[data-node]").count()).toBeGreaterThan(60);
  await page.goto(`${BASE}/en/ask`); await page.waitForLoadState("networkidle");
  await page.locator("#ask-q").fill("What is the Knowledge Vault?"); await page.locator("form button[type=submit]").click();
  await expect(page.locator('[data-label="quoted"]')).toBeVisible();
  const feed = await (await request.get(`${BASE}/en/feed.json`)).json();
  expect(feed.items.length).toBeGreaterThan(15);
  expect((await request.get(`${BASE}/profile.json`)).status()).toBe(200);
});
