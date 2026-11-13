// Usage: npm run new -- garden "My title"   (or journal)  — scaffolds content/<kind>/<slug>/{en,ja,vi}.mdx to fill in.
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
const [kind, ...rest] = process.argv.slice(2);
const title = rest.join(" ").trim();
if (!["garden", "journal"].includes(kind) || !title) { console.error('Usage: npm run new -- <garden|journal> "Title"'); process.exit(1); }
const slug = title.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "entry";
const dir = new URL(`../content/${kind}/${slug}/`, import.meta.url);
if (existsSync(dir)) { console.error("Already exists:", slug); process.exit(1); }
mkdirSync(dir, { recursive: true });
const today = new Date().toISOString().slice(0, 10);
const extra = kind === "garden" ? "category: notes\nmaturity: seedling\nrelated: []\n" : "";
for (const [loc, status] of [["en", "translated"], ["ja", "draft"], ["vi", "draft"]]) {
  writeFileSync(new URL(`${loc}.mdx`, dir), `---\ntitle: ${title}\nsummary: One sentence about this.\ndate: ${today}\nupdated: ${today}\ntags: []\n${extra}translation: ${status}\n---\n\nWrite here.\n`);
}
console.log(`Created content/${kind}/${slug}/ (en, ja, vi). Edit the three files, then rebuild.`);
