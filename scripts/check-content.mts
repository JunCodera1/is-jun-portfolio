/**
 * Validates MDX content: frontmatter schema, English source present, related ids resolve, tags are known.
 * Run: npm run content:check   (exits 1 on error; unknown tags are warnings)
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getEntry, listIds } from "@/lib/content";
import { locales } from "@/i18n/routing";

const root = resolve(import.meta.dirname, "..");
const knownTags = new Set(Object.keys(JSON.parse(readFileSync(`${root}/messages/en.json`, "utf8")).tagNames));
let errors = 0;
let warnings = 0;

for (const collection of ["garden", "journal"] as const) {
  for (const id of listIds(collection)) {
    for (const locale of locales) {
      try {
        const e = getEntry(collection, id, locale);
        if (!e) { console.error(`✖ ${collection}/${id}: no English source (en.mdx)`); errors++; continue; }
        for (const rel of e.related) if (!getEntry(collection, rel, "en")) { console.error(`✖ ${collection}/${id}: related id "${rel}" does not exist`); errors++; }
        for (const tag of e.tags) if (!knownTags.has(tag) && locale === "en") { console.warn(`⚠ ${collection}/${id}: tag "${tag}" has no label in messages/*.json (tagNames); the raw id is shown`); warnings++; }
      } catch (err) {
        console.error(`✖ ${collection}/${id} [${locale}]: ${(err as Error).message}`);
        errors++;
      }
    }
  }
}
console.log(`content:check — ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
