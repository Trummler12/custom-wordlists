// What Wikidata offers for country subdivisions and their capitals: the ISO 3166-2 code (P300) as the base,
// how many are current, how they spread over countries, and how many name a capital (P36).
//
//   node subdivisions.mjs
import { sparql } from "./wd.mjs";

const count = async (label, body) => {
  const [r] = await sparql(`SELECT (COUNT(DISTINCT ?s) AS ?n) WHERE { ${body} }`);
  console.log(`${String(r.n).padStart(7)}  ${label}`);
  return Number(r.n);
};
// Current = not dissolved (P576) and holding a P300 statement without an end time (codes change: CN-11 => CN-BJ in 2017).
// An ISO 3166-2 code has the country's alpha-2 before the hyphen; a subdivision of a subdivision (FR-75C under FR-IDF) has a parent code (P131 to a coded item).
const CUR = "FILTER NOT EXISTS { ?s wdt:P576 [] } FILTER EXISTS { ?s p:P300 ?st . FILTER NOT EXISTS { ?st pq:P582 [] } }";

// Per country, computed here (the grouped query times out): every P300 statement with its end time, dissolution,
// a parent that carries a code itself (a country or dependency with an ISO 3166-1 code, P297, is no such parent:
// the UK carries GB-UKM), a capital, and whether the item is a country or dependency itself (then it is no subdivision).
const raw = await sparql(`SELECT ?s ?code ?end ?gone ?pc ?cap ?a2 WHERE { ?s p:P300 ?cs . ?cs ps:P300 ?code .
  OPTIONAL { ?cs pq:P582 ?end } OPTIONAL { ?s wdt:P576 ?gone } OPTIONAL { ?s wdt:P131 ?p . ?p wdt:P300 ?pc FILTER NOT EXISTS { ?p wdt:P297 [] } } OPTIONAL { ?s wdt:P36 ?cap } OPTIONAL { ?s wdt:P297 ?a2 } }`);
const items = new Map();
for (const r of raw) {
  const o = items.get(r.s) ?? items.set(r.s, { codes: new Set(), live: false, gone: false, nested: false, cap: false }).get(r.s);
  o.codes.add(r.code); if (!r.end) o.live = true; if (r.gone) o.gone = true; if (r.pc) o.nested = true; if (r.cap) o.cap = true; if (r.a2) o.country = true;
}
const per = new Map();
for (const [, o] of items) {
  if (!o.live || o.gone || o.nested || o.country) continue;
  const c = [...o.codes][0].split("-")[0], p = per.get(c) ?? per.set(c, { n: 0, caps: 0 }).get(c);
  p.n++; if (o.cap) p.caps++;
}
const rows = [...per].sort((x, y) => y[1].n - x[1].n);
const B = [...items].filter(([, o]) => o.live && !o.gone && !o.nested && !o.country);
console.log(`base (current code, not dissolved, not inside a coded subdivision, not a country): ${B.length}, with a capital ${B.filter(([, o]) => o.cap).length}`);
console.log(`countries with coded subdivisions: ${rows.length}`);
console.log("most:", rows.slice(0, 15).map(([c, p]) => `${c} ${p.n} (caps ${p.caps})`).join(", "));
console.log("fewest:", rows.slice(-15).map(([c, p]) => `${c} ${p.n}`).join(", "));
console.log("without any capital:", rows.filter(([, p]) => p.caps === 0).map(([c, p]) => `${c} ${p.n}`).join(", "));

// Against Wikidata's class first-level administrative country subdivision (Q10864048, P31 or a subclass of it).
const base = new Set([...items].filter(([, o]) => o.live && !o.gone && !o.nested && !o.country).map(([s]) => s));
const cls = await sparql(`SELECT DISTINCT ?s WHERE { ?s wdt:P31/wdt:P279* wd:Q10864048 . FILTER NOT EXISTS { ?s wdt:P576 [] } }`);
const C = new Set(cls.map((r) => r.s));
console.log(`\nclass Q10864048, not dissolved: ${C.size}; also in the ISO base: ${[...C].filter((s) => base.has(s)).length}; ISO base not in the class: ${[...base].filter((s) => !C.has(s)).length}; class without a current code: ${[...C].filter((s) => !base.has(s)).length}`);
// The two differences, top 20 by sitelinks each.
const { labels } = await import("./wd.mjs");
const top = async (set) => {
  const ids = [...set].map((s) => s.split("/").pop());
  const r = [];
  for (let i = 0; i < ids.length; i += 200) r.push(...(await sparql(`SELECT ?s ?n WHERE { VALUES ?s { ${ids.slice(i, i + 200).map((q) => "wd:" + q).join(" ")} } ?s wikibase:sitelinks ?n }`)));
  const t = r.sort((a, b) => b.n - a.n).slice(0, 20), L = await labels(t.map((x) => x.s.split("/").pop()));
  return t.map((x) => `${L[x.s.split("/").pop()]} ${x.n}`).join(", ");
};
console.log("ISO base, not in the class:", await top(new Set([...base].filter((s) => !C.has(s)))));
console.log("class, no current code:", await top(new Set([...C].filter((s) => !base.has(s)))));
