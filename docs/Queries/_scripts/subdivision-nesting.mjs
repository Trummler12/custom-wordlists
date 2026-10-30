// Subdivision base with nesting through the whole P131 chain (P131+): dropped when any ancestor, not a country, carries a current code.
import { sparql } from "./wd.mjs";
const raw = await sparql(`SELECT ?s ?code ?end ?gone ?pc ?a2 WHERE { ?s p:P300 ?cs . ?cs ps:P300 ?code . OPTIONAL { ?cs pq:P582 ?end } OPTIONAL { ?s wdt:P576 ?gone }
  OPTIONAL { ?s wdt:P131 ?p . ?p wdt:P300 ?pc FILTER NOT EXISTS { ?p wdt:P297 [] } } OPTIONAL { ?s wdt:P297 ?a2 } }`);
const it = new Map();
for (const r of raw) { const o = it.get(r.s) ?? it.set(r.s, { code: r.code, live: false, gone: false, one: false, a2: false }).get(r.s); if (!r.end) { o.live = true; o.code = r.code; } if (r.gone) o.gone = true; if (r.pc) o.one = true; if (r.a2) o.a2 = true; }
const coded = new Set([...it].filter(([, o]) => o.live && !o.gone && !o.a2).map(([s]) => s));
const cand = [...coded].map((s) => s.split("/").pop()), deep = new Set();
for (let i = 0; i < cand.length; i += 40) for (const r of await sparql(`SELECT DISTINCT ?s ?a WHERE { VALUES ?s { ${cand.slice(i, i + 40).map((q) => "wd:" + q).join(" ")} } ?s wdt:P131+ ?a . FILTER NOT EXISTS { ?a wdt:P297 [] } ?a wdt:P300 [] . }`)) if (coded.has(r.a) && r.a !== r.s) deep.add(r.s);
const one = [...coded].filter((s) => !it.get(s).one), all = [...coded].filter((s) => !deep.has(s));
const per = (arr) => { const m = {}; for (const s of arr) { const c = it.get(s).code.split("-")[0]; m[c] = (m[c] ?? 0) + 1; } return m; };
const A = per(one), B = per(all);
console.log(`one step: ${one.length}; whole chain: ${all.length}`);
console.log("countries that change:", Object.keys({ ...A, ...B }).filter((c) => A[c] !== B[c]).map((c) => `${c} ${A[c] ?? 0}=>${B[c] ?? 0}`).join(", "));
const gb = all.filter((s) => it.get(s).code.startsWith("GB-")).map((s) => it.get(s).code);
console.log("GB left:", gb.join(", "));
