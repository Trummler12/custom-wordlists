// The child rule with Trummler's preference (2026-10-30): a base settlement inside another base settlement (P131, up to two
// steps) is dropped, unless parent and child share their English label (or the parent's label contains the child's: "City of
// Johannesburg Metropolitan Municipality"): then the child, the city itself, stays and the parent goes. Agglomeration rule as in cities.mjs.
//
//   node city-parts.mjs
import { sparql, labels } from "./wd.mjs";
const settle = new Set((await sparql(`SELECT DISTINCT ?t WHERE { ?t wdt:P279* wd:Q486972 }`)).map((r) => r.t));
const city = new Set((await sparql(`SELECT DISTINCT ?t WHERE { ?t wdt:P279* wd:Q515 }`)).map((r) => r.t));
const agg = new Set((await sparql(`SELECT DISTINCT ?t WHERE { VALUES ?r { wd:Q1907114 wd:Q159313 wd:Q245260 wd:Q702492 } ?t wdt:P279* ?r }`)).map((r) => r.t));
const size = new Set((await sparql(`SELECT DISTINCT ?t WHERE { VALUES ?r { wd:Q174844 wd:Q200250 } ?t wdt:P279* ?r }`)).map((r) => r.t));
const rows = await sparql(`SELECT ?c ?t ?n (MAX(?p) AS ?pop) WHERE { ?c wdt:P1082 ?p . FILTER(?p >= 100000) ?c wdt:P31 ?t ; wikibase:sitelinks ?n .
  FILTER NOT EXISTS { ?c wdt:P576 [] } } GROUP BY ?c ?t ?n`);
const it = new Map();
for (const r of rows) { const o = it.get(r.c) ?? it.set(r.c, { pop: +r.pop, set: false, agg: false, real: false }).get(r.c); if (settle.has(r.t)) o.set = true; if (agg.has(r.t)) o.agg = true; if (city.has(r.t) && !size.has(r.t)) o.real = true; }
const base = new Map([...it].filter(([, o]) => o.set && !(o.agg && !o.real)));
const ids = [...base.keys()].map((c) => c.split("/").pop()), par = new Map();
for (let i = 0; i < ids.length; i += 300) for (const r of await sparql(`SELECT ?c ?p ?p2 WHERE { VALUES ?c { ${ids.slice(i, i + 300).map((q) => "wd:" + q).join(" ")} } ?c wdt:P131 ?p . OPTIONAL { ?p wdt:P131 ?p2 } }`)) {
  const s = par.get(r.c) ?? par.set(r.c, new Set()).get(r.c); s.add(r.p); if (r.p2) s.add(r.p2);
}
const pairs = []; for (const [c] of base) for (const p of par.get(c) ?? []) if (p !== c && base.has(p)) pairs.push([c, p]);
const L = await labels([...new Set(pairs.flat())].map((x) => x.split("/").pop()));
const lab = (x) => (L[x.split("/").pop()] ?? "").toLowerCase();
const same = pairs.filter(([c, p]) => lab(c) && (lab(p) === lab(c) || lab(p).includes(lab(c))));
const dropParent = new Set(same.map(([, p]) => p)), keepChild = new Set(same.map(([c]) => c));
const dropChild = new Set(pairs.filter(([c]) => !keepChild.has(c)).map(([c]) => c));
const final = [...base].filter(([c]) => !dropParent.has(c) && !dropChild.has(c));
console.log(`base ${base.size}; pairs ${pairs.length}; same-name pairs ${same.length}; parents dropped ${dropParent.size}; children dropped ${dropChild.size}; left ${final.length}, of them >= 1 M: ${final.filter(([, o]) => o.pop >= 1e6).length}`);
console.log("same-name pairs (child kept / parent dropped), largest:", same.sort((a, b) => base.get(b[0]).pop - base.get(a[0]).pop).slice(0, 25).map(([c, p]) => `${L[c.split("/").pop()]} ${(base.get(c).pop / 1e6).toFixed(2)} < ${L[p.split("/").pop()]} ${(base.get(p).pop / 1e6).toFixed(2)}`).join(" | "));
const finalSet = new Set(final.map(([c]) => c));
for (const q of ["Q34647", "Q5465", "Q80810", "Q1461", "Q1490", "Q7473516", "Q956", "Q406", "Q8686", "Q60", "Q18419"]) {
  const c = [...base.keys()].find((x) => x.endsWith("/" + q) || x === q) ?? q, k = base.has(c) ? (finalSet.has(c) ? "KEPT" : dropParent.has(c) ? "dropped as parent" : "dropped as child") : "not in base";
  const ps = [...(par.get(c) ?? [])].filter((p) => base.has(p)), PL = await labels([q, ...ps.map((p) => p.split("/").pop())]);
  console.log(`${PL[q]} (${q}): ${k}${ps.length ? " | inside " + ps.map((p) => PL[p.split("/").pop()]).join(", ") : ""}`);
}
