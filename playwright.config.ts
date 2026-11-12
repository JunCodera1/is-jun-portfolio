import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  fullyParallel: true,
  workers: 4,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Uses the system Chromium; override with PLAYWRIGHT_CHROMIUM_PATH (or remove to use Playwright's own browser).
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || (process.env.CI ? undefined : "/usr/bin/chromium"), args: ["--no-sandbox"] },
    trace: "retain-on-failure",
  },
  // Tests run against the PRODUCTION build (`npm run build` first), never the dev server.
  webServer: { command: `npx next start -p ${PORT}`, url: `http://localhost:${PORT}/en`, reuseExistingServer: true, timeout: 60_000 },
});
