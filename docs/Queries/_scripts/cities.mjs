// What Wikidata offers for cities: the items with a population (P1082) of 100,000 or more, sorted here into
// settlements (a class under human settlement, Q486972) and the rest (countries, regions, districts), and within
// the settlements those in the class city (Q515). Classes are matched here, since the subclass closure joined with
// the population filter times out on the server.
//
//   node cities.mjs
import { sparql } from "./wd.mjs";

const settleCls = new Set((await sparql(`SELECT DISTINCT ?t WHERE { ?t wdt:P279* wd:Q486972 }`)).map((r) => r.t));
const cityCls = new Set((await sparql(`SELECT DISTINCT ?t WHERE { ?t wdt:P279* wd:Q515 }`)).map((r) => r.t));
console.log(`classes under human settlement: ${settleCls.size}, under city: ${cityCls.size}`);
const rows = await sparql(`SELECT ?c ?t ?n (MAX(?p) AS ?pop) WHERE { ?c wdt:P1082 ?p . FILTER(?p >= 100000) ?c wdt:P31 ?t ; wikibase:sitelinks ?n .
  FILTER NOT EXISTS { ?c wdt:P576 [] } } GROUP BY ?c ?t ?n`);
const items = new Map();
for (const r of rows) { const o = items.get(r.c) ?? items.set(r.c, { pop: +r.pop, n: +r.n, set: false, city: false }).get(r.c); if (settleCls.has(r.t)) o.set = true; if (cityCls.has(r.t)) o.city = true; }
const all = [...items.values()];
for (const b of [1e7, 1e6, 5e5, 1e5]) {
  const a = all.filter((o) => o.pop >= b), s = a.filter((o) => o.set), c = a.filter((o) => o.city);
  console.log(`population >= ${b.toLocaleString("en")}: ${a.length} items, ${s.length} settlements, ${c.length} in the class city`);
}
const s1 = all.filter((o) => o.set && o.pop >= 1e5);
for (const n of [50, 100, 150]) console.log(`settlements >= 100,000 with >= ${n} sitelinks: ${s1.filter((o) => o.n >= n).length}`);

// Probes: world cities a reader expects, and what the ten-million settlements are.
const { labels } = await import("./wd.mjs");
const probe = { Q1490: "Tokyo", Q1353: "Delhi", Q8686: "Shanghai", Q174: "São Paulo", Q1489: "Mexico City", Q85: "Cairo", Q1156: "Mumbai", Q956: "Beijing", Q60: "New York City", Q84: "London", Q90: "Paris", Q64: "Berlin", Q649: "Moscow", Q406: "Istanbul", Q8673: "Lagos", Q1726: "Munich", Q72: "Zurich", Q3130: "Sydney" };
for (const [q, l] of Object.entries(probe)) { const o = items.get("http://www.wikidata.org/entity/" + q) ?? items.get(q); console.log(`${l}: ${o ? `pop ${o.pop.toLocaleString("en")}, settlement ${o.set}, city ${o.city}` : "no population >= 100,000"}`); }
const big = [...items].filter(([, o]) => o.set && o.pop >= 1e7).sort((a, b) => b[1].pop - a[1].pop);
const L = await labels(big.map(([c]) => c.split("/").pop()));
console.log("settlements >= 10 M:", big.map(([c, o]) => `${L[c.split("/").pop()]} ${(o.pop / 1e6).toFixed(1)}`).join(", "));

// Without agglomerations: an item with a class under metropolitan area (Q1907114), urban agglomeration (Q159313),
// conurbation (Q245260) or urban area (Q702492) is dropped unless it is a city by another class than megacity (Q174844) or
// metropolis (Q200250): those two sit under city on Wikidata but name a size, which agglomerations reach too (Greater Mexico
// City is a megacity and a metropolitan area; Tokyo and Shanghai are megacities and big cities).
const agg = new Set((await sparql(`SELECT DISTINCT ?t WHERE { VALUES ?r { wd:Q1907114 wd:Q159313 wd:Q245260 wd:Q702492 } ?t wdt:P279* ?r }`)).map((r) => r.t));
const sizeCls = new Set((await sparql(`SELECT DISTINCT ?t WHERE { VALUES ?r { wd:Q174844 wd:Q200250 } ?t wdt:P279* ?r }`)).map((r) => r.t));
const flag = new Map();
for (const r of rows) { const o = flag.get(r.c) ?? flag.set(r.c, { agg: false, realCity: false }).get(r.c); if (agg.has(r.t)) o.agg = true; if (cityCls.has(r.t) && !sizeCls.has(r.t)) o.realCity = true; }
const aggItem = new Set([...flag].filter(([, o]) => o.agg && !o.realCity).map(([c]) => c));
for (const b of [1e7, 1e6, 1e5]) {
  const s = [...items].filter(([c, o]) => o.set && o.pop >= b && !aggItem.has(c));
  console.log(`settlements >= ${b.toLocaleString("en")} without agglomerations: ${s.length} (agglomerations dropped: ${[...items].filter(([c, o]) => o.set && o.pop >= b && aggItem.has(c)).length})`);
}
const big2 = [...items].filter(([c, o]) => o.set && o.pop >= 1e7 && !aggItem.has(c)).sort((a, b) => b[1].pop - a[1].pop);
const L2 = await labels(big2.map(([c]) => c.split("/").pop()));
console.log("left >= 10 M:", big2.map(([c, o]) => `${L2[c.split("/").pop()]} ${(o.pop / 1e6).toFixed(1)}`).join(", "));
for (const [q, l] of Object.entries(probe)) if (aggItem.has("http://www.wikidata.org/entity/" + q)) console.log("PROBE DROPPED:", l);
