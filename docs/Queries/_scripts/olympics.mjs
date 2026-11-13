// The Olympic sports analysis (sports/Olympics.md): which sports have been held at the
// Games, and per sport the editions it appears at, so the base list and the omission
// classes (discontinued, future, child discipline) can be read off one result.
//
//   node olympics.mjs [--json]
//
// Base: every item that is *part of* (P361) the Summer or Winter Olympic Games and names
// a *sport* (P641), whatever it is an instance of (basketball's series item is typed
// differently from the rest, so a P31 condition loses it). Editions: the same per
// Games edition (P361 = "2024 Summer Olympics" etc.).
import { labels, sparql } from "./wd.mjs";

const SUMMER = "Q159821";
const WINTER = "Q82414";
// The current programme (latest Summer and Winter editions), the next announced one, and the
// previous ones for context. Missing per-edition data is fixed on Wikidata, not here.
const EDITIONS = { 2024: "Q995653", 2026: "Q4630399", 2028: "Q1451505", 2022: "Q193074", 2020: "Q181278" };

const base = await sparql(`SELECT DISTINCT ?sport ?games WHERE {
  VALUES ?games { wd:${SUMMER} wd:${WINTER} }
  ?ev wdt:P361 ?games ; wdt:P641 ?sport .
}`);
const sports = new Map();
for (const r of base) {
  const s = sports.get(r.sport) ?? { games: new Set(), editions: new Set() };
  s.games.add(r.games === SUMMER ? "S" : "W");
  sports.set(r.sport, s);
}

// An edition's sports: events that are part of the edition itself, or of an event that is.
for (const [year, q] of Object.entries(EDITIONS)) {
  const rows = await sparql(`SELECT DISTINCT ?sport WHERE {
    { ?ev wdt:P361 wd:${q} } UNION { ?ev wdt:P361/wdt:P361 wd:${q} }
    ?ev wdt:P641 ?sport .
  }`);
  for (const r of rows) {
    if (!sports.has(r.sport)) sports.set(r.sport, { games: new Set(["?"]), editions: new Set() });
    sports.get(r.sport).editions.add(year);
  }
}

// Fame: sitelinks, and whether a sport is a subclass / part of another listed sport.
const ids = [...sports.keys()];
const extra = await sparql(`SELECT ?s ?links ?parent WHERE {
  VALUES ?s { ${ids.map((i) => `wd:${i}`).join(" ")} }
  OPTIONAL { ?s wikibase:sitelinks ?links }
  OPTIONAL { ?s wdt:P279|wdt:P361 ?parent . VALUES ?parent { ${ids.map((i) => `wd:${i}`).join(" ")} } }
}`);
for (const r of extra) {
  const s = sports.get(r.s);
  s.links = Number(r.links ?? 0);
  if (r.parent && r.parent !== r.s) (s.parents ??= new Set()).add(r.parent);
}
const L = await labels(ids);

const rows = [...sports.entries()]
  .map(([q, s]) => ({
    q,
    name: L[q] ?? "(no label)",
    games: [...s.games].sort().join(""),
    editions: [...s.editions].sort().join(","),
    links: s.links ?? 0,
    parents: [...(s.parents ?? [])].map((p) => L[p] ?? p).join(", "),
  }))
  .sort((a, b) => b.links - a.links);

if (process.argv.includes("--json")) console.log(JSON.stringify(rows, null, 2));
else {
  console.log(`${rows.length} sports`);
  for (const r of rows) {
    console.log(`${r.q.padEnd(11)} ${String(r.links).padStart(4)} ${r.games.padEnd(3)} ${r.editions.padEnd(25)} ${r.name}${r.parents ? `  < ${r.parents}` : ""}`);
  }
}
