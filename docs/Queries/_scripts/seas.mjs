// What Wikidata offers for oceans and seas: members of ocean (Q9430) and sea (Q165) and their subclasses, with sitelinks,
// how the classes split (marginal sea, inland sea, bay, gulf, strait …), and probes a reader expects.
//
//   node seas.mjs
import { sparql, labels } from "./wd.mjs";

// The subclass closure joined with the members times out, so classes first, then members in blocks of classes.
const cls = (await sparql(`SELECT DISTINCT ?t WHERE { VALUES ?r { wd:Q9430 wd:Q165 } ?t wdt:P279* ?r }`)).map((r) => r.t.split("/").pop());
console.log(`classes under ocean or sea: ${cls.length}`);
const rows = [];
for (let i = 0; i < cls.length; i += 40) rows.push(...(await sparql(`SELECT ?s ?t ?n WHERE { VALUES ?t { ${cls.slice(i, i + 40).map((q) => "wd:" + q).join(" ")} } ?s wdt:P31 ?t ; wikibase:sitelinks ?n . FILTER(?n >= 5) FILTER NOT EXISTS { ?s wdt:P576 [] } }`)));
const it = new Map();
for (const r of rows) { const o = it.get(r.s) ?? it.set(r.s, { n: +r.n, cls: new Set() }).get(r.s); o.cls.add(r.t); }
const all = [...it].sort((a, b) => b[1].n - a[1].n);
console.log(`items under ocean or sea with >= 5 sitelinks: ${all.length}; >= 20 sitelinks ${all.filter(([, o]) => o.n >= 20).length}; >= 50 ${all.filter(([, o]) => o.n >= 50).length}; >= 100 ${all.filter(([, o]) => o.n >= 100).length}`);
const cc = {}; for (const [, o] of all.filter(([, o]) => o.n >= 20)) for (const c of o.cls) cc[c] = (cc[c] ?? 0) + 1;
const top = Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 20), CL = await labels(top.map(([c]) => c.split("/").pop()));
console.log("classes among those with >= 20 sitelinks:", top.map(([c, n]) => `${CL[c.split("/").pop()]} ${n}`).join(", "));
const L = await labels(all.slice(0, 60).map(([s]) => s.split("/").pop()));
console.log("top 60:", all.slice(0, 60).map(([s, o]) => `${L[s.split("/").pop()]} ${o.n}`).join(", "));
// Probes by English label (a reader's list), and the members of the classes that may want a rule of their own.
const LL = await labels(all.map(([x]) => x.split("/").pop()));
const byL = new Map(all.map(([x, o], k) => [LL[x.split("/").pop()], { k: k + 1, o }]));
const probe = ["Atlantic Ocean", "Pacific Ocean", "Indian Ocean", "Arctic Ocean", "Southern Ocean", "Mediterranean Sea", "Black Sea", "Caspian Sea", "Baltic Sea", "North Sea", "Dead Sea", "Red Sea", "Caribbean Sea", "Gulf of Mexico", "Bay of Bengal", "Sea of Japan", "Aral Sea", "Sea of Galilee", "Salton Sea", "Gulf of Bothnia", "Bay of Biscay", "Strait of Gibraltar"];
console.log("probes (rank by sitelinks):", probe.map((l) => `${l} ${byL.get(l)?.k ?? "NOT IN"}`).join(", "));
const CLL = await labels(cls);
for (const want of ["historic ocean", "historic superocean", "inland sea", "internal sea", "epicontinental sea"]) {
  const q = cls.find((c) => CLL[c] === want);
  if (q) console.log(`${want}: ${all.filter(([, o]) => o.cls.has("http://www.wikidata.org/entity/" + q) || o.cls.has(q)).map(([x, o]) => LL[x.split("/").pop()] + " " + o.n).join(", ")}`);
}

// Gulfs (Q1322134), bays (Q39594) and straits (Q37901) outside the sea tree: how many, and the largest, as candidate rules.
for (const [name, q] of [["gulf", "Q1322134"], ["bay", "Q39594"], ["strait", "Q37901"]]) {
  const r = await sparql(`SELECT ?s ?n WHERE { ?s wdt:P31 wd:${q} ; wikibase:sitelinks ?n . FILTER(?n >= 30) }`);
  const t = r.sort((a, b) => b.n - a.n), GL = await labels(t.slice(0, 15).map((x) => x.s.split("/").pop()));
  console.log(`${name} (direct P31) with >= 30 sitelinks: ${t.length}; top: ${t.slice(0, 15).map((x) => GL[x.s.split("/").pop()] + " " + x.n).join(", ")}`);
}
