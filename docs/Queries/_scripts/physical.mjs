// What Wikidata offers for the physical geography topics: per topic the classes under its root, members with 5+ sitelinks,
// coverage of the size property that would give the tiers, the largest, the classes in use, and probes a reader expects.
//
//   node physical.mjs            (all)   |   node physical.mjs Islands
import { writeFileSync } from "node:fs";
import { sparql, labels } from "./wd.mjs";

const gaps = {};

const TOPICS = {
  Islands: { roots: ["Q23442"], prop: "P2046", unit: "area", probes: ["Greenland", "New Guinea", "Borneo", "Madagascar", "Great Britain", "Honshu", "Iceland", "Sicily", "Cuba", "Tasmania", "Bali", "Manhattan", "Australia", "Hawaii"] },
  Mountains: { roots: ["Q8502"], prop: "P2044", unit: "elevation", probes: ["Mount Everest", "K2", "Kangchenjunga", "Denali", "Mount Kilimanjaro", "Mont Blanc", "Matterhorn", "Mount Fuji", "Aconcagua", "Mount Elbrus", "Olympus Mons", "Zugspitze", "Mount Vesuvius", "Table Mountain"] },
  Ranges: { roots: ["Q46831"], prop: "P2044", unit: "elevation", probes: ["Himalayas", "Alps", "Andes", "Rocky Mountains", "Pyrenees", "Ural Mountains", "Atlas Mountains", "Carpathian Mountains"] },
  Deserts: { roots: ["Q8514"], prop: "P2046", unit: "area", probes: ["Sahara", "Gobi Desert", "Arabian Desert", "Kalahari Desert", "Atacama Desert", "Namib", "Mojave Desert", "Antarctic Desert", "Thar Desert", "Sonoran Desert"] },
  Rivers: { roots: ["Q4022"], prop: "P2043", unit: "length", probes: ["Nile", "Amazon River", "Yangtze", "Mississippi River", "Danube", "Rhine", "Volga", "Ganges", "Congo River", "Thames", "Seine"] },
  Lakes: { roots: ["Q23397"], prop: "P2046", unit: "area", probes: ["Lake Superior", "Lake Victoria", "Lake Baikal", "Lake Titicaca", "Lake Geneva", "Lake Constance", "Loch Ness", "Great Salt Lake", "Dead Sea", "Caspian Sea", "Aral Sea", "Lake Tanganyika"] },
};
const want = process.argv[2] ? [process.argv[2]] : Object.keys(TOPICS);
for (const name of want) {
  const T = TOPICS[name];
  const cls = (await sparql(`SELECT DISTINCT ?t WHERE { VALUES ?r { ${T.roots.map((q) => "wd:" + q).join(" ")} } ?t wdt:P279* ?r }`)).map((r) => r.t.split("/").pop());
  const rows = [];
  for (let i = 0; i < cls.length; i += 60) rows.push(...(await sparql(`SELECT ?s ?t ?n WHERE { VALUES ?t { ${cls.slice(i, i + 60).map((q) => "wd:" + q).join(" ")} } ?s wdt:P31 ?t ; wikibase:sitelinks ?n . FILTER(?n >= 20) }`)));
  const it = new Map();
  for (const r of rows) { const o = it.get(r.s) ?? it.set(r.s, { n: +r.n, cls: new Set() }).get(r.s); o.cls.add(r.t.split("/").pop()); }
  const ids = [...it.keys()].map((s) => s.split("/").pop()), size = new Map(), gone = new Set(), human = new Set();
  for (let i = 0; i < ids.length; i += 200) {
    const v = ids.slice(i, i + 200).map((q) => "wd:" + q).join(" ");
    for (const r of await sparql(`SELECT ?s (MAX(?a) AS ?m) WHERE { VALUES ?s { ${v} } ?s p:${T.prop}/psn:${T.prop}/wikibase:quantityAmount ?a } GROUP BY ?s`)) size.set(r.s, +r.m);
    for (const r of await sparql(`SELECT ?s WHERE { VALUES ?s { ${v} } ?s wdt:P576 [] }`)) gone.add(r.s);
  }
  const all = [...it].filter(([s]) => !gone.has(s)).sort((a, b) => b[1].n - a[1].n);
  const cover = (min) => { const a = all.filter(([, o]) => o.n >= min); return `${a.filter(([s]) => size.has(s)).length} of ${a.length}`; };
  console.log(`\n== ${name}: ${cls.length} classes; with ${T.prop} (${T.unit}): 20+ sitelinks ${cover(20)}, 50+ ${cover(50)}, 100+ ${cover(100)}`);
  const cc = {}; for (const [, o] of all) for (const c of o.cls) cc[c] = (cc[c] ?? 0) + 1;
  const top = Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 14), CL = await labels(top.map(([c]) => c));
  console.log("classes:", top.map(([c, n]) => `${CL[c]} ${n}`).join(", "));
  const L = await labels(all.map(([s]) => s.split("/").pop()));
  console.log("top by sitelinks:", all.slice(0, 20).map(([s, o]) => `${L[s.split("/").pop()]} ${o.n}`).join(", "));
  const big = all.filter(([s]) => size.has(s)).sort((a, b) => size.get(b[0]) - size.get(a[0])).slice(0, 15);
  console.log("top by size:", big.map(([s]) => `${L[s.split("/").pop()]} ${size.get(s)}`).join(", "));
  const byL = new Map(all.map(([s]) => [L[s.split("/").pop()], s]));
  console.log("probes:", T.probes.map((p) => `${p} ${byL.has(p) ? (size.has(byL.get(p)) ? "ok" : "NO SIZE") : "NOT IN"}`).join(", "));
  gaps[name] = all.filter(([s]) => !size.has(s)).map(([s, o]) => ({ q: s.split("/").pop(), l: L[s.split("/").pop()], n: o.n, cls: [...o.cls] }));
  console.log("top without size:", all.filter(([s]) => !size.has(s)).slice(0, 25).map(([s, o]) => `${L[s.split("/").pop()]} ${o.n}`).join(", "));
}
if (process.env.GAPS) writeFileSync(process.env.GAPS, JSON.stringify(gaps, null, 1));
