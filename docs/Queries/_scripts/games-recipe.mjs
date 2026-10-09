// The recipe a generalized Games dump needs, per series and season: how its editions link
// to it, how its events hang below an edition and carry their sport, which edition is
// current, and which P641 values are no sport (events, classes) for the exclusion list.
//
//   node games-recipe.mjs
import { labels, sparql } from "./wd.mjs";

const SERIES = {
  "Olympics summer": "Q159821",
  "Olympics winter": "Q82414",
  "Paralympics summer": "Q3327913",
  "Paralympics winter": "Q3317976",
  "World Games": "Q673097",
  "Commonwealth Games": "Q178340",
  "Asian Games summer": "Q483463",
  "Asian Games winter": "Q818463",
};
const LINKS = ["P31", "P179", "P3450", "P361"];
const today = new Date().toISOString().slice(0, 10);
const SPORT = "Q349";

for (const [name, q] of Object.entries(SERIES)) {
  console.log(`\n== ${name} (${q}) ==`);
  // Editions: anything linked to the series by one of the four properties that has a date
  // of its own (the series' events, linked by P361 too, carry none or the series' span).
  const eds = await sparql(`SELECT ?ed ?p ?start ?point WHERE {
    VALUES ?p { ${LINKS.map((p) => `wdt:${p}`).join(" ")} }
    ?ed ?p wd:${q} .
    OPTIONAL { ?ed wdt:P580 ?start } OPTIONAL { ?ed wdt:P585 ?point }
    FILTER(BOUND(?start) || BOUND(?point))
    FILTER NOT EXISTS { ?ed wdt:P31 wd:Q5 }
  }`);
  // The start date where there is one: P585 is often a bare year (2024-01-01).
  for (const r of eds) r.date = r.start ?? r.point;
  const byEd = new Map();
  for (const r of eds) {
    const p = r.p.replace("http://www.wikidata.org/prop/direct/", "");
    const e = byEd.get(r.ed) ?? byEd.set(r.ed, { date: r.date.slice(0, 10), links: new Set() }).get(r.ed);
    if (r.start && r.start.slice(0, 10) < e.date) e.date = r.start.slice(0, 10);
    e.links.add(p);
  }
  const linkCount = {};
  for (const e of byEd.values()) for (const p of e.links) linkCount[p] = (linkCount[p] ?? 0) + 1;
  // An edition only via P361 may be an event of the series, not an edition: count apart.
  const onlyPartOf = [...byEd.values()].filter((e) => e.links.size === 1 && e.links.has("P361")).length;
  const sorted = [...byEd].sort((a, b) => a[1].date.localeCompare(b[1].date));
  const begun = sorted.filter(([, e]) => e.date <= today);
  const current = begun.at(-1), next = sorted.find(([, e]) => e.date > today);
  const L = await labels([...byEd.keys()]);
  console.log(`editions with a date: ${byEd.size} (links: ${JSON.stringify(linkCount)}; only via P361: ${onlyPartOf})`);
  console.log(`first ${sorted[0]?.[1].date} ${L[sorted[0]?.[0]]}; current ${current?.[1].date} ${L[current?.[0]]}; next ${next ? `${next[1].date} ${L[next[0]]}` : "-"}`);

  // Events and their sport, per depth below each edition.
  const depth = { 1: new Set(), 2: new Set() };
  const sportsAt = new Map();
  let demo = 0;
  for (const [ed] of byEd) {
    // One query per depth: a UNION, or testing each event for the class, times out on
    // the large Summer editions.
    for (const d of [1, 2]) {
      const path = d === 1 ? "wdt:P361" : "wdt:P361/wdt:P361";
      for (const r of await sparql(`SELECT DISTINCT ?sport WHERE { ?ev ${path} wd:${ed} ; wdt:P641 ?sport . }`)) {
        depth[d].add(r.sport);
        (sportsAt.get(ed) ?? sportsAt.set(ed, new Set()).get(ed)).add(r.sport);
      }
    }
    const [dm] = await sparql(`SELECT (COUNT(DISTINCT ?ev) AS ?n) WHERE { ?ev wdt:P361 wd:${ed} ; wdt:P31 wd:Q1123217 . }`);
    demo += Number(dm.n);
  }
  const all = new Set([...depth[1], ...depth[2]]);
  const series = (await sparql(`SELECT DISTINCT ?sport WHERE { ?ev wdt:P361 wd:${q} ; wdt:P641 ?sport . }`)).map((r) => r.sport);
  const editionsWithSports = [...byEd.keys()].filter((e) => sportsAt.has(e)).length;
  console.log(`events' sports: depth 1 ${depth[1].size}, depth 2 ${depth[2].size}, together ${all.size}; editions with any: ${editionsWithSports}/${byEd.size}; demonstration events ${demo}; series-level events' sports ${series.length}`);
  if (current) console.log(`sports at the current edition: ${sportsAt.get(current[0])?.size ?? 0}`);

  // No sport: a P641 value that is neither a sport nor below one (an event such as 100 metres).
  const ids = [...new Set([...all, ...series])];
  const ok = new Set();
  // Walked upward from each value (gearing forward): from "sport" downward the tree is
  // too large and the query times out.
  for (let i = 0; i < ids.length; i += 25) {
    const chunk = ids.slice(i, i + 25).map((s) => `wd:${s}`).join(" ");
    for (const r of await sparql(`SELECT DISTINCT ?s WHERE { VALUES ?s { ${chunk} } ?s (wdt:P31|wdt:P279)/wdt:P279* wd:${SPORT} . hint:Prior hint:gearing "forward" . }`)) ok.add(r.s);
  }
  const bad = ids.filter((s) => !ok.has(s));
  const BL = await labels(bad);
  console.log(`P641 values not under "sport": ${bad.length}${bad.length ? ": " + bad.slice(0, 25).map((s) => `${BL[s] ?? s} (${s})`).join(", ") : ""}`);
}
