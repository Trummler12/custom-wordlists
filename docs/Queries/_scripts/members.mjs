// How many items of a class belong to a franchise by any of the usual links, not only the
// one a list definition happens to name. Characters are tied to their work in several
// ways (present in work P1441, from narrative universe P1080, part of the series P179,
// media franchise P8345), and a definition naming one of them undercounts the rest.
//
//   node members.mjs <class-QID> <work-QID>... [--direct] [--list]
//
// Counts instances of the class or any subclass (--direct: the class itself only) linked
// to any of the given works through any of those properties, and per property. --list
// prints the members with their English (or mul) labels and sitelink counts.
import { sparql } from "./wd.mjs";

const args = process.argv.slice(2);
const [cls, ...works] = args.filter((a) => /^Q\d+$/.test(a));
const direct = args.includes("--direct");
const list = args.includes("--list");
const PROPS = ["P1441", "P1080", "P179", "P8345", "P361"];

const typed = direct ? `?item wdt:P31 wd:${cls} .` : `?item wdt:P31/wdt:P279* wd:${cls} .`;
const values = `VALUES ?work { ${works.map((w) => `wd:${w}`).join(" ")} }`;
const linked = (props) => `{ ${props.map((p) => `?item wdt:${p} ?work .`).join(" } UNION { ")} }`;

const [{ n }] = await sparql(`SELECT (COUNT(DISTINCT ?item) AS ?n) WHERE { ${values} ${linked(PROPS)} ${typed} }`);
console.log(`${cls} linked to ${works.join(", ")}: ${n}`);
for (const p of PROPS) {
  const [{ n: k }] = await sparql(`SELECT (COUNT(DISTINCT ?item) AS ?n) WHERE { ${values} ${linked([p])} ${typed} }`);
  if (Number(k)) console.log(`  via ${p}: ${k}`);
}
if (list) {
  const rows = await sparql(`SELECT DISTINCT ?item ?en ?mul ?links WHERE { ${values} ${linked(PROPS)} ${typed}
    OPTIONAL { ?item rdfs:label ?en FILTER(LANG(?en)="en") } OPTIONAL { ?item rdfs:label ?mul FILTER(LANG(?mul)="mul") }
    OPTIONAL { ?item wikibase:sitelinks ?links } } ORDER BY DESC(?links)`);
  for (const r of rows) console.log(`  ${r.item.padEnd(11)} ${String(r.links ?? 0).padStart(4)}  ${r.en ?? r.mul ?? "(no label)"}`);
}
