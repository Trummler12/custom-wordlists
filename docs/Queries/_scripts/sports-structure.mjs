// What the candidate Sports rubrics would hold, to choose the level between `sports/` and
// the rubrics: per multi-sport series, league and single-sport championship, how many
// people its model reaches and how many clear the athletes' floor (20 language Wikipedias).
//
//   node sports-structure.mjs        (needs ../_data/athlete-tiers.json for the Olympians)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sparql } from "./wd.mjs";

const FLOOR = 20;

/** Language Wikipedias per person, for those with ≥ FLOOR sitelinks at all (an upper
 *  bound, so the cheap filter goes first). Through the entity API with #35's site test,
 *  so the count is the one terms() takes; SPARQL times out on it. */
const NOT_WIKIPEDIA = ["commonswiki", "specieswiki", "metawiki", "mediawikiwiki", "wikidatawiki", "sourceswiki", "wikifunctionswiki", "outreachwiki", "incubatorwiki"];
const isWikipedia = (site) => /^[a-z_]+wiki$/.test(site) && !NOT_WIKIPEDIA.includes(site);
const wikis = new Map();
async function wikipedias(ids) {
  const todo = ids.filter((h) => !wikis.has(h));
  for (let i = 0; i < todo.length; i += 50) {
    const url = `https://www.wikidata.org/w/api.php?format=json&action=wbgetentities&props=sitelinks&ids=${todo.slice(i, i + 50).join("|")}`;
    const r = await (await fetch(url, { headers: { "User-Agent": "custom-wordlists-analysis/1.0 (https://github.com/Trummler12/custom-wordlists)" } })).json();
    for (const [q, e] of Object.entries(r.entities)) wikis.set(q, Object.keys(e.sitelinks ?? {}).filter(isWikipedia).length);
  }
}

/** People matching any of `bodies` (one query each, merged here: a whole series in one
 *  query times out), and the set of those with ≥ FLOOR Wikipedias. */
async function people(label, bodies) {
  const all = new Set(), cand = new Set();
  for (const who of [bodies].flat()) {
    for (const r of await sparql(`SELECT DISTINCT ?h ?sl WHERE { ${who} ?h wikibase:sitelinks ?sl . }`)) {
      all.add(r.h);
      if (Number(r.sl) >= FLOOR) cand.add(r.h);
    }
  }
  await wikipedias([...cand]);
  const top = new Set([...cand].filter((h) => wikis.get(h) >= FLOOR));
  console.log(`${label.padEnd(36)} ${String(all.size).padStart(7)} people, ${String(top.size).padStart(5)} with ≥ ${FLOOR} Wikipedias`);
  return top;
}

/** Participation as for the Olympics: P1344 to an edition of the series or up to two
 *  levels below it, one body per edition. Editions link to their series four ways
 *  (Paralympics and Tour de France by P31, Commonwealth Games by P179, Asian Games by
 *  P3450, World Cup by both), so all four are read. */
async function inSeries(q) {
  const eds = await sparql(`SELECT DISTINCT ?ed WHERE { ?ed wdt:P31|wdt:P179|wdt:P361|wdt:P3450 wd:${q} . FILTER NOT EXISTS { ?ed wdt:P31 wd:Q5 } }`);
  return eds.map(
    ({ ed }) => `{ ?h wdt:P1344 wd:${ed} } UNION { ?e wdt:P361 wd:${ed} . ?h wdt:P1344 ?e } UNION { ?e wdt:P361/wdt:P361 wd:${ed} . ?h wdt:P1344 ?e }
    ?h wdt:P31 wd:Q5 .`,
  );
}

const tiers = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "_data", "athlete-tiers.json"), "utf8"));
const olympians = new Set(Object.entries(tiers).filter(([, p]) => p.w >= FLOOR).map(([h]) => h));
const overlap = (s) => console.log(`${"".padEnd(36)} of them Olympians: ${[...s].filter((h) => olympians.has(h)).length}`);

console.log("== multi-sport games (participation in an edition; the Olympics: athlete-tiers.mjs) ==");
const MULTI = {
  "Summer Paralympics": "Q3327913", "Winter Paralympics": "Q3317976",
  "Summer Youth Olympics": "Q3178415", "Winter Youth Olympics": "Q3178414",
  "World Games": "Q673097", "Commonwealth Games": "Q178340", "Asian Games": "Q483463",
  "Pan American Games": "Q230186", "European Games": "Q641572", "Mediterranean Games": "Q272090",
};
for (const [name, q] of Object.entries(MULTI)) overlap(await people(name, await inSeries(q)));

console.log("\n== athlete-ID properties (people holding one) ==");
for (const [name, p] of Object.entries({ "Paralympic.org": "P7550", "World Games": "P4588" })) await people(name, `?h wdt:${p} [] .`);

console.log("\n== leagues (team P118 the league, player P54 a team of it) ==");
const LEAGUES = {
  NBA: "Q155223", NFL: "Q1215884", NHL: "Q1215892", MLB: "Q1163715",
  "Premier League": "Q9448", "La Liga": "Q324867", Bundesliga: "Q82595", "Serie A": "Q15804",
};
for (const [name, q] of Object.entries(LEAGUES)) {
  const [t] = await sparql(`SELECT (COUNT(DISTINCT ?t) AS ?n) (COUNT(DISTINCT ?cur) AS ?c) WHERE {
    ?t wdt:P118 wd:${q} . OPTIONAL { FILTER NOT EXISTS { ?t wdt:P576 [] } BIND(?t AS ?cur) } }`);
  console.log(`${name}: teams ${t.n} (not dissolved ${t.c})`);
  overlap(await people(`  players`, `?t wdt:P118 wd:${q} . ?h wdt:P54 ?t ; wdt:P31 wd:Q5 .`));
}

console.log("\n== single-sport championships ==");
overlap(await people("FIFA World Cup (participation)", await inSeries("Q19317")));
overlap(await people("Tour de France (participation)", await inSeries("Q33881")));
overlap(await people("Formula One drivers (occupation)", "?h wdt:P106 wd:Q10841764 ."));
overlap(await people("tennis players (occupation)", "?h wdt:P106 wd:Q10833314 ."));
