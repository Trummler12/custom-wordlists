// How much of one of our curated topic files a Wikidata member set covers: every entry's
// English name looked up among the members' English / mul labels and English aliases.
//
//   node vs-topic.mjs <data/topics/…json> <class-QID> <work-QID>... [--direct] [--missing]
//
// The fairest measure for a topic we already have: not "how many characters does
// Wikidata hold" but "how many of the ones we list could it supply".
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sparql } from "./wd.mjs";

const args = process.argv.slice(2);
const file = args.find((a) => a.endsWith(".json"));
const [cls, ...works] = args.filter((a) => /^Q\d+$/.test(a));
const direct = args.includes("--direct");
const showMissing = args.includes("--missing");

const topic = JSON.parse(readFileSync(resolve(file), "utf8"));
const entries = (topic.tiers ?? [topic.words]).flat();
const english = (e) => (typeof e === "string" ? e : (e.en?.short ?? e.en?.pref ?? e.en ?? e.short?.en ?? Object.values(e)[0]));
const norm = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

const typed = direct ? `?item wdt:P31 wd:${cls} .` : `?item wdt:P31/wdt:P279* wd:${cls} .`;
const rows = await sparql(`SELECT DISTINCT ?item ?name WHERE {
  VALUES ?work { ${works.map((w) => `wd:${w}`).join(" ")} }
  { ?item wdt:P1441 ?work } UNION { ?item wdt:P1080 ?work } UNION { ?item wdt:P179 ?work } UNION { ?item wdt:P8345 ?work } UNION { ?item wdt:P361 ?work }
  ${typed}
  { ?item rdfs:label ?name FILTER(LANG(?name) IN ("en", "mul")) } UNION { ?item skos:altLabel ?name FILTER(LANG(?name) = "en") }
}`);
const names = new Map(rows.map((r) => [norm(r.name), r.item]));
const items = new Set(rows.map((r) => r.item));

// Our lists use the name a player would draw ("Stan"), Wikidata the full one ("Stan
// Marsh"), so a name that starts a member's label word for word counts as a likely match.
const all = [...names.keys()];
const exact = [];
const prefix = [];
const missing = [];
for (const e of entries) {
  const n = norm(english(e));
  if (names.has(n)) exact.push(n);
  else if (all.some((m) => m.startsWith(`${n} `))) prefix.push(n);
  else missing.push(english(e));
}
console.log(
  `${file}: ${exact.length + prefix.length}/${entries.length} entries found (${exact.length} exact, ${prefix.length} by first name) among ${items.size} Wikidata members`,
);
if (showMissing && missing.length) console.log(`  missing: ${missing.join(", ")}`);
