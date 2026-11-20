// The sports of other multi-sport events beside the Olympics, and how far they overlap
// with the Olympic ones: what a merged "Sports" above several rubrics would hold.
//
//   node multisport.mjs
//
// A series' sports are read two ways: events directly part of the series (as the Olympic
// base query does), and events of its editions (editions linked by P179 or P361, events
// up to two levels below them).
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { labels, sparql } from "./wd.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
const olympic = new Set(
  Object.keys(JSON.parse(readFileSync(join(REPO, "data-raw/sports/olympia/sport-names.json"), "utf8"))).filter((q) => /^Q\d+$/.test(q)),
);
const SERIES = {
  "Summer Paralympics": "Q3327913",
  "Winter Paralympics": "Q3317976",
  "Summer Youth Olympics": "Q3178415",
  "Winter Youth Olympics": "Q3178414",
  "World Games": "Q673097",
  "Commonwealth Games": "Q178340",
  "Asian Games": "Q483463",
  "Pan American Games": "Q230186",
  "European Games": "Q641572",
  "X Games": "Q527512",
};

const all = {};
for (const [name, q] of Object.entries(SERIES)) {
  const rows = await sparql(`SELECT DISTINCT ?sport WHERE {
    { ?ev wdt:P361 wd:${q} } UNION
    { ?ed wdt:P179|wdt:P361 wd:${q} . ?ev wdt:P361|wdt:P361/wdt:P361 ?ed }
    ?ev wdt:P641 ?sport .
  }`);
  const sports = rows.map((r) => r.sport);
  all[name] = sports;
  const shared = sports.filter((s) => olympic.has(s));
  console.log(`${name.padEnd(22)} ${String(sports.length).padStart(4)} sports, ${shared.length} also Olympic`);
}
const extra = {};
for (const [name, sports] of Object.entries(all)) for (const s of sports) if (!olympic.has(s)) (extra[s] ??= []).push(name);
const L = await labels(Object.keys(extra));
const ranked = Object.entries(extra).sort((a, b) => b[1].length - a[1].length);
console.log(`\nnot Olympic (${ranked.length}), by how many series hold them:`);
for (const [s, names] of ranked) console.log(`  ${names.length}  ${(L[s] ?? s).padEnd(34)} ${s.padEnd(11)} ${names.join(", ")}`);
