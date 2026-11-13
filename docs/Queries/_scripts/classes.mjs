// Which classes the items linked to a work are instances of, most common first: how to
// find the class a list should be built on when no list item defines one ("champion in
// League of Legends"?).
//
//   node classes.mjs <work-QID>... [--limit N]
import { labels, sparql } from "./wd.mjs";

const args = process.argv.slice(2);
const works = args.filter((a) => /^Q\d+$/.test(a));
const limit = Number(args[args.indexOf("--limit") + 1]) || 25;

const rows = await sparql(`SELECT ?cls (COUNT(DISTINCT ?item) AS ?n) WHERE {
  VALUES ?work { ${works.map((w) => `wd:${w}`).join(" ")} }
  { ?item wdt:P1441 ?work } UNION { ?item wdt:P1080 ?work } UNION { ?item wdt:P179 ?work } UNION { ?item wdt:P8345 ?work } UNION { ?item wdt:P361 ?work }
  ?item wdt:P31 ?cls .
} GROUP BY ?cls ORDER BY DESC(?n) LIMIT ${limit}`);
const L = await labels(rows.map((r) => r.cls));
for (const r of rows) console.log(`${String(r.n).padStart(6)}  ${r.cls.padEnd(11)} ${L[r.cls] ?? ""}`);
