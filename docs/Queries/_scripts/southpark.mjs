// South Park: which items Wikidata links to the series, how they match our characters by
// tier (the gaps that matter are the upper tiers), whether sitelinks follow our tiers, the
// families and the video games, and the de labels against ours.
//
//   node southpark.mjs [path to data/topics/animation/south-park/characters.json]
import { readFile } from "node:fs/promises";
import { labels, sparql } from "./wd.mjs";

const FILE = process.argv[2] ?? "../../../../data/topics/animation/south-park/characters.json";
const SP = "Q16538";
const t = JSON.parse(await readFile(FILE, "utf8"));
const tiers = (t.groups?.[0] ?? t).tiers;
const en = (v) => (typeof v === "string" ? v : v?.en);
// An entry's English forms: a plain name, a short / long pair, or a language map.
// The full name first: a first name alone can belong to another item.
const forms = (e) => typeof e === "string" ? [e] : [en(e.long), e.en, en(e.short)].filter(Boolean);
const key = (s) => s.toLowerCase().replace(/^(mr|ms|mrs|dr)\.? /, "").replace(/[^\p{L}\p{N}]/gu, "");

const rows = await sparql(`SELECT ?i ?l ?n ?p WHERE { VALUES ?p { wdt:P1441 wdt:P1080 wdt:P8345 } ?i ?p wd:${SP} ; wikibase:sitelinks ?n .
  OPTIONAL { ?i rdfs:label ?l FILTER(LANG(?l) = "en") } }`, { fresh: true });
const items = {};
for (const r of rows) (items[r.i] ??= { en: r.l ?? r.i, n: Number(r.n), props: new Set() }).props.add(r.p.replace(/^.*\//, ""));
const alias = await sparql(`SELECT ?i ?a WHERE { ?i wdt:P1441 wd:${SP} ; skos:altLabel ?a FILTER(LANG(?a) = "en") }`, { fresh: true });
const byKey = new Map();
// The 2023 special (Q123024716) has its own versions of Cartman, Kenny and the town under the same names.
const special = new Set((await sparql(`SELECT ?i WHERE { ?i wdt:P1441 wd:Q123024716 }`)).map((r) => r.i));
for (const [q, it] of Object.entries(items)) if (!special.has(q)) { byKey.set(key(it.en), q); const first = it.en.split(" ")[0]; if (!byKey.has(key(first))) byKey.set(key(first), q); }
for (const r of alias) if (!byKey.has(key(r.a))) byKey.set(key(r.a), r.i);
const props = {};
for (const it of Object.values(items)) { const k = [...it.props].sort().join("+"); props[k] = (props[k] ?? 0) + 1; }
console.log(`items linked to South Park: ${Object.keys(items).length} (${Object.entries(props).map(([k, n]) => `${k} ${n}`).join(", ")})`);

const hit = new Set();
let sum = 0;
console.log("\nour characters by tier: matched / total, and the unmatched:");
tiers.forEach((tier, ti) => {
  const miss = [];
  let m = 0;
  for (const e of tier) {
    const q = forms(e).map((f) => byKey.get(key(f))).find(Boolean);
    if (q) { m++; hit.add(q); } else miss.push(forms(e)[0]);
  }
  sum += m;
  console.log(`  tier ${ti + 1}: ${m} / ${tier.length}${miss.length ? `; missing: ${miss.join(", ")}` : ""}`);
});
console.log(`total: ${sum} / ${tiers.flat().length}`);
const extra = Object.entries(items).filter(([q]) => !hit.has(q)).sort((a, b) => b[1].n - a[1].n);
console.log(`\nlinked items not in our list: ${extra.length}: ${extra.map(([q, it]) => `${it.en} (${q}, ${it.n})`).join(", ")}`);

// Classes of the linked items: what a character query by class would have to cover.
const cls = await sparql(`SELECT ?c (COUNT(DISTINCT ?i) AS ?k) WHERE { ?i wdt:P1441 wd:${SP} ; wdt:P31 ?c } GROUP BY ?c ORDER BY DESC(?k)`, { fresh: true });
const CL = await labels(cls.map((r) => r.c));
console.log(`\nclasses: ${cls.map((r) => `${CL[r.c] ?? r.c} ${r.k}`).join(", ")}`);

// Fame: median sitelinks per tier over the matched characters.
const med = (v) => { v.sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : "-"; };
console.log(`median sitelinks per tier: ${tiers.map((tier) => med(tier.map((e) => forms(e).map((f) => byKey.get(key(f))).find(Boolean)).filter(Boolean).map((q) => items[q].n))).join(" / ")}`);

// de labels against our de names (a missing de in our list means "same as English").
const de = await sparql(`SELECT ?i ?l WHERE { ?i wdt:P1441 wd:${SP} ; rdfs:label ?l FILTER(LANG(?l) = "de") }`, { fresh: true });
console.log(`\nde labels on linked items: ${de.length}`);
const deOf = Object.fromEntries(de.map((r) => [r.i, r.l]));
for (const e of tiers.flat()) {
  const q = forms(e).map((f) => byKey.get(key(f))).find(Boolean);
  if (!q || !deOf[q] || typeof e === "string") continue;
  const ours = [e.de, en(e.long), e.long?.de, e.short?.de, en(e.short)].filter(Boolean);
  if (!ours.some((o) => key(o) === key(deOf[q])) && key(deOf[q]) !== key(items[q].en)) console.log(`  ${forms(e).join(" / ")}: Wikidata ${JSON.stringify(deOf[q])}, ours ${JSON.stringify(e.de ?? e.long?.de ?? e.short?.de ?? "(= en)")}`);
}

// Families and games.
const fam = await sparql(`SELECT ?i ?l WHERE { ?i wdt:P31/wdt:P279* wd:Q15331236 ; wdt:P1441|wdt:P1080 wd:${SP} . OPTIONAL { ?i rdfs:label ?l FILTER(LANG(?l) = "en") } }`, { fresh: true });
console.log(`\nfamilies (fictional family, linked to South Park): ${fam.map((r) => `${r.l ?? r.i} (${r.i})`).join(", ") || "-"}`);
const games = await sparql(`SELECT ?i ?l ?d WHERE { ?i wdt:P31/wdt:P279* wd:Q7889 . { ?i wdt:P179 wd:Q124656884 } UNION { ?i wdt:P8345|wdt:P144 wd:${SP} } UNION { ?i wdt:P8345 wd:Q54622175 }
  OPTIONAL { ?i rdfs:label ?l FILTER(LANG(?l) IN ("en", "mul")) } OPTIONAL { ?i wdt:P577 ?d } }`, { fresh: true });
const G = {};
for (const r of games) G[r.i] = `${r.l ?? r.i} (${r.d ? r.d.slice(0, 4) : "?"})`;
console.log(`video games (P179 the game series, P8345 / P144 the show, or P8345 the franchise): ${Object.keys(G).length}: ${Object.values(G).sort((a, b) => a.slice(-5).localeCompare(b.slice(-5))).join(", ")}`);
