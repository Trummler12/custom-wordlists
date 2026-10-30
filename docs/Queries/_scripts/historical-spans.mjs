// Dates and continents of the historical-country candidates (geography/Human.md, strand H
// of the extend PR): which date properties they carry, the centuries their spans start
// and end in, and how many can be placed on a continent.
//
//   node historical-spans.mjs [--min N] [--json]
//
// Span per side: start = inception (P571), else start time (P580); end = dissolved
// (P576), else end time (P582); several values => earliest start, latest end. Continent:
// P30 on the item, else P30 of its capital (P36). Centuries: 1 = years 1..100, -1 = 100
// BC..1 BC (Wikidata stores 753 BC as year -752 / -753 depending on the source; the
// bucket is the same either way).
import { sparql } from "./wd.mjs";

const args = process.argv.slice(2);
const MIN = Number(args[args.indexOf("--min") + 1]) || 30;
// The visible inclusion list: states typed otherwise (see Human.md).
const INCLUDE = ["Q6343" /* Carthage */, "Q41137" /* Assyria */];

const base = `{ ?i wdt:P31/wdt:P279* wd:Q3024240 ; wikibase:sitelinks ?links . FILTER(?links >= ${MIN}) }
  UNION { VALUES ?i { ${INCLUDE.map((q) => `wd:${q}`).join(" ")} } }`;

const dates = await sparql(`SELECT ?i ?p (YEAR(?d) AS ?y) WHERE {
  ${base}
  VALUES (?p ?prop) { ("P571" wdt:P571) ("P576" wdt:P576) ("P580" wdt:P580) ("P582" wdt:P582) }
  OPTIONAL { ?i ?prop ?d . }
}`);
const conts = await sparql(`SELECT ?i ?direct ?viaCapital WHERE {
  ${base}
  OPTIONAL { ?i wdt:P30 ?direct . }
  OPTIONAL { ?i wdt:P36/wdt:P30 ?viaCapital . }
}`);

const items = new Map();
const get = (i) => items.get(i) ?? items.set(i, { P571: [], P576: [], P580: [], P582: [], direct: new Set(), viaCapital: new Set() }).get(i);
for (const r of dates) {
  const it = get(r.i);
  if (r.y !== undefined) it[r.p].push(Number(r.y));
}
for (const r of conts) {
  const it = get(r.i);
  if (r.direct) it.direct.add(r.direct);
  if (r.viaCapital) it.viaCapital.add(r.viaCapital);
}

const century = (y) => (y > 0 ? Math.ceil(y / 100) : -Math.ceil((1 - y) / 100));
const label = (c) => (c > 0 ? `${c}` : `${-c} BC`);
const count = {};
const has = (k) => [...items.values()].filter((it) => it[k].length).length;
let noStart = 0, noEnd = 0, none = 0, startAfterEnd = 0, endFuture = 0, contDirect = 0, contCapital = 0, contNone = 0, multiCont = 0;
const startC = {}, endC = {};
const flagged = [];
for (const [q, it] of items) {
  const s = it.P571.length ? Math.min(...it.P571) : it.P580.length ? Math.min(...it.P580) : null;
  const e = it.P576.length ? Math.max(...it.P576) : it.P582.length ? Math.max(...it.P582) : null;
  if (s === null) noStart++;
  if (e === null) noEnd++;
  if (s === null && e === null) none++;
  if (s !== null) startC[century(s)] = (startC[century(s)] ?? 0) + 1;
  if (e !== null) endC[century(e)] = (endC[century(e)] ?? 0) + 1;
  if (s !== null && e !== null && s > e) { startAfterEnd++; flagged.push(`${q} starts ${s} after it ends ${e}`); }
  if (e !== null && e > 2026) { endFuture++; flagged.push(`${q} ends in ${e}`); }
  const c = it.direct.size ? it.direct : it.viaCapital;
  if (it.direct.size) contDirect++;
  else if (it.viaCapital.size) contCapital++;
  else contNone++;
  if (c.size > 1) multiCont++;
}
const dist = (o) =>
  Object.keys(o).map(Number).sort((a, b) => a - b).map((c) => `${label(c)}: ${o[c]}`).join(", ");

const out = {
  items: items.size,
  coverage: { P571: has("P571"), P576: has("P576"), P580: has("P580"), P582: has("P582"), noStart, noEnd, none },
  startCenturies: dist(startC),
  endCenturies: dist(endC),
  continents: { direct: contDirect, viaCapital: contCapital, none: contNone, multiple: multiCont },
  flagged: { startAfterEnd, endFuture, list: flagged },
};
if (args.includes("--json")) console.log(JSON.stringify(out, null, 2));
else {
  console.log(`${out.items} items (>= ${MIN} sitelinks + ${INCLUDE.length} included)`);
  console.log("date coverage:", out.coverage);
  console.log("start centuries:", out.startCenturies);
  console.log("end centuries:", out.endCenturies);
  console.log("continents:", out.continents);
  console.log(`flagged: ${startAfterEnd} start after end, ${endFuture} end after 2026`);
  for (const f of flagged) console.log("  " + f);
}
