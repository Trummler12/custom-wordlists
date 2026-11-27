// Size data for the water topics: how many oceans, seas, gulfs and bays carry an area (P2046), and rivers a length (P2043), and
// whether gulfs and bays can be told apart: by class, and by the size their classes show.
//
//   node water-size.mjs
import { sparql, labels } from "./wd.mjs";

const fresh = { fresh: true };
const cover = async (name, cls, prop) => {
  const v = cls.map((c) => "wd:" + c).join(" ");
  const r = await sparql(`SELECT ?s ?n (MAX(?a) AS ?size) (COUNT(DISTINCT ?a) AS ?vals) WHERE { VALUES ?k { ${v} } ?s wdt:P31 ?k ; wikibase:sitelinks ?n . FILTER(?n >= 5)
    OPTIONAL { ?s p:${prop}/psn:${prop}/wikibase:quantityAmount ?a } } GROUP BY ?s ?n`, fresh);
  const has = r.filter((x) => x.size), top = r.filter((x) => +x.n >= 50);
  console.log(`${name}: ${r.length} with 5+ sitelinks, ${has.length} with ${prop} (${Math.round((100 * has.length) / (r.length || 1))} %), several values ${r.filter((x) => +x.vals > 1).length}; of the ${top.length} with 50+ sitelinks, ${top.filter((x) => x.size).length} have it`);
  return r;
};
const seaCls = (await sparql(`SELECT DISTINCT ?t WHERE { VALUES ?r { wd:Q9430 wd:Q165 } ?t wdt:P279* ?r }`)).map((r) => r.t.split("/").pop());
await cover("oceans and seas", seaCls, "P2046");
const gulf = await cover("gulfs (direct P31)", ["Q1322134"], "P2046");
const bay = await cover("bays (direct P31)", ["Q39594"], "P2046");
await cover("fjords (direct P31)", ["Q45776"], "P2046");
await cover("straits (direct P31)", ["Q37901"], "P2046");
await cover("rivers (direct P31)", ["Q4022"], "P2043");
await cover("lakes (direct P31)", ["Q23397"], "P2046");

// Gulf or bay: items in both classes; for the items only in bay, how many are named Gulf.
const g = new Set(gulf.map((x) => x.s)), b = new Set(bay.map((x) => x.s)), both = [...g].filter((x) => b.has(x));
const L = await labels([...b].map((s) => s.split("/").pop()));
const namedGulf = [...b].filter((s) => !g.has(s) && /\b(gulf|golf|golfe)\b/i.test(L[s.split("/").pop()] ?? ""));
console.log(`\nin both classes: ${both.length}; only bay, named Gulf: ${namedGulf.length}: ${namedGulf.slice(0, 25).map((s) => L[s.split("/").pop()]).join(", ")}`);
const med = (a) => { const s = a.map(Number).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const bySize = (set) => med(set.filter((x) => x.size).map((x) => x.size));
console.log(`median area in m²: only gulf ${bySize(gulf.filter((x) => !b.has(x.s)))}, only bay named Gulf ${bySize(bay.filter((x) => namedGulf.includes(x.s)))}, other bays ${bySize(bay.filter((x) => !g.has(x.s) && !namedGulf.includes(x.s)))}`);
