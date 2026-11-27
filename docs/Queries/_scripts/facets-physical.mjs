// Inclusion groups for the physical topics (Trummler, 2026-11-24: groups a user can combine freely): how far *continent* (P30)
// and, for water, *country* (P17) carry each topic's members from 20 sitelinks, and how many members sit in several continents
import { sparql } from "./wd.mjs";
const TOPICS = { Islands: "Q23442", Mountains: "Q8502", Ranges: "Q46831", Deserts: "Q8514", Rivers: "Q4022", Lakes: "Q23397", Volcanoes: "Q8072", Waterfalls: "Q34038" };
for (const [name, root] of Object.entries(TOPICS)) {
  const cls = (await sparql(`SELECT DISTINCT ?t WHERE { ?t wdt:P279* wd:${root} }`)).map(r => r.t.split("/").pop());
  const it = new Map();
  for (let i = 0; i < cls.length; i += 60) for (const r of await sparql(`SELECT ?s (GROUP_CONCAT(DISTINCT ?c; separator=",") AS ?cs) (COUNT(DISTINCT ?k) AS ?nk) WHERE { VALUES ?t { ${cls.slice(i, i + 60).map(q => "wd:" + q).join(" ")} } ?s wdt:P31 ?t ; wikibase:sitelinks ?n . FILTER(?n >= 20) OPTIONAL { ?s wdt:P30 ?c } OPTIONAL { ?s wdt:P17 ?k } } GROUP BY ?s`))
    it.set(r.s, { cs: r.cs ? r.cs.split(",").filter(Boolean).map(u => u.split("/").pop()) : [], nk: +r.nk });
  const v = [...it.values()], withC = v.filter(x => x.cs.length), multi = v.filter(x => x.cs.length > 1), byC = {};
  for (const x of withC) for (const c of x.cs) byC[c] = (byC[c] || 0) + 1;
  console.log(`${name}: ${v.length} | P30 ${withC.length} (${Math.round(100 * withC.length / v.length)} %), in several ${multi.length} | P17 ${v.filter(x => x.nk).length} | by continent ${Object.entries(byC).sort((a, b) => b[1] - a[1]).slice(0, 9).map(([c, n]) => c + " " + n).join(", ")}`);
}
