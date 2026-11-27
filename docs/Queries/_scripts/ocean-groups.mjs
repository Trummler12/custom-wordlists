// Per-ocean groups for Islands and Oceans & Seas (Trummler, 2026-11-24: Pacific, Indian, Atlantic with the Mediterranean and the
// Arctic): each island's P206 water, or the sea itself, walked up by part of (P361) / located in or next to body of water (P206)
// to an ocean, rivers and lakes by their mouth (P403) and outflow (P201), the ocean they drain into (Trummler, 2026-11-24); how many resolve, to how many oceans, and what stays unresolved
import { sparql } from "./wd.mjs";
const OCEAN = { Q98: "Pacific", Q97: "Atlantic", Q1239: "Indian", Q788: "Arctic => Atlantic", Q7354: "Southern" };
const VALS = Object.keys(OCEAN).map(q => "wd:" + q).join(" ");
const islandCls = (await sparql(`SELECT DISTINCT ?t WHERE { ?t wdt:P279* wd:Q23442 }`)).map(r => r.t.split("/").pop());
const seaCls = (await sparql(`SELECT DISTINCT ?t WHERE { VALUES ?r { wd:Q9430 wd:Q165 } ?t wdt:P279* ?r }`)).map(r => r.t.split("/").pop());
const waters = new Map();   // subject => set of water items to resolve
for (const [kind, cls, how] of [["island", islandCls, "?s wdt:P206 ?w ."], ["sea", seaCls, "BIND(?s AS ?w)"]])
  for (let i = 0; i < cls.length; i += 60) for (const r of await sparql(`SELECT ?s ?w WHERE { VALUES ?t { ${cls.slice(i, i + 60).map(q => "wd:" + q).join(" ")} } ?s wdt:P31 ?t ; wikibase:sitelinks ?n . FILTER(?n >= 20) ${how} }`)) {
    const k = kind + "|" + r.s; (waters.get(k) ?? waters.set(k, new Set()).get(k)).add(r.w.split("/").pop()); }
const W = [...new Set([...waters.values()].flatMap(s => [...s]))], up = {};
for (let i = 0; i < W.length; i += 100) for (const r of await sparql(`SELECT ?w ?o WHERE { VALUES ?w { ${W.slice(i, i + 100).map(q => "wd:" + q).join(" ")} } VALUES ?o { ${VALS} } ?w (wdt:P361|wdt:P206|wdt:P403|wdt:P201)* ?o }`))
  (up[r.w.split("/").pop()] ||= new Set()).add(OCEAN[r.o.split("/").pop()]);
for (const kind of ["island", "sea"]) {
  const subj = [...waters.entries()].filter(([k]) => k.startsWith(kind)), res = subj.map(([, s]) => new Set([...s].flatMap(w => [...(up[w] || [])])));
  const by = {}; res.forEach(s => { const k = [...s].sort().join(" + ") || "(none)"; by[k] = (by[k] || 0) + 1; });
  console.log(`${kind}s ${subj.length}: ` + Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, n]) => `${k} ${n}`).join(" | "));
  const miss = {}; subj.forEach(([, s], i) => { if (!res[i].size) for (const w of s) miss[w] = (miss[w] || 0) + 1; });
  console.log("  unresolved waters:", Object.entries(miss).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([w, n]) => w + " " + n).join(", "));
}
