// Capitals: how cleanly P36 on the build's countries (truthy sovereign states without a
// dissolution date, as #35 dumps them) yields one capital each, what the values are, and
// whether their labels and back-links (P1376) hold up.
//
//   node capitals.mjs
import { labels, sparql } from "./wd.mjs";

const COUNTRIES = `?c wdt:P31 wd:Q3624078 . FILTER NOT EXISTS { ?c wdt:P576 [] }`;

// Every P36 statement, not only the truthy ones: an ended or deprecated capital is a reading
// the build never sees, but a truthy one with an end date would be a modelling error.
const stmts = await sparql(`SELECT ?c ?cap ?rank ?start ?end ?role WHERE {
  ${COUNTRIES}
  ?c p:P36 ?s . ?s ps:P36 ?cap ; wikibase:rank ?rank .
  OPTIONAL { ?s pq:P580 ?start } OPTIONAL { ?s pq:P582 ?end }
  OPTIONAL { ?s pq:P3831|pq:P642|pq:P518 ?role }
}`);
const countries = (await sparql(`SELECT ?c WHERE { ${COUNTRIES} }`)).map((r) => r.c);
const rank = (r) => r.rank.replace("http://wikiba.se/ontology#", "").replace("Rank", "");
const truthy = new Map(countries.map((c) => [c, new Set()]));
const best = {};
for (const r of stmts) (best[r.c] ??= []).push(rank(r));
for (const r of stmts) {
  // Truthy = preferred where a country has one, else normal.
  const top = best[r.c].includes("Preferred") ? "Preferred" : "Normal";
  if (rank(r) === top) truthy.get(r.c).add(r.cap);
}
const L = await labels([...countries, ...stmts.map((r) => r.cap), ...stmts.map((r) => r.role).filter(Boolean)]);
const by = {};
for (const [c, caps] of truthy) (by[caps.size] ??= []).push(c);
console.log(`countries: ${countries.length}; truthy capitals per country: ${Object.entries(by).map(([n, cs]) => `${n} => ${cs.length}`).join(", ")}`);
for (const n of Object.keys(by).filter((n) => n !== "1"))
  for (const c of by[n]) console.log(`  ${L[c]} (${c}): ${[...truthy.get(c)].map((q) => `${L[q]} (${q})`).join(", ") || "-"}`);

const now = new Date().toISOString();
// By the statement's own rank: a capital held twice (Jakarta before 1946 and since 1950)
// would otherwise count its ended statement as truthy.
const isTruthy = (r) => rank(r) === (best[r.c].includes("Preferred") ? "Preferred" : "Normal");
const endedTruthy = stmts.filter((r) => isTruthy(r) && r.end && r.end < now);
console.log(`truthy statements with a past end date: ${endedTruthy.length}`);
for (const r of endedTruthy) console.log(`  ${L[r.c]}: ${L[r.cap]} (${r.cap}) ended ${r.end.slice(0, 10)}, rank ${rank(r)}`);
const roles = stmts.filter((r) => r.role && truthy.get(r.c).has(r.cap));
console.log(`truthy statements with a role qualifier: ${roles.length}`);
for (const r of roles) console.log(`  ${L[r.c]}: ${L[r.cap]} => ${L[r.role] ?? r.role}`);

// The values: their classes, back-link, population and coordinates.
const caps = [...new Set([...truthy.values()].flatMap((s) => [...s]))];
const vals = `VALUES ?cap { ${caps.map((q) => `wd:${q}`).join(" ")} }`;
const cls = await sparql(`SELECT ?cap ?cls WHERE { ${vals} ?cap wdt:P31 ?cls }`);
const CL = await labels(cls.map((r) => r.cls));
const clsCount = {};
for (const r of cls) clsCount[r.cls] = (clsCount[r.cls] ?? 0) + 1;
console.log(`\ncapital values: ${caps.length}; their most common classes: ${Object.entries(clsCount).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([q, n]) => `${CL[q] ?? q} ${n}`).join(", ")}`);
// A capital that is no human settlement at all (a territory, a district) is a reading to check.
const settled = new Set((await sparql(`SELECT DISTINCT ?cap WHERE { ${vals} ?cap wdt:P31/wdt:P279* wd:Q486972 . }`)).map((r) => r.cap));
const notSettlement = caps.filter((q) => !settled.has(q));
console.log(`not under *human settlement*: ${notSettlement.length}: ${notSettlement.map((q) => `${L[q]} (${q}; ${cls.filter((r) => r.cap === q).map((r) => CL[r.cls] ?? r.cls).join(" / ")})`).join(", ")}`);
const back = await sparql(`SELECT ?cap ?c WHERE { ${vals} ?cap wdt:P1376 ?c }`);
const capOf = new Map();
for (const r of back) (capOf.get(r.cap) ?? capOf.set(r.cap, new Set()).get(r.cap)).add(r.c);
const noBack = [];
for (const [c, s] of truthy) for (const q of s) if (!capOf.get(q)?.has(c)) noBack.push(`${L[q]} (${q}) of ${L[c]}`);
console.log(`truthy P36 without the matching P1376 back on the capital: ${noBack.length}${noBack.length ? ": " + noBack.join(", ") : ""}`);
const pop = new Set((await sparql(`SELECT DISTINCT ?cap WHERE { ${vals} ?cap wdt:P1082 [] }`)).map((r) => r.cap));
const coord = new Set((await sparql(`SELECT DISTINCT ?cap WHERE { ${vals} ?cap wdt:P625 [] }`)).map((r) => r.cap));
console.log(`without population (P1082): ${caps.filter((q) => !pop.has(q)).map((q) => L[q]).join(", ") || "-"}; without coordinates: ${caps.filter((q) => !coord.has(q)).map((q) => L[q]).join(", ") || "-"}`);

// Labels with a disambiguator, the Managua pattern: Help:Label keeps them out of labels.
const lab = await sparql(`SELECT ?cap ?l WHERE { ${vals} ?cap rdfs:label ?l . FILTER(REGEX(?l, "\\\\(.+\\\\)")) }`);
const perCap = {};
for (const r of lab) (perCap[r.cap] ??= []).push(r.l);
console.log(`\nlabels with a parenthetical: ${lab.length} on ${Object.keys(perCap).length} capitals`);
for (const [q, ls] of Object.entries(perCap)) console.log(`  ${L[q]} (${q}): ${ls.length}: ${[...new Set(ls)].slice(0, 6).join(" | ")}`);
