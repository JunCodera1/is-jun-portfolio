// Usage: node scripts/merge-messages.mjs <file.json>   — deep-merges {en:{...}, ja:{...}, vi:{...}} into messages/*.json
import { readFileSync, writeFileSync } from "node:fs";
const add = JSON.parse(readFileSync(process.argv[2], "utf8"));
const merge = (a, b) => { for (const [k, v] of Object.entries(b)) { if (v && typeof v === "object" && !Array.isArray(v) && a[k] && typeof a[k] === "object") merge(a[k], v); else a[k] = v; } };
for (const loc of ["en", "ja", "vi"]) {
  const p = new URL(`../messages/${loc}.json`, import.meta.url);
  const d = JSON.parse(readFileSync(p, "utf8"));
  merge(d, add[loc] ?? {});
  writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
}
console.log("merged");
