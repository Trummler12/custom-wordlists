// The Science candidates and the free Sports ones: members by class, by taxon or by a custom pattern, coverage of possible measures, classes in use and probes.
//
//   node candidates-science.mjs            (all)   |   node candidates-science.mjs Moons
import { sparql, labels } from "./wd.mjs";

const q = (s) => s.split("/").pop(), f = { fresh: true };
const TOPICS = {
  Planets: { pattern: "{ ?s wdt:P31 wd:Q2199 } UNION { ?s wdt:P397 wd:Q525 ; wdt:P31/wdt:P279* wd:Q634 }", min: 5, props: { P2120: "radius", P2067: "mass", P2583: "distance" }, probes: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Ceres", "Eris", "Haumea", "Makemake", "Sedna"] },
  Moons: { roots: ["Q2537"], min: 5, props: { P397: "parent", P2120: "radius", P2067: "mass" }, probes: ["Moon", "Io", "Europa", "Ganymede", "Callisto", "Titan", "Enceladus", "Triton", "Phobos", "Deimos", "Charon", "Mimas", "Oberon"] },
  Constellations: { roots: ["Q8928"], min: 5, props: { P2046: "area" }, probes: ["Orion", "Ursa Major", "Cassiopeia", "Scorpius", "Leo", "Taurus", "Crux", "Argo Navis", "Serpens"] },
  Stars: { roots: ["Q523"], min: 20, props: { P1215: "apparent magnitude", P2583: "distance", P59: "constellation" }, probes: ["Sun", "Sirius", "Betelgeuse", "Polaris", "Alpha Centauri", "Proxima Centauri", "Vega", "Rigel", "Canopus", "Aldebaran", "Antares", "Arcturus"] },
  Dinosaurs: { taxon: "Q430", rank: "Q34740", not: "Q5113", min: 5, props: { P2043: "length", P2067: "mass", P225: "taxon name" }, probes: ["Tyrannosaurus", "Triceratops", "Velociraptor", "Stegosaurus", "Diplodocus", "Brachiosaurus", "Spinosaurus", "Allosaurus", "Ankylosaurus", "Iguanodon", "Archaeopteryx"] },
  Mammals: { taxon: "Q7377", rank: "Q7432", min: 50, props: { P141: "IUCN status", P1843: "common name" }, probes: ["lion", "tiger", "African bush elephant", "domestic dog", "cat", "giraffe", "blue whale", "polar bear", "giant panda", "horse", "human"] },
  Birds: { taxon: "Q5113", rank: "Q7432", min: 50, props: { P141: "IUCN status", P1843: "common name" }, probes: ["chicken", "common ostrich", "emperor penguin", "bald eagle", "barn owl", "common raven", "rock dove", "mallard", "dodo"] },
  Reptiles: { taxon: "Q10811", rank: "Q7432", not: "Q5113", min: 50, props: { P141: "IUCN status" }, probes: ["Komodo dragon", "king cobra", "green sea turtle", "Nile crocodile", "green iguana", "black mamba"] },
  Bones: { pattern: "?s wdt:P279+ wd:Q25513701 .", min: 5, props: { P1402: "FMA", P361: "part of" }, probes: ["femur", "humerus", "skull", "tibia", "fibula", "radius", "ulna", "clavicle", "scapula", "sternum", "patella", "mandible", "pelvis", "stapes", "hyoid bone"] },
  Organs: { pattern: "?s wdt:P31 wd:Q103812529 .", min: 5, props: { P1402: "FMA", P361: "part of" }, probes: ["heart", "lung", "liver", "kidney", "brain", "stomach", "pancreas", "spleen", "skin", "gallbladder", "urinary bladder", "appendix", "thyroid"] },
  "SI Units": { roots: ["Q223662", "Q208469"], min: 0, props: { P5061: "symbol", P2370: "conversion" }, probes: ["metre", "kilogram", "second", "ampere", "kelvin", "mole", "candela", "newton", "joule", "watt", "pascal", "hertz", "volt", "ohm", "lumen", "becquerel", "katal"] },
  Minerals: { roots: ["Q7946", "Q12089225"], min: 20, props: { P556: "crystal system", P274: "formula", P5364: "IMA symbol" }, probes: ["quartz", "diamond", "calcite", "feldspar", "pyrite", "gypsum", "talc", "corundum", "fluorite", "halite", "olivine", "topaz", "hematite", "magnetite"] },
  "Non-Olympic Sports": { roots: ["Q31629"], min: 20, props: { P279: "subclass of" }, probes: ["chess", "cricket", "darts", "squash", "bowling", "sumo", "Formula One", "American football", "snooker", "pétanque", "e-sports"] },
  "Olympic Host Cities": { pattern: "VALUES ?gc { wd:Q135976384 wd:Q137592217 } ?g wdt:P31 ?gc ; wdt:P276 ?s .", min: 0, props: { P1082: "population" }, probes: ["Paris", "London", "Los Angeles", "Tokyo", "Athens", "Beijing", "Sapporo", "Innsbruck", "Chamonix", "Rio de Janeiro"] },
};

const CHUNK = 60;
const membersBy = async (T) => {
  const rows = [], filter = T.min ? `FILTER(?n >= ${T.min})` : "";
  if (T.taxon) rows.push(...(await sparql(`SELECT DISTINCT ?s ?n WHERE { ?s wdt:P171+ wd:${T.taxon} ; wdt:P105 wd:${T.rank} ; wikibase:sitelinks ?n . ${filter} }`, f)));
  else if (T.pattern) { for (const p of [T.pattern]) rows.push(...(await sparql(`SELECT DISTINCT ?s ?n ?t WHERE { ${p} ?s wikibase:sitelinks ?n . ${filter} OPTIONAL { ?s wdt:P31 ?t } }`, f))); }
  else {
    const cls = (await sparql(`SELECT DISTINCT ?t WHERE { VALUES ?r { ${T.roots.map((x) => "wd:" + x).join(" ")} } ?t wdt:P279* ?r }`, f)).map((r) => q(r.t));
    T.classes = cls.length;
    for (let i = 0; i < cls.length; i += CHUNK) rows.push(...(await sparql(`SELECT ?s ?t ?n WHERE { VALUES ?t { ${cls.slice(i, i + CHUNK).map((x) => "wd:" + x).join(" ")} } ?s wdt:P31 ?t ; wikibase:sitelinks ?n . ${filter} }`, f)));
  }
  return rows;
};
for (const name of process.argv[2] ? [process.argv[2]] : Object.keys(TOPICS)) {
  const T = TOPICS[name];
  try {
    let rows = await membersBy(T); const it = new Map();
    // Birds are dinosaurs and reptiles by descent: taken out here, as a NOT EXISTS times out.
    if (T.not) { const out = new Set((await sparql(`SELECT DISTINCT ?s WHERE { ?s wdt:P171+ wd:${T.not} ; wdt:P105 wd:${T.rank} ; wikibase:sitelinks ?n . ${T.min ? `FILTER(?n >= ${T.min})` : ""} }`, f)).map((r) => r.s)); rows = rows.filter((r) => !out.has(r.s)); }
    for (const r of rows) { const o = it.get(r.s) ?? it.set(r.s, { n: +r.n, cls: new Set() }).get(r.s); if (r.t) o.cls.add(q(r.t)); }
    const all = [...it].sort((a, b) => b[1].n - a[1].n), ids = all.map(([s]) => q(s)), have = {};
    for (const p of Object.keys(T.props)) { have[p] = new Set(); for (let i = 0; i < ids.length; i += 200) for (const r of await sparql(`SELECT DISTINCT ?s WHERE { VALUES ?s { ${ids.slice(i, i + 200).map((x) => "wd:" + x).join(" ")} } ?s wdt:${p} [] }`, f)) have[p].add(q(r.s)); }
    const cnt = (m) => all.filter(([, o]) => o.n >= m).length;
    console.log(`\n== ${name}: members ${all.length} (floor ${T.min}); from 20: ${cnt(20)}, 50: ${cnt(50)}, 100: ${cnt(100)}${T.classes ? `; ${T.classes} classes` : ""}`);
    console.log("measures:", Object.entries(T.props).map(([p, l]) => `${l} (${p}) ${have[p].size}`).join(", "));
    const cc = {}; for (const [, o] of all) for (const c of o.cls) cc[c] = (cc[c] ?? 0) + 1;
    const top = Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 12), CL = await labels(top.map(([c]) => c));
    if (top.length) console.log("classes:", top.map(([c, n]) => `${CL[c] ?? c} ${n}`).join(", "));
    const L = await labels(ids), lab = (s) => L[q(s)] ?? q(s);
    console.log("top:", all.slice(0, 24).map(([s, o]) => `${lab(s)} ${o.n}`).join(", "));
    const set = new Set(all.map(([s]) => lab(s).toLowerCase()));
    console.log("probes missing:", T.probes.filter((p) => !set.has(p.toLowerCase())).join(", ") || "none");
  } catch (e) { console.log(`\n== ${name}: FAILED ${e.message.slice(0, 120)}`); }
}
