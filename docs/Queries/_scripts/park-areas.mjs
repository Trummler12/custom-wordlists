// Compares each national park's largest area on Wikidata (P2046) with the Reported Area on its Protected Planet page, via the WDPA ID (P809).
//
//   node park-areas.mjs [min sitelinks, default 20]      (writes OUT, env, as JSON if set)
import { writeFileSync } from "node:fs";
import { sparql, labels } from "./wd.mjs";

const MIN = +(process.argv[2] ?? 20), f = { fresh: true }, q = (s) => s.split("/").pop();
const cls = (await sparql(`SELECT DISTINCT ?t WHERE { ?t wdt:P279* wd:Q46169 }`, f)).map((r) => q(r.t));
const it = new Map();
for (let i = 0; i < cls.length; i += 60) for (const r of await sparql(`SELECT ?s ?n WHERE { VALUES ?t { ${cls.slice(i, i + 60).map((c) => "wd:" + c).join(" ")} } ?s wdt:P31 ?t ; wikibase:sitelinks ?n . FILTER(?n >= ${MIN}) }`, f)) it.set(q(r.s), { q: q(r.s), n: +r.n, areas: [], wdpa: [] });
const ids = [...it.keys()];
for (let i = 0; i < ids.length; i += 200) {
  const v = ids.slice(i, i + 200).map((c) => "wd:" + c).join(" ");
  for (const r of await sparql(`SELECT ?s ?a ?st ?raw ?u WHERE { VALUES ?s { ${v} } ?s p:P2046 ?st . ?st psn:P2046/wikibase:quantityAmount ?a ; psv:P2046 ?val . ?val wikibase:quantityAmount ?raw ; wikibase:quantityUnit ?u }`, f)) it.get(q(r.s)).areas.push({ km2: +r.a / 1e6, raw: +r.raw, unit: q(r.u) });
  for (const r of await sparql(`SELECT ?s ?w WHERE { VALUES ?s { ${v} } ?s wdt:P809 ?w }`, f)) it.get(q(r.s)).wdpa.push(r.w);
}
const L = await labels(ids);
const queue = [...it.values()].filter((o) => o.wdpa.length === 1 && o.areas.length);
let at = 0;
const work = async () => {
  while (at < queue.length) {
    const o = queue[at++];
    try {
      const x = await fetch(`https://www.protectedplanet.net/${o.wdpa[0]}`, { headers: { "User-Agent": "Mozilla/5.0 custom-wordlists-analysis" }, signal: AbortSignal.timeout(45000) });
      const t = (await x.text()).replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      const m = /SITE ID\s+([\d.,]+) km&sup2; Reported Area/.exec(t);
      o.pp = m ? +m[1].replace(/,/g, "") : null; o.status = x.status;
    } catch (e) { o.pp = null; o.status = e.name; }
    await new Promise((r) => setTimeout(r, 150));
  }
};
await Promise.all(Array.from({ length: 5 }, work));
const done = queue.filter((o) => o.pp), wrong = [];
for (const o of done) { o.max = Math.max(...o.areas.map((a) => a.km2)); o.ratio = o.max / o.pp; if (o.ratio >= 3 || o.ratio <= 1 / 3) wrong.push(o); }
console.log(`members ${ids.length}; one WDPA ID and an area ${queue.length}; page with an area ${done.length}; failed ${queue.length - done.length} (${[...new Set(queue.filter((o) => !o.pp).map((o) => o.status))].join(", ")})`);
const band = (a, b) => done.filter((o) => o.ratio >= a && o.ratio < b).length;
console.log(`ratio Wikidata / Protected Planet: under 1/3 ${band(0, 1 / 3)}; 1/3 to 0.8 ${band(1 / 3, 0.8)}; 0.8 to 1.25 ${band(0.8, 1.25)}; 1.25 to 3 ${band(1.25, 3)}; 3 to 30 ${band(3, 30)}; 30 to 300 ${band(30, 300)}; 300+ ${band(300, 1e12)}`);
console.log("too large:", wrong.filter((o) => o.ratio >= 3).sort((a, b) => b.max - a.max).slice(0, 40).map((o) => `${L[o.q]} ${Math.round(o.max)} vs ${Math.round(o.pp)} (x${o.ratio.toFixed(0)}, ${o.areas.map((a) => a.raw + " " + a.unit).join(" + ")})`).join("; "));
console.log("too small:", wrong.filter((o) => o.ratio <= 1 / 3).sort((a, b) => b.n - a.n).slice(0, 15).map((o) => `${L[o.q]} ${Math.round(o.max)} vs ${Math.round(o.pp)}`).join("; "));
if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify(done.map((o) => ({ ...o, l: L[o.q] })), null, 1));
