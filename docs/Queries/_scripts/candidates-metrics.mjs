// Fame metrics for the approved geography candidates: which property could give the tiers, how many members carry it, and how the probes rank.
//
//   node candidates-metrics.mjs            (all)   |   node candidates-metrics.mjs Waterfalls
import { sparql, labels } from "./wd.mjs";

const f = { fresh: true };
const q = (s) => s.split("/").pop();
const members = async (root, min = 20) => {
  const cls = (await sparql(`SELECT DISTINCT ?t WHERE { ?t wdt:P279* wd:${root} }`, f)).map((r) => q(r.t));
  const it = new Map();
  for (let i = 0; i < cls.length; i += 60) for (const r of await sparql(`SELECT ?s ?n WHERE { VALUES ?t { ${cls.slice(i, i + 60).map((c) => "wd:" + c).join(" ")} } ?s wdt:P31 ?t ; wikibase:sitelinks ?n . FILTER(?n >= ${min}) }`, f)) it.set(q(r.s), +r.n);
  return it;
};
const values = async (ids, prop) => {
  const m = new Map();
  for (let i = 0; i < ids.length; i += 200) for (const r of await sparql(`SELECT ?s (MAX(?a) AS ?m) WHERE { VALUES ?s { ${ids.slice(i, i + 200).map((c) => "wd:" + c).join(" ")} } ?s p:${prop}/psn:${prop}/wikibase:quantityAmount ?a } GROUP BY ?s`, f)) m.set(q(r.s), +r.m);
  return m;
};
const propSearch = async (term) => {
  const j = await (await fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&type=property&limit=6&search=${encodeURIComponent(term)}`, { headers: { "User-Agent": "custom-wordlists-analysis/1.0" } })).json();
  return j.search.map((s) => `${s.id} ${s.label}`).join("; ") || "-";
};
const share = (m, it, min) => { const a = [...it].filter(([, n]) => n >= min); return `${a.filter(([s]) => m.has(s)).length} of ${a.length}`; };

const TOPICS = {
  async Volcanoes() {
    for (const t of ["volcanic explosivity", "eruption", "volcano number", "ejecta", "tephra"]) console.log(`property "${t}":`, await propSearch(t));
    const it = await members("Q8072"), ids = [...it.keys()];
    const gvp = new Map();
    for (let i = 0; i < ids.length; i += 200) for (const r of await sparql(`SELECT ?s ?g WHERE { VALUES ?s { ${ids.slice(i, i + 200).map((c) => "wd:" + c).join(" ")} } ?s wdt:P1886 ?g }`, f)) gvp.set(q(r.s), r.g);
    console.log(`GVP number (P1886): 20+ ${share(gvp, it, 20)}, 50+ ${share(gvp, it, 50)}`);
    const all = await sparql(`SELECT (COUNT(DISTINCT ?s) AS ?c) WHERE { ?s wdt:P1886 [] }`, f);
    console.log("items with P1886 in all:", all[0].c);
    const yel = await sparql(`SELECT ?s ?sl ?g ?tl ?n WHERE { ?s rdfs:label ?sl . FILTER(LANG(?sl)="en") VALUES ?sl { "Yellowstone Caldera"@en "Yellowstone hotspot"@en "Yellowstone Volcano"@en "Yellowstone supervolcano"@en "Toba"@en "Lake Toba"@en "Krakatoa"@en "Mount Tambora"@en "Tambora"@en } ?s wikibase:sitelinks ?n . OPTIONAL { ?s wdt:P1886 ?g } OPTIONAL { ?s wdt:P31 ?t . ?t rdfs:label ?tl FILTER(LANG(?tl)="en") } }`, f);
    console.log("probes:", yel.map((r) => `${q(r.s)} ${r.sl} [${r.tl ?? ""}] gvp ${r.g ?? "-"} n ${r.n}`).join("; "));
    const er = await sparql(`SELECT ?e ?v ?vl ?n WHERE { ?e wdt:P31/wdt:P279* wd:Q7692360 ; wikibase:sitelinks ?n . OPTIONAL { ?e wdt:P276|wdt:P706|wdt:P361 ?v . ?v rdfs:label ?vl FILTER(LANG(?vl)="en") } }`, f);
    console.log(`eruption items: ${new Set(er.map((r) => r.e)).size}, with a linked place: ${new Set(er.filter((r) => r.v).map((r) => r.e)).size}`);
    const sub = await sparql(`SELECT (COUNT(DISTINCT ?s) AS ?c) WHERE { ?s wdt:P31 wd:Q1197120 }`, f);
    const el = await values(ids, "P2044");
    console.log(`below sea level: ${[...el].filter(([, v]) => v < 0).length} of ${el.size} by elevation; *submarine volcano* in all ${sub[0].c}`);
  },
  async Ranges() {
    const it = await members("Q46831", 5), ids = [...it.keys()], set = new Set(ids), parent = new Map();
    for (let i = 0; i < ids.length; i += 200) for (const r of await sparql(`SELECT ?s ?p ?o WHERE { VALUES ?s { ${ids.slice(i, i + 200).map((c) => "wd:" + c).join(" ")} } VALUES ?p { wdt:P4552 wdt:P361 wdt:P706 } ?s ?p ?o }`, f)) {
      if (!set.has(q(r.o)) || q(r.o) === q(r.s)) continue;
      (parent.get(q(r.s)) ?? parent.set(q(r.s), []).get(q(r.s))).push([q(r.p), q(r.o)]);
    }
    const memo = new Map();
    const level = (s, seen = new Set()) => { if (memo.has(s)) return memo.get(s); if (seen.has(s)) return 0; seen.add(s); const ps = parent.get(s) ?? []; const l = ps.length ? 1 + Math.max(...ps.map(([, o]) => level(o, seen))) : 0; memo.set(s, l); return l; };
    const hist = {}; for (const s of ids) { const l = level(s); hist[l] = (hist[l] ?? 0) + 1; }
    const by = {}; for (const a of parent.values()) for (const [p] of a) by[p] = (by[p] ?? 0) + 1;
    const big = (min) => { const h = {}; for (const [s, n] of it) if (n >= min) { const l = level(s); h[l] = (h[l] ?? 0) + 1; } return JSON.stringify(h); };
    console.log(`members from 5 sitelinks ${ids.length}; links to another member by property:`, by, "levels (longest chain):", hist, "from 20:", big(20), "from 50:", big(50));
    const L = await labels(ids), top = (l) => ids.filter((s) => level(s) === l).sort((a, b) => it.get(b) - it.get(a)).slice(0, 18).map((s) => `${L[s]} ${it.get(s)}`).join(", ");
    for (const l of [0, 1, 2, 3]) console.log(`level ${l}:`, top(l));
    const nm = new Map(ids.map((s) => [L[s], s]));
    for (const p of ["Alps", "Himalayas", "Andes", "Karakoram", "Hindu Kush", "Bernese Alps", "Pennine Alps", "Tatra Mountains", "Sierra Nevada", "Black Forest", "Tibet", "Annapurna", "Carpathians", "Pamir Mountains", "Apennines", "Dolomites", "Appalachian Mountains"]) { const s = nm.get(p); console.log(` ${p}: ${s ? `level ${level(s)} via ${(parent.get(s) ?? []).map(([a, o]) => `${a} ${L[o]}`).join(", ") || "-"}` : "not in"}`); }
  },
  async Waterfalls() {
    const it = await members("Q34038", 5), ids = [...it.keys()];
    const h = await values(ids, "P2048"), w = await values(ids, "P2049"), fl = await values(ids, "P2225");
    for (const [n, m] of [["height", h], ["width", w], ["discharge", fl]]) console.log(`${n}: from 5 ${share(m, it, 5)}, 20 ${share(m, it, 20)}, 50 ${share(m, it, 50)}`);
    const L = await labels(ids), both = ids.filter((s) => h.has(s) && w.has(s));
    console.log(`height and width: from 5 ${both.length}, from 20 ${both.filter((s) => it.get(s) >= 20).length} of ${ids.filter((s) => it.get(s) >= 20).length}`);
    const prod = both.map((s) => [s, h.get(s) * w.get(s)]).sort((a, b) => b[1] - a[1]);
    console.log("height x width (m²):", prod.slice(0, 25).map(([s, v]) => `${L[s]} ${Math.round(v)}`).join(", "));
    console.log("famous, values:", ids.filter((s) => it.get(s) >= 35).sort((a, b) => it.get(b) - it.get(a)).map((s) => `${L[s]} ${it.get(s)} h${h.get(s) ?? "-"} w${w.get(s) ?? "-"} q${fl.get(s) ?? "-"}`).join("; "));
    console.log("20+ without width:", ids.filter((s) => it.get(s) >= 20 && !w.has(s)).length);
  },
  async Straits() {
    for (const t of ["vessel", "ships per", "traffic", "annual", "ship traffic"]) console.log(`property "${t}":`, await propSearch(t));
    const it = await members("Q37901"), ids = [...it.keys()];
    const w = await values(ids, "P2049"), l = await values(ids, "P2043"), d = await values(ids, "P4511");
    console.log(`width: 20 ${share(w, it, 20)}, 50 ${share(w, it, 50)}; length: ${share(l, it, 20)}; depth: ${share(d, it, 20)}`);
    const P = await sparql(`SELECT ?p (COUNT(DISTINCT ?s) AS ?c) WHERE { VALUES ?s { ${ids.map((c) => "wd:" + c).join(" ")} } ?s ?p ?v . ?pr wikibase:directClaim ?p ; wikibase:propertyType wikibase:Quantity } GROUP BY ?p ORDER BY DESC(?c) LIMIT 12`, f);
    const PL = await labels(P.map((r) => q(r.p)));
    console.log("quantity properties on straits:", P.map((r) => `${q(r.p)} ${PL[q(r.p)]} ${r.c}`).join(", "));
  },
  async Canals() {
    const it = await members("Q12284", 10), ids = [...it.keys()];
    const P = await sparql(`SELECT ?p (COUNT(DISTINCT ?s) AS ?c) WHERE { VALUES ?s { ${ids.map((c) => "wd:" + c).join(" ")} } ?s ?p ?v . ?pr wikibase:directClaim ?p ; wikibase:propertyType wikibase:Quantity } GROUP BY ?p ORDER BY DESC(?c) LIMIT 10`, f);
    const PL = await labels(P.map((r) => q(r.p)));
    console.log(`canals from 10: ${ids.length}; quantity properties:`, P.map((r) => `${q(r.p)} ${PL[q(r.p)]} ${r.c}`).join(", "));
  },
  async NationalParks() {
    const it = await members("Q46169"), ids = [...it.keys()];
    const a = await values(ids, "P2046"), vis = await values(ids, "P1174");
    const wdpa = new Set();
    for (let i = 0; i < ids.length; i += 200) for (const r of await sparql(`SELECT DISTINCT ?s WHERE { VALUES ?s { ${ids.slice(i, i + 200).map((c) => "wd:" + c).join(" ")} } ?s wdt:P809 [] }`, f)) wdpa.add(q(r.s));
    console.log(`area ${share(a, it, 20)}; visitors (P1174) ${share(vis, it, 20)}; WDPA ID (P809) ${[...it.keys()].filter((s) => wdpa.has(s)).length}`);
    for (const lim of [1000, 2000, 5000, 10000, 20000]) console.log(` area from ${lim} km²: ${[...a].filter(([, v]) => v >= lim * 1e6).length}`);
    const rows = await sparql(`SELECT ?s ?c ?area WHERE { VALUES ?s { ${[...a].filter(([, v]) => v >= 2e9).map(([s]) => "wd:" + s).join(" ")} } ?s wdt:P17 ?k . ?k wdt:P2046 ?area ; rdfs:label ?c . FILTER(LANG(?c)="en") }`, f);
    const over = rows.filter((r) => a.get(q(r.s)) > 0.1 * +r.area * 1e6);
    const L = await labels([...new Set(rows.map((r) => q(r.s)))]);
    console.log("over 10 % of its country:", over.map((r) => `${L[q(r.s)]} ${Math.round(a.get(q(r.s)) / 1e6)} in ${r.c} ${q(r.s)}`).join("; "));
    const bad = await values(ids, "P2046");
    console.log("top 60 by area:", [...bad].sort((x, y) => y[1] - x[1]).slice(0, 60).map(([s, v]) => `${s} ${Math.round(v / 1e6)}`).join(" "));
  },
  async WorldHeritage() {
    const r = await sparql(`SELECT ?s ?i ?n WHERE { ?s wdt:P757 ?i ; wikibase:sitelinks ?n }`, f);
    const it = new Map(); for (const x of r) if (/^\d+(bis|ter|quater|quinquies)?$/i.test(x.i)) it.set(q(x.s), +x.n);
    const ids = [...it.keys()];
    const a = await values(ids, "P2046"), vis = await values(ids, "P1174"), crit = new Map();
    for (let i = 0; i < ids.length; i += 200) for (const x of await sparql(`SELECT ?s (COUNT(DISTINCT ?c) AS ?k) WHERE { VALUES ?s { ${ids.slice(i, i + 200).map((c) => "wd:" + c).join(" ")} } ?s wdt:P2614 ?c } GROUP BY ?s`, f)) crit.set(q(x.s), +x.k);
    console.log(`site-level items ${ids.length}; area ${a.size}; visitors ${vis.size}; criteria (P2614) ${crit.size}`);
    const hist = {}; for (const v of crit.values()) hist[v] = (hist[v] ?? 0) + 1; console.log("number of criteria:", hist);
    const L = await labels(ids);
    console.log("most criteria:", [...crit].sort((x, y) => y[1] - x[1] || it.get(y[0]) - it.get(x[0])).slice(0, 25).map(([s, v]) => `${L[s]} ${v}`).join(", "));
    console.log("famous sites' criteria:", ids.filter((s) => it.get(s) >= 110).sort((x, y) => it.get(y) - it.get(x)).map((s) => `${L[s]} ${crit.get(s) ?? "-"}`).join(", "));
    console.log("most visitors:", [...vis].sort((x, y) => y[1] - x[1]).slice(0, 15).map(([s, v]) => `${L[s]} ${v}`).join(", "));
  },
  async Currencies() {
    const cur = await sparql(`SELECT ?s (MAX(?k) AS ?n) WHERE { ?s wdt:P498 ?c ; wikibase:sitelinks ?k } GROUP BY ?s`, f), ids = cur.map((x) => q(x.s)), n = new Map(cur.map((x) => [q(x.s), +x.n]));
    const rows = await sparql(`SELECT ?cu ?c ?end ?pop WHERE { VALUES ?cu { ${ids.map((c) => "wd:" + c).join(" ")} } ?c p:P38 ?st . ?st ps:P38 ?cu . OPTIONAL { ?st pq:P582 ?end } ?c p:P1082/psn:P1082/wikibase:quantityAmount ?pop . ?c wdt:P31/wdt:P279* wd:Q6256 }`, f);
    const u = new Map();
    for (const r of rows) { const o = u.get(q(r.cu)) ?? u.set(q(r.cu), new Map()).get(q(r.cu)); o.set(q(r.c), Math.max(o.get(q(r.c)) ?? 0, +r.pop)); }
    const sum = new Map([...u].map(([c, o]) => [c, [...o.values()].reduce((a, b) => a + b, 0)]));
    const L = await labels(ids), m = (v) => (v / 1e6).toFixed(1) + "M";
    console.log(`coded ${ids.length}, with a user population ${sum.size}; from 20 sitelinks ${ids.filter((s) => n.get(s) >= 20 && sum.has(s)).length} of ${ids.filter((s) => n.get(s) >= 20).length}`);
    console.log("top by users:", [...sum].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([c, v]) => `${L[c]} ${m(v)} (${u.get(c).size})`).join(", "));
    console.log("no users, top:", ids.filter((s) => !sum.has(s)).sort((a, b) => n.get(b) - n.get(a)).slice(0, 25).map((s) => `${L[s]} ${n.get(s)}`).join(", "));
    const eu = u.get("Q4916"); if (eu) { const CL = await labels([...eu.keys()]); console.log("euro users:", [...eu].map(([c, v]) => `${CL[c]} ${m(v)}`).join(", ")); }
    const old = ["Deutsche Mark", "peseta", "Italian lira", "French franc", "Soviet ruble"]; for (const p of old) { const s = ids.find((x) => L[x] === p); console.log(` ${p}: ${s && sum.has(s) ? m(sum.get(s)) : "no users"}`); }
  },
};
for (const name of process.argv[2] ? [process.argv[2]] : Object.keys(TOPICS)) {
  console.log(`\n== ${name}`);
  try { await TOPICS[name](); } catch (e) { console.log("ERROR", e.message.slice(0, 300)); }
}
