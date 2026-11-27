// World Heritage Sites by designation (P1435) and ID (P757), currencies by ISO 4217 code (P498), and how the probes of the class pass are typed.
import { sparql, labels } from "./wd.mjs";
const f = { fresh: true };
const list = (a) => a.map((x) => `${x.l} ${x.n}`).join(", ");
const named = async (r) => { const L = await labels(r.map((x) => x.s.split("/").pop())); return r.map((x) => ({ ...x, l: L[x.s.split("/").pop()] })); };

const des = await named(await sparql(`SELECT ?s (MAX(?k) AS ?n) WHERE { ?s wdt:P1435 wd:Q9259 ; wikibase:sitelinks ?k } GROUP BY ?s`, f));
const id = await sparql(`SELECT (COUNT(DISTINCT ?s) AS ?c) (COUNT(DISTINCT ?i) AS ?ids) WHERE { ?s wdt:P757 ?i }`, f);
const bare = await sparql(`SELECT (COUNT(DISTINCT ?s) AS ?c) WHERE { ?s wdt:P757 [] . FILTER NOT EXISTS { ?s wdt:P1435 wd:Q9259 } }`, f);
const miss = await sparql(`SELECT (COUNT(DISTINCT ?s) AS ?c) WHERE { ?s wdt:P1435 wd:Q9259 . FILTER NOT EXISTS { ?s wdt:P757 [] } }`, f);
const ended = await sparql(`SELECT ?s ?t WHERE { ?s p:P1435 ?st . ?st ps:P1435 wd:Q9259 ; pq:P582 ?t }`, f);
des.sort((a, b) => b.n - a.n);
console.log(`WHS: designation ${des.length} (20+ sitelinks ${des.filter((x) => +x.n >= 20).length}, 50+ ${des.filter((x) => +x.n >= 50).length}), P757 items ${id[0].c} ids ${id[0].ids}; P757 without designation ${bare[0].c}; designation without P757 ${miss[0].c}; designation ended ${ended.length}`);
console.log("top:", list(des.slice(0, 25)));
const want = ["Great Wall of China", "Taj Mahal", "Acropolis of Athens", "Machu Picchu", "Great Barrier Reef", "Venice", "Petra", "Angkor", "Statue of Liberty", "Historic Centre of Rome", "Yellowstone National Park", "Grand Canyon National Park", "Pyramids of Giza", "Giza pyramid complex", "Kremlin", "Moscow Kremlin", "Palace of Versailles", "Alhambra", "Stonehenge", "Colosseum"];
console.log("probes:", want.map((p) => `${p} ${des.some((x) => x.l === p) ? "ok" : "NOT"}`).join(", "));

const cur = await named(await sparql(`SELECT ?s (MAX(?k) AS ?n) (SAMPLE(?c) AS ?code) (SAMPLE(?e) AS ?end) WHERE { ?s wdt:P498 ?c ; wikibase:sitelinks ?k . OPTIONAL { ?s wdt:P582|wdt:P576|wdt:P2669 ?e } } GROUP BY ?s`, f));
cur.sort((a, b) => b.n - a.n);
const used = await sparql(`SELECT ?s (COUNT(DISTINCT ?c) AS ?u) WHERE { ?c wdt:P38 ?s ; wdt:P31 wd:Q3624078 } GROUP BY ?s`, f);
const U = new Map(used.map((x) => [x.s, +x.u]));
console.log(`\nCurrencies: ISO 4217 code ${cur.length}, with an end date ${cur.filter((x) => x.end).length}, 20+ sitelinks ${cur.filter((x) => +x.n >= 20).length}; used by a sovereign state (P38) ${cur.filter((x) => U.has(x.s)).length} of the coded, all ${used.length}`);
console.log("top with countries:", cur.slice(0, 16).map((x) => `${x.l} ${x.n}/${U.get(x.s) ?? 0}${x.end ? "†" : ""}`).join(", "));
console.log("most countries:", [...U].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([s, u]) => `${cur.find((x) => x.s === s)?.l ?? s.split("/").pop()} ${u}`).join(", "));
const old = cur.filter((x) => x.end);
console.log("ended, top:", list(old.slice(0, 14)));
console.log("coded but not currency-like:", cur.filter((x) => /^(gold|silver|platinum|palladium|special|bond|unit|test|no currency|european)/i.test(x.l ?? "")).map((x) => x.l).join(", "));
const crypto = await sparql(`SELECT (COUNT(DISTINCT ?s) AS ?c) WHERE { ?s wdt:P31/wdt:P279* wd:Q13479982 ; wikibase:sitelinks ?n FILTER(?n >= 20) }`, f);
const nocode = await named(await sparql(`SELECT ?s (MAX(?k) AS ?n) WHERE { ?s wdt:P31 wd:Q8142 ; wikibase:sitelinks ?k . FILTER(?k >= 40) FILTER NOT EXISTS { ?s wdt:P498 [] } } GROUP BY ?s`, f));
console.log(`crypto 20+: ${crypto[0].c}; currency without code at 40+: ${nocode.length}:`, list(nocode.sort((a, b) => b.n - a.n).slice(0, 20)));

const vol = await sparql(`SELECT ?s ?sl ?tl WHERE { VALUES ?s { wd:Q3 } ?s rdfs:label ?sl }`, f).catch(() => []);
const probe = ["Krakatoa", "Eyjafjallajökull", "Stromboli", "Yellowstone Caldera", "Mount Pinatubo"];
for (const p of probe) {
  const r = await sparql(`SELECT ?s ?tl ?n WHERE { ?s rdfs:label "${p}"@en ; wikibase:sitelinks ?n ; wdt:P31 ?t . ?t rdfs:label ?tl FILTER(LANG(?tl)="en") } ORDER BY DESC(?n) LIMIT 5`, f);
  console.log(p, r.map((x) => `${x.s.split("/").pop()} ${x.tl} ${x.n}`).join("; "));
}
