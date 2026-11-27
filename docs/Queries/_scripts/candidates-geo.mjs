// The geography candidates: per topic the classes under its root, members with 20+ sitelinks, coverage of the size property that would
// give the tiers, the largest, the classes in use, and probes a reader expects.
//
//   node candidates-geo.mjs            (all)   |   node candidates-geo.mjs Volcanoes
import { sparql, labels } from "./wd.mjs";

const TOPICS = {
  Volcanoes: { roots: ["Q8072"], prop: "P2044", unit: "elevation", probes: ["Mount Vesuvius", "Mount Fuji", "Krakatoa", "Mount Etna", "Mauna Loa", "Kilimanjaro", "Mount Kilimanjaro", "Eyjafjallajökull", "Mount St. Helens", "Popocatépetl", "Yellowstone Caldera", "Mount Pinatubo", "Stromboli", "Tambora", "Mount Tambora"] },
  Ranges: { roots: ["Q46831"], prop: "P2044", unit: "elevation", probes: ["Himalayas", "Alps", "Andes", "Rocky Mountains", "Pyrenees", "Ural Mountains", "Atlas Mountains", "Carpathian Mountains", "Caucasus Mountains", "Appalachian Mountains", "Karakoram", "Hindu Kush"] },
  Waterfalls: { roots: ["Q34038"], prop: "P2048", unit: "height", probes: ["Niagara Falls", "Victoria Falls", "Iguazu Falls", "Angel Falls", "Rhine Falls", "Yosemite Falls", "Gullfoss", "Horseshoe Falls", "Tugela Falls"] },
  Peninsulas: { roots: ["Q34763"], prop: "P2046", unit: "area", probes: ["Arabian Peninsula", "Iberian Peninsula", "Balkans", "Italian Peninsula", "Korean Peninsula", "Crimea", "Scandinavian Peninsula", "Kamchatka Peninsula", "Yucatán Peninsula", "Florida", "Indian subcontinent", "Peloponnese", "Sinai Peninsula", "Anatolia"] },
  Straits: { roots: ["Q37901"], prop: "P2043", unit: "length", probes: ["Strait of Gibraltar", "Bosporus", "Dardanelles", "English Channel", "Bering Strait", "Strait of Hormuz", "Strait of Malacca", "Øresund", "Strait of Magellan"] },
  Canals: { roots: ["Q12284"], prop: "P2043", unit: "length", probes: ["Suez Canal", "Panama Canal", "Kiel Canal", "Grand Canal", "Corinth Canal", "Erie Canal", "Rhine–Main–Danube Canal", "Canal du Midi"] },
  NationalParks: { roots: ["Q46169"], prop: "P2046", unit: "area", probes: ["Yellowstone National Park", "Grand Canyon National Park", "Serengeti National Park", "Kruger National Park", "Yosemite National Park", "Banff National Park", "Plitvice Lakes National Park", "Galápagos National Park", "Bavarian Forest National Park", "Swiss National Park"] },
  WorldHeritage: { roots: ["Q9259"], prop: null, unit: "", probes: ["Great Wall of China", "Taj Mahal", "Acropolis of Athens", "Machu Picchu", "Great Barrier Reef", "Venice and its Lagoon", "Petra", "Angkor", "Statue of Liberty", "Historic Centre of Rome"] },
  Currencies: { roots: ["Q8142"], prop: null, unit: "", probes: ["euro", "United States dollar", "pound sterling", "Japanese yen", "Swiss franc", "renminbi", "Indian rupee", "Russian ruble", "Deutsche Mark", "Bitcoin", "bitcoin", "Roman denarius", "denarius", "Italian lira"] },
};
const f = { fresh: true };
for (const name of process.argv[2] ? [process.argv[2]] : Object.keys(TOPICS)) {
  const T = TOPICS[name];
  const cls = (await sparql(`SELECT DISTINCT ?t WHERE { VALUES ?r { ${T.roots.map((q) => "wd:" + q).join(" ")} } ?t wdt:P279* ?r }`, f)).map((r) => r.t.split("/").pop());
  const rows = [];
  for (let i = 0; i < cls.length; i += 60) rows.push(...(await sparql(`SELECT ?s ?t ?n WHERE { VALUES ?t { ${cls.slice(i, i + 60).map((q) => "wd:" + q).join(" ")} } ?s wdt:P31 ?t ; wikibase:sitelinks ?n . FILTER(?n >= 20) }`, f)));
  const it = new Map();
  for (const r of rows) { const o = it.get(r.s) ?? it.set(r.s, { n: +r.n, cls: new Set() }).get(r.s); o.cls.add(r.t.split("/").pop()); }
  const ids = [...it.keys()].map((s) => s.split("/").pop()), size = new Map(), gone = new Set();
  for (let i = 0; i < ids.length; i += 200) {
    const v = ids.slice(i, i + 200).map((q) => "wd:" + q).join(" ");
    if (T.prop) for (const r of await sparql(`SELECT ?s (MAX(?a) AS ?m) WHERE { VALUES ?s { ${v} } ?s p:${T.prop}/psn:${T.prop}/wikibase:quantityAmount ?a } GROUP BY ?s`, f)) size.set(r.s, +r.m);
    for (const r of await sparql(`SELECT ?s WHERE { VALUES ?s { ${v} } ?s wdt:P576 [] }`, f)) gone.add(r.s);
  }
  const all = [...it].sort((a, b) => b[1].n - a[1].n);
  const cover = (min) => { const a = all.filter(([, o]) => o.n >= min); return `${a.filter(([s]) => size.has(s)).length} of ${a.length}`; };
  console.log(`\n== ${name}: ${cls.length} classes; ${all.length} with 20+ sitelinks, ${gone.size} ended (P576)${T.prop ? `; with ${T.prop} (${T.unit}): 20+ ${cover(20)}, 50+ ${cover(50)}, 100+ ${cover(100)}` : ""}`);
  const cc = {}; for (const [, o] of all) for (const c of o.cls) cc[c] = (cc[c] ?? 0) + 1;
  const top = Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 12), CL = await labels(top.map(([c]) => c));
  console.log("classes:", top.map(([c, n]) => `${CL[c]} ${n}`).join(", "));
  const L = await labels(all.map(([s]) => s.split("/").pop()));
  const lab = (s) => L[s.split("/").pop()];
  console.log("top by sitelinks:", all.slice(0, 22).map(([s, o]) => `${lab(s)} ${o.n}`).join(", "));
  if (T.prop) console.log("top by size:", all.filter(([s]) => size.has(s)).sort((a, b) => size.get(b[0]) - size.get(a[0])).slice(0, 12).map(([s]) => `${lab(s)} ${size.get(s)}`).join(", "));
  const byL = new Map(all.map(([s]) => [lab(s), s]));
  console.log("probes:", T.probes.map((p) => `${p} ${byL.has(p) ? (!T.prop || size.has(byL.get(p)) ? "ok" : "NO SIZE") : "NOT IN"}`).join(", "));
  if (T.prop) console.log("top without size:", all.filter(([s]) => !size.has(s)).slice(0, 20).map(([s, o]) => `${lab(s)} ${o.n}`).join(", "));
}
