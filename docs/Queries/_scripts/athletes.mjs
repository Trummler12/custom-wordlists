// How complete Olympic athletes are on Wikidata: who is there (Olympedia ID), what their
// participations and medals carry, and how fame spreads.
//
//   node athletes.mjs
//
// The model, as found on the items: an athlete's P1344 (participant in) names the event
// ("swimming at the 2008 Summer Olympics – men's 200 metre freestyle"), which is part of
// the sport at that Games, which is part of the edition; the medal (P166) and the rank
// (P1352) ride on the P1344 statement as qualifiers. Editions are instances of the two
// edition classes below, not of the series items (Q159821 / Q82414).
import { sparql } from "./wd.mjs";

const MEDALS = "wd:Q15243387 wd:Q15889641 wd:Q15889643"; // gold, silver, bronze
const ED = "VALUES ?k { wd:Q135976384 wd:Q137592217 } ?ed wdt:P31 ?k .";
const count = async (label, body) => {
  const [r] = await sparql(`SELECT (COUNT(DISTINCT ?h) AS ?n) WHERE { ${body} }`);
  console.log(`${String(r.n).padStart(8)}  ${label}`);
  return Number(r.n);
};

console.log("== who ==");
await count("people with an Olympedia ID (P8286)", "?h wdt:P8286 [] .");
await count("  of them human (P31 Q5)", "?h wdt:P8286 [] ; wdt:P31 wd:Q5 .");
await count("  with a sport (P641)", "?h wdt:P8286 [] ; wdt:P641 [] .");
for (const n of [10, 20, 30, 50, 100]) await count(`  with ≥ ${n} sitelinks`, `?h wdt:P8286 [] ; wikibase:sitelinks ?l . FILTER(?l >= ${n})`);

console.log("\n== participations (P1344) ==");
await count("Olympedia people with any P1344", "?h wdt:P8286 [] ; wdt:P1344 [] .");
await count("  P1344 to an Olympic event (event => sport at Games => edition)", `?h wdt:P8286 [] ; wdt:P1344 ?e . ?e wdt:P361/wdt:P361 ?ed . ${ED}`);
await count("  of them with a rank (pq:P1352)", `?h wdt:P8286 [] ; p:P1344 ?s . ?s ps:P1344 ?e ; pq:P1352 [] . ?e wdt:P361/wdt:P361 ?ed . ${ED}`);

console.log("\n== medals (pq:P166 on the participation) ==");
await count("people with an Olympic medal qualifier", `VALUES ?m { ${MEDALS} } ?h p:P1344 ?s . ?s pq:P166 ?m .`);
await count("  gold", "?h p:P1344 ?s . ?s pq:P166 wd:Q15243387 .");
await count("  people with rank 1-3 on an Olympic event", `?h wdt:P8286 [] ; p:P1344 ?s . ?s ps:P1344 ?e ; pq:P1352 ?r . FILTER(?r <= 3) ?e wdt:P361/wdt:P361 ?ed . ${ED}`);
for (const n of [20, 50, 100]) await count(`  medallists with ≥ ${n} sitelinks`, `VALUES ?m { ${MEDALS} } ?h p:P1344 ?s ; wikibase:sitelinks ?l . ?s pq:P166 ?m . FILTER(?l >= ${n})`);
await count("people with a medal as a direct P166 (other modelling)", `VALUES ?m { ${MEDALS} } ?h wdt:P166 ?m .`);
