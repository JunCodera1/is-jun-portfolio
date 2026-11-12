import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../../", import.meta.url);
describe("project documentation exists (row 59)", () => {
  it.each([
    "README.md", "PROJECT_STATUS.md", "TECHNICAL_DECISIONS.md", "CONTENT_NEEDED.md", "FEATURES.md", "OWNER_PROFILE.md",
    "PROJECTS_REVIEW.md", "CONTENT_GUIDELINES.md", "docs/DISCOVERY_REPORT.md", "docs/REQUIREMENTS_TRACEABILITY.md",
    "docs/IMPLEMENTATION_ROADMAP.md", "docs/TESTING_STRATEGY.md", "docs/DEPLOYMENT_GUIDE.md", ".env.example",
  ])("%s", (f) => expect(existsSync(new URL(f, root)), f).toBe(true));
});
