// Whether the sovereignty matrix of the Countries topic could come from Wikidata classes:
// the curated territories' P31 classes per cell, then each class's own members, so a
// class that matches a cell (and only it) shows, together with what it would add.
//
//   node territories.mjs [--min N]     (members of a class need ≥ N sitelinks, default 20)
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { labels, sparql } from "./wd.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
const curated = JSON.parse(readFileSync(join(REPO, "data-raw/geography/countries/sovereign-territories.json"), "utf8"));
const args = process.argv.slice(2);
const min = Number(args[args.indexOf("--min") + 1]) || 20;

const cellOf = Object.fromEntries(Object.entries(curated).filter(([q]) => /^Q\d+$/.test(q)).map(([q, v]) => [q, v.cell]));
const qids = Object.keys(cellOf);

const rows = await sparql(`SELECT ?item ?cls WHERE {
  VALUES ?item { ${qids.map((q) => `wd:${q}`).join(" ")} }
  ?item wdt:P31 ?cls .
}`);
const classesOf = {};
for (const r of rows) (classesOf[r.item] ??= []).push(r.cls);
const byClass = {};
for (const [item, cls] of Object.entries(classesOf)) for (const c of cls) (byClass[c] ??= []).push(item);

const L = await labels([...qids, ...Object.keys(byClass)]);
const name = (q) => `${L[q] ?? q} (${q})`;

console.log("== curated territories per cell, with their classes ==");
for (const cell of [...new Set(Object.values(cellOf))]) {
  console.log(`\n[${cell}]`);
  for (const q of qids.filter((x) => cellOf[x] === cell)) {
    console.log(`  ${(L[q] ?? q).padEnd(28)} ${(classesOf[q] ?? []).map((c) => L[c] ?? c).join("; ")}`);
  }
}

// Classes shared by at least two curated territories (or the only class of one), minus the
// generic ones every polity carries, are the candidates worth checking against Wikidata.
const GENERIC = new Set(["Q6256", "Q3624078", "Q7275", "Q1763527", "Q43702", "Q112099", "Q160016", "Q6501447", "Q179164", "Q123480"]);
const candidates = Object.entries(byClass).filter(([c, items]) => !GENERIC.has(c) && items.length >= 2);
console.log(`\n== candidate classes: members with ≥ ${min} sitelinks (truthy P31) ==`);
for (const [cls, items] of candidates.sort((a, b) => b[1].length - a[1].length)) {
  const members = await sparql(`SELECT ?item ?links WHERE {
    ?item wdt:P31 wd:${cls} ; wikibase:sitelinks ?links .
    FILTER NOT EXISTS { ?item wdt:P576 [] }
    FILTER(?links >= ${min})
  }`);
  const ml = await labels(members.map((m) => m.item));
  const cells = {};
  for (const q of items) cells[cellOf[q]] = (cells[cellOf[q]] ?? 0) + 1;
  const extra = members.filter((m) => !cellOf[m.item]);
  console.log(`\n${name(cls)}: ${items.length} curated (${Object.entries(cells).map(([c, n]) => `${c} ${n}`).join(", ")}), ${members.length} on Wikidata`);
  const shown = extra.sort((a, b) => b.links - a.links).slice(0, 20);
  if (extra.length) console.log(`  not curated (${extra.length}${extra.length > 20 ? ", top 20 by sitelinks" : ""}): ${shown.map((m) => `${ml[m.item] ?? m.item} ${m.item} [${m.links}]`).join(", ")}`);
}
