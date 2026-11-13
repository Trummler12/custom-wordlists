// Continents & Plates: how far Wikidata alone could supply the list #35 builds from two
// Wikipedia pages (bands, Bird's areas) plus the P31 tectonic-plate catch-all, and what on
// Wikidata the build has to curate around (junk, duplicates, extinct plates, labels).
//
//   node continents.mjs [path to data-raw/geography/plates/structure.tsv]
import { readFile } from "node:fs/promises";
import { labels, sparql } from "./wd.mjs";

const PLATE = "Q215680";
const LANGS = ["en", "de", "es", "fr", "it", "ja", "ko", "zh", "pt", "ru", "tr", "pl", "nl", "bg", "cs", "da", "et", "fi", "el", "he", "hu", "lv", "mk", "nb", "ro", "sr", "sk", "sv", "tl"];
const tsv = process.argv[2] ?? "../../../../data-raw/geography/plates/structure.tsv";
const rows = (await readFile(tsv, "utf8")).split(/\r?\n/).filter((l) => l && !l.startsWith("#")).map((l) => {
  const [name, band, parent, q] = l.split("\t");
  return { name, band, parent, q };
});
const banded = rows.filter((r) => r.band !== "unknown");

// The continent class first: what P31 continent answers, against the build's hand list.
const cont = await sparql(`SELECT ?i ?n WHERE { ?i wdt:P31 wd:Q5107 ; wikibase:sitelinks ?n }`);
const CL = await labels(cont.map((r) => r.i));
console.log(`P31 continent: ${cont.length}: ${cont.sort((a, b) => b.n - a.n).map((r) => `${CL[r.i] ?? r.i} (${r.i}) ${r.n}`).join(", ")}`);

// The plate class and its subclasses: an item typed only *microplate* never reaches a
// query for wdt:P31 wd:Q215680.
const sub = await sparql(`SELECT ?c WHERE { ?c wdt:P279+ wd:${PLATE} }`);
const SL = await labels(sub.map((r) => r.c));
console.log(`\nsubclasses of tectonic plate: ${sub.map((r) => `${SL[r.c] ?? r.c} (${r.c})`).join(", ") || "-"}`);
const direct = new Set((await sparql(`SELECT ?i WHERE { ?i wdt:P31 wd:${PLATE} }`)).map((r) => r.i));
const deep = new Set((await sparql(`SELECT DISTINCT ?i WHERE { ?i wdt:P31/wdt:P279* wd:${PLATE} }`)).map((r) => r.i));
console.log(`P31 tectonic plate: ${direct.size}; P31 a plate class at any depth: ${deep.size}`);

// Every candidate: the banded rows' items, the catch-all and the deep members.
const all = [...new Set([...banded.map((r) => r.q).filter(Boolean), ...deep])];
const vals = `VALUES ?i { ${all.map((q) => `wd:${q}`).join(" ")} }`;
const info = await sparql(`SELECT ?i ?n (GROUP_CONCAT(DISTINCT ?c; separator="|") AS ?cls) (GROUP_CONCAT(DISTINCT ?s; separator="|") AS ?sup)
  (SAMPLE(?a) AS ?area) (SAMPLE(?en) AS ?enwiki) (SAMPLE(?end) AS ?ended) WHERE { ${vals} ?i wikibase:sitelinks ?n .
  OPTIONAL { ?i wdt:P31 ?c } OPTIONAL { ?i wdt:P279 ?s } OPTIONAL { ?i wdt:P2046 ?a }
  OPTIONAL { ?en schema:about ?i ; schema:isPartOf <https://en.wikipedia.org/> }
  OPTIONAL { ?i wdt:P576|wdt:P582|wdt:P2032 ?end } } GROUP BY ?i ?n`);
const strip = (s) => (s ? s.split("|").map((c) => c.replace(/^.*\/entity\//, "")) : []);
const I = Object.fromEntries(info.map((r) => [r.i, { n: +r.n, cls: strip(r.cls), sup: strip(r.sup), area: r.area, enwiki: r.enwiki, ended: r.ended }]));
const L = await labels([...all, ...info.flatMap((r) => [...strip(r.cls), ...strip(r.sup)])]);
const show = (q) => `${L[q] ?? q} (${q})`;

const notTyped = banded.filter((r) => r.q && !deep.has(r.q));
console.log(`\nbanded rows: ${banded.length}, ${banded.filter((r) => !r.q).length} without an item; with an item but not typed a plate: ${notTyped.length}`);
for (const r of notTyped) console.log(`  ${r.band} ${show(r.q)}: ${I[r.q]?.cls.map(show).join(", ") || "no P31"}${I[r.q]?.sup.length ? `; subclass of ${I[r.q].sup.map(show).join(", ")}` : ""}`);
console.log(`banded rows with a Wikidata area (P2046): ${banded.filter((r) => I[r.q]?.area).length}`);

const inBand = new Set(banded.map((r) => r.q));
const rest = [...deep].filter((q) => !inBand.has(q)).sort((a, b) => I[b].n - I[a].n);
console.log(`\nplate items outside the bands: ${rest.length}`);
for (const q of rest) console.log(`  ${show(q)} ${I[q].n} sitelinks, enwiki ${I[q].enwiki ? decodeURIComponent(I[q].enwiki.split("/").pop()) : "-"}: ${I[q].cls.map(show).join(", ")}${I[q].sup.length ? `; subclass of ${I[q].sup.map(show).join(", ")}` : ""}${I[q].ended ? `; ended ${I[q].ended.slice(0, 4)}` : ""}`);

// An item that is both a class (P279) and an instance of the plate class is a modelling
// smell: the concept *microplate* belongs under P279 only.
const both = [...deep].filter((q) => I[q].sup.length);
console.log(`\nplate items that also carry P279: ${both.map(show).join(", ") || "-"}`);

// Labels with a disambiguator, the Help:Label pattern, in the build's languages.
const lang = await sparql(`SELECT ?i ?l (LANG(?l) AS ?g) WHERE { ${vals} ?i rdfs:label ?l . FILTER(LANG(?l) IN (${LANGS.map((l) => `"${l}"`).join(", ")}) && REGEX(?l, "[(（]")) }`);
console.log(`\nlabels with a parenthetical in the build's languages: ${lang.length}`);
for (const r of lang) console.log(`  ${show(r.i)} ${r.g}: ${r.l}`);
