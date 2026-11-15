import { spawn, type ChildProcess } from "node:child_process";
import { randomBytes, scryptSync } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";

/**
 * The owner console needs configuration, so this spec starts a SECOND production server (port 3101) with a password hash,
 * a session secret and a temporary data directory, and drives the real thing in a browser. The main server (3100) has none of it.
 */
const PORT = 3101, BASE = `http://localhost:${PORT}`, PASSWORD = "correct horse battery staple";
let server: ChildProcess; let dataDir: string;

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "owner-e2e-"));
  const salt = randomBytes(16);
  const hash = `scrypt$16384$8$1$${salt.toString("base64url")}$${scryptSync(PASSWORD, salt, 32, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString("base64url")}`;
  server = spawn("npx", ["next", "start", "-p", String(PORT)], { env: { ...process.env, NEXT_PUBLIC_SITE_URL: BASE, OWNER_PASSWORD_HASH: hash, SESSION_SECRET: randomBytes(32).toString("base64url"), DATA_DIR: dataDir }, stdio: "ignore" });
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`${BASE}/en`)).ok) return; } catch { /* not up yet */ } await new Promise((r) => setTimeout(r, 500)); }
  throw new Error("owner test server did not start");
});
test.afterAll(async () => { server?.kill("SIGTERM"); await new Promise((r) => setTimeout(r, 300)); fs.rmSync(dataDir, { recursive: true, force: true }); });

test("sign in, run agents, review a proposal, see the audit trail, export, delete", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(`${BASE}/en/owner`);
  await expect(page.getByLabel("Owner password")).toBeVisible(); // rendered only after hydration and the session check, so it is safe to type
  expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");

  await page.getByLabel("Owner password").fill("wrong password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("That did not work.")).toBeVisible();
  await page.getByLabel("Owner password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Agents" })).toBeVisible();

  const cookies = await page.context().cookies(BASE);
  const sess = cookies.find((c) => c.name === "owner")!;
  expect(sess).toMatchObject({ httpOnly: true, sameSite: "Strict", path: "/" });
  expect(await page.evaluate(() => document.cookie)).not.toContain("owner="); // not readable from JavaScript

  // all three agents are listed with their permission levels
  for (const [name, lvl] of [["Knowledge Organizer", "assisted"], ["Translation Assistant", "assisted"], ["Integration Monitor", "autonomous"]] as const) await expect(page.locator("li", { hasText: name }).first()).toContainText(lvl);

  // run the organizer: it proposes links (word overlap) and writes nothing
  await page.locator("li", { hasText: "Knowledge Organizer" }).getByRole("button", { name: "Run" }).click();
  await expect(page.getByText("Knowledge Organizer finished")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Proposals/ })).toBeVisible();
  const prop = page.locator("#o-prop ~ ul li").first();
  await expect(prop).toContainText("not a statement by the owner");
  await prop.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("Approved")).toBeVisible();

  // run the autonomous monitor: it needs no approval and shows up in the history and the audit log
  await page.locator("li", { hasText: "Integration Monitor" }).getByRole("button", { name: "Run" }).click();
  await expect(page.getByText("Integration Monitor finished")).toBeVisible();
  await expect(page.locator("#o-tasks ~ ol")).toContainText("integration-monitor · succeeded");
  const audit = page.locator("#o-audit ~ ol");
  await expect(audit).toContainText("tool:integrations.refresh · allow");
  await expect(audit).toContainText("run-agent");
  await expect(audit).toContainText("login · ok"); await expect(audit).toContainText("login · deny");
  await expect(audit).not.toContainText(PASSWORD);

  // export contains the data, no secrets
  const dump = await (await page.request.get(`${BASE}/api/owner/export`)).text();
  expect(dump).toContain("proposal."); expect(dump).not.toMatch(/scrypt\$|correct horse/);

  // delete everything (with the confirmation dialog), then it is really gone
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete everything" }).click();
  await expect(page.getByText("Deleted", { exact: true })).toBeVisible();
  const st = await (await page.request.get(`${BASE}/api/owner/state`)).json();
  expect(st.tasks).toEqual([]); expect(st.proposals).toEqual([]);

  // sign out: the session no longer works
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByLabel("Owner password")).toBeVisible();
  expect((await page.request.get(`${BASE}/api/owner/state`)).status()).toBe(401);
});

test("API: cookie-less requests are rejected, cross-site writes are refused, and the login is rate limited", async ({ request }) => {
  expect((await request.get(`${BASE}/api/owner/state`)).status()).toBe(401);
  expect((await request.post(`${BASE}/api/owner/agents/knowledge-organizer/run`, { data: {} })).status()).toBe(401);
  expect((await request.post(`${BASE}/api/owner/login`, { data: { password: PASSWORD }, headers: { origin: "https://evil.example" } })).status()).toBe(403);
  const codes: number[] = [];
  for (let i = 0; i < 7; i++) codes.push((await request.post(`${BASE}/api/owner/login`, { data: { password: `wrong-${i}` }, headers: { "x-forwarded-for": "7.7.7.7" } })).status());
  expect(codes.slice(0, 5)).toEqual([401, 401, 401, 401, 401]); expect(codes.slice(5)).toEqual([429, 429]);
});
