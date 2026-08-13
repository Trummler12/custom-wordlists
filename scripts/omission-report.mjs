// What each omission rule actually catches, and what it leaves behind.
//
// `npm run validate` answers whether the rules are *valid*; this answers whether
// they are *right*, which no schema can. A glob widens silently — add a language
// and every entry gains forms for it to match against — so the way to trust one
// is to look at what it takes, before and after.
//
//   node scripts/omission-report.mjs [topic.json …]     (default: every topic)
//   node scripts/omission-report.mjs --names            (list every match)
//
// The counts are the thing to diff across a change: 300 / 20 / 8 / 3 / 3 / 27 / 80
// is what the Pokémon items list should still report once it gains languages.
import { readFile, readdir } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { groupEntries, ruleMatcher, rulesOf } from "./lib/omissions.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS_DIR = join(ROOT, "data", "topics");

async function everyTopic(dir = TOPICS_DIR) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await everyTopic(p)));
    else if (e.name.endsWith(".json") && e.name !== "_category.json") out.push(p);
  }
  return out;
}

const label = (entry) => {
  const forms = typeof entry === "string" ? [entry] : Object.values(entry);
  return String(forms[0]);
};

async function main() {
  const args = process.argv.slice(2);
  const withNames = args.includes("--names");
  const paths = args.filter((a) => !a.startsWith("--"));
  const files = paths.length ? paths.map((p) => join(ROOT, p)) : await everyTopic();

  let listed = 0;
  for (const file of files.sort()) {
    const topic = JSON.parse(await readFile(file, "utf8"));
    for (const group of topic.groups) {
      const rules = rulesOf(group);
      if (rules.length === 0) continue;
      listed++;

      const entries = groupEntries(group);
      console.log(`\n${relative(ROOT, file)}  ·  group "${group.id}"  ·  ${entries.length} entries`);
      let hidden = 0;
      for (const { rule, kind } of rules) {
        const matches = entries.filter(ruleMatcher(rule));
        if (kind === "omitted") hidden += matches.length;
        const flag = matches.length === 0 ? "  ← matches nothing" : "";
        const globs = [rule.match].flat().join(" , ");
        console.log(
          `  ${String(matches.length).padStart(4)}  ${kind === "omitted" ? "−" : "?"} ${rule.id.padEnd(18)} ${globs}${flag}`,
        );
        if (withNames) for (const m of matches) console.log(`          ${label(m)}`);
      }
      const standIns = rules.filter(({ rule, kind }) => kind === "omitted" && rule.as).length;
      console.log(`  ${String(entries.length - hidden + standIns).padStart(4)}  = shown by default`);
    }
  }
  if (listed === 0) console.log("no list declares any omission rules");
}

main().catch((err) => {
  console.error("omission-report failed:", err.message);
  process.exit(1);
});
