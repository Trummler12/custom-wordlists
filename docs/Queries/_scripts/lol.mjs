// League of Legends champions: which items Wikidata links to the game or its universe, by
// which property, how they match our champion list, and how far their labels reach into
// the languages Riot localizes the game into.
//
//   node lol.mjs [path to data/topics/gaming/league-of-legends/champions.json]
import { readFile } from "node:fs/promises";
import { labels, sparql } from "./wd.mjs";

const FILE = process.argv[2] ?? "../../../../data/topics/gaming/league-of-legends/champions.json";
const t = JSON.parse(await readFile(FILE, "utf8"));
const ours = (t.groups?.[0] ?? t).tiers.flat().map((e) => (typeof e === "string" ? e : e.en));
const key = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

// League of Legends (Q223341) and the Runeterra universe (Q66364628), by any of the three
// properties a character takes for its work or universe.
const rows = await sparql(`SELECT ?i ?en ?p ?w ?n WHERE { VALUES ?w { wd:Q223341 wd:Q66364628 } VALUES ?p { wdt:P1441 wdt:P1080 wdt:P8345 }
  ?i ?p ?w ; wikibase:sitelinks ?n . OPTIONAL { ?i rdfs:label ?en FILTER(LANG(?en) = "en") } }`, { fresh: true });
const items = {};
for (const r of rows) {
  const it = (items[r.i] ??= { en: r.en ?? r.i, n: Number(r.n), links: new Set() });
  it.links.add(`${r.p.replace(/^.*\//, "")}:${r.w === "Q223341" ? "LoL" : "Runeterra"}`);
}
const all = Object.entries(items);
console.log(`items linked to LoL or Runeterra: ${all.length}`);
const combos = {};
for (const [, it] of all) { const c = [...it.links].sort().join(" + "); combos[c] = (combos[c] ?? 0) + 1; }
for (const [c, n] of Object.entries(combos).sort((a, b) => b[1] - a[1])) console.log(`  ${n}  ${c}`);

const byKey = new Map(all.map(([q, it]) => [key(it.en), q]));
const matched = ours.filter((n) => byKey.has(key(n)));
const missing = ours.filter((n) => !byKey.has(key(n)));
console.log(`\nour champions: ${ours.length}; with a linked item: ${matched.length}; without: ${missing.join(", ") || "-"}`);
const notP1441 = matched.filter((n) => ![...items[byKey.get(key(n))].links].some((l) => l === "P1441:LoL"));
console.log(`matched, but without P1441 League of Legends: ${notP1441.map((n) => `${n} (${byKey.get(key(n))}: ${[...items[byKey.get(key(n))].links].join(", ")})`).join("; ") || "-"}`);
const extra = all.filter(([, it]) => !ours.some((n) => key(n) === key(it.en)));
console.log(`linked items that aren't our champions: ${extra.length}: ${extra.sort((a, b) => b[1].n - a[1].n).map(([q, it]) => `${it.en} (${q})`).join(", ")}`);

// Classes of the matched champions: a class query would need all of these.
const cls = await sparql(`SELECT ?c (COUNT(DISTINCT ?i) AS ?k) WHERE { VALUES ?i { ${matched.map((n) => `wd:${byKey.get(key(n))}`).join(" ")} } ?i wdt:P31 ?c } GROUP BY ?c ORDER BY DESC(?k)`);
const CL = await labels(cls.map((r) => r.c));
console.log(`\nclasses of the matched champions: ${cls.map((r) => `${CL[r.c] ?? r.c} ${r.k}`).join(", ")}`);
const sl = matched.map((n) => items[byKey.get(key(n))].n).sort((a, b) => a - b);
console.log(`sitelinks of the matched champions: median ${sl[Math.floor(sl.length / 2)]}, max ${sl.at(-1)}, with 0: ${sl.filter((x) => !x).length}`);

// Labels in the languages Riot localizes into (a subset of the skribbl set).
const LANGS = ["de", "es", "fr", "it", "ja", "ko", "zh-hans", "zh-hant", "zh", "pt", "ru", "tr", "pl", "cs", "el", "hu", "ro", "vi", "th"];
const vals = `VALUES ?i { ${matched.map((n) => `wd:${byKey.get(key(n))}`).join(" ")} }`;
console.log("\nlabel coverage on the matched champions (and how many differ from English):");
for (const g of LANGS) {
  const r = await sparql(`SELECT ?i ?l WHERE { ${vals} ?i rdfs:label ?l FILTER(LANG(?l) = "${g}") }`);
  const diff = r.filter((x) => key(x.l) !== key(items[x.i].en));
  console.log(`  ${g}: ${r.length}, ${diff.length} differ${diff.length ? `, e.g. ${diff.slice(0, 3).map((x) => `${items[x.i].en} => ${x.l}`).join(", ")}` : ""}`);
}
