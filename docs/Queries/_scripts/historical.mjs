// Candidate queries for historical countries (geography/Human.md, Countries): how many
// items each returns, how many of a reference set of well-known historical states it
// finds, and how much shrinks under a sitelink threshold (fame as the ballast filter).
//
//   node historical.mjs [--min N]   (sitelink threshold for the filtered columns, default 30)
import { sparql } from "./wd.mjs";

const args = process.argv.slice(2);
const MIN = Number(args[args.indexOf("--min") + 1]) || 30;

// Well-known historical states a reader would expect, by English label.
const REFERENCE = [
  "Roman Empire", "Byzantine Empire", "Ottoman Empire", "Mongol Empire", "Achaemenid Empire",
  "Holy Roman Empire", "Soviet Union", "Austria-Hungary", "Kingdom of Prussia", "Yugoslavia",
  "Czechoslovakia", "East Germany", "Aztec Empire", "Inca Empire", "Ancient Egypt",
  "Babylonia", "Carthage", "Russian Empire", "Mughal Empire", "Qing dynasty",
  "Han dynasty", "Ming dynasty", "British Raj", "Kingdom of Sardinia", "Republic of Venice",
  "Western Roman Empire", "Seleucid Empire", "Sasanian Empire", "Macedonia (ancient kingdom)",
  "Assyria", "Mali Empire", "Kingdom of Hawaii", "Confederate States of America", "Empire of Japan",
  "German Empire", "Republic of Texas", "Ptolemaic Kingdom", "Abbasid Caliphate", "Umayyad Caliphate",
];

// A label names several items (the state, a film, a disambiguation page); the state is
// the one with the most sitelinks.
const refRows = await sparql(`SELECT ?i ?l ?links WHERE {
  VALUES ?l { ${REFERENCE.map((r) => JSON.stringify(r) + "@en").join(" ")} }
  ?i rdfs:label ?l ; wikibase:sitelinks ?links .
}`);
const refIds = new Map();
const best = new Map();
for (const r of refRows) {
  if (Number(r.links) > (best.get(r.l) ?? -1)) {
    best.set(r.l, Number(r.links));
    refIds.set(r.l, r.i);
  }
}
const unresolved = REFERENCE.filter((r) => !refIds.has(r));

const CANDIDATES = {
  "historical country, direct": `?i wdt:P31 wd:Q3024240 .`,
  "historical country, with subclasses": `?i wdt:P31/wdt:P279* wd:Q3024240 .`,
  "former sovereign state (ended P31 statement)": `?i p:P31 ?st . ?st ps:P31 wd:Q3624078 ; pq:P582 ?end .`,
  "dissolved (P576) + any state class": `?i wdt:P576 ?d ; wdt:P31/wdt:P279* wd:Q7275 .`,
  "union: historical country (sub) or former sovereign state": `{ ?i wdt:P31/wdt:P279* wd:Q3024240 . } UNION { ?i p:P31 ?st . ?st ps:P31 wd:Q3624078 ; pq:P582 ?end . }`,
};

console.log(`reference: ${refIds.size} resolved${unresolved.length ? `, unresolved: ${unresolved.join(", ")}` : ""}`);
console.log(`candidate | all | found of reference | with >= ${MIN} sitelinks | reference found among those`);
for (const [name, body] of Object.entries(CANDIDATES)) {
  const all = await sparql(`SELECT DISTINCT ?i ?links WHERE { ${body} OPTIONAL { ?i wikibase:sitelinks ?links } }`);
  const ids = new Set(all.map((r) => r.i));
  const famous = new Set(all.filter((r) => Number(r.links ?? 0) >= MIN).map((r) => r.i));
  const ref = [...refIds.values()];
  const found = ref.filter((q) => ids.has(q));
  const foundFamous = ref.filter((q) => famous.has(q));
  const missing = [...refIds].filter(([, q]) => !ids.has(q)).map(([l]) => l);
  console.log(`${name} | ${ids.size} | ${found.length}/${ref.length} | ${famous.size} | ${foundFamous.length}/${ref.length}`);
  if (missing.length) console.log(`  missing: ${missing.join(", ")}`);
}
