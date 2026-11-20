// Could sitelinks fill an incomplete topic? Ranks a franchise's members by sitelinks and
// shows where our curated entries fall: their tiers against the ranks (Spearman), and the
// best-known members our list lacks.
//
//   node topic-rank.mjs <data/topics/…json> <class-QID> <work-QID>... [--top N]
//
// Members as in members.mjs (the class with subclasses, plus groups of fictional
// characters, linked by P1441 / P1080 / P179 / P8345 / P361); entries matched by English
// or mul label or English alias, exactly or as the first word(s) of a label ("Frodo").
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sparql } from "./wd.mjs";

const args = process.argv.slice(2);
const file = args.find((a) => a.endsWith(".json"));
const [cls, ...works] = args.filter((a) => /^Q\d+$/.test(a));
const top = Number(args[args.indexOf("--top") + 1]) || 25;

const topic = JSON.parse(readFileSync(resolve(file), "utf8"));
const english = (e) => (typeof e === "string" ? e : (e.en?.short ?? e.en?.pref ?? e.en ?? e.short?.en ?? Object.values(e)[0]));
const norm = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, " ").replace(/^the /, "").trim();
const entries = (topic.tiers ?? [topic.words]).flatMap((t, tier) => t.map((e) => ({ name: english(e), tier })));

// Membership and names in separate queries: one query for both times out on large franchises.
const link = `VALUES ?work { ${works.map((w) => `wd:${w}`).join(" ")} }
    { ?item wdt:P1441 ?work } UNION { ?item wdt:P1080 ?work } UNION { ?item wdt:P179 ?work } UNION { ?item wdt:P8345 ?work } UNION { ?item wdt:P361 ?work }`;
const ids = new Set(), groups = new Set();
for (const c of [cls, "Q14514600"]) for (const r of await sparql(`SELECT DISTINCT ?item WHERE { ${link} ?item wdt:P31/wdt:P279* wd:${c} . }`)) {
  const q = r.item.split("/").pop();
  if (c !== cls && !ids.has(q)) groups.add(q);
  ids.add(q);
}
const rows = [];
const list = [...ids];
for (let i = 0; i < list.length; i += 200) {
  rows.push(...await sparql(`SELECT ?item ?label ?name ?links WHERE { VALUES ?item { ${list.slice(i, i + 200).map((q) => "wd:" + q).join(" ")} }
    ?item wikibase:sitelinks ?links .
    OPTIONAL { ?item rdfs:label ?label FILTER(LANG(?label) = "en") }
    { ?item rdfs:label ?name FILTER(LANG(?name) IN ("en", "mul")) } UNION { ?item skos:altLabel ?name FILTER(LANG(?name) = "en") } }`));
}
const members = new Map();
for (const r of rows) {
  const m = members.get(r.item) ?? { item: r.item.split("/").pop(), label: r.label ?? r.name, links: Number(r.links), names: new Set() };
  m.names.add(norm(r.name));
  members.set(r.item, m);
}
const ranked = [...members.values()].sort((a, b) => b.links - a.links);
ranked.forEach((m, i) => (m.rank = i + 1));

const hit = (n) => ranked.find((m) => m.names.has(n)) ?? ranked.find((m) => [...m.names].some((x) => x.startsWith(`${n} `)));
const found = entries.map((e) => ({ ...e, m: hit(norm(e.name)) }));
const ours = new Set(found.filter((f) => f.m).map((f) => f.m.item));

// Spearman between tier (0 = most famous) and sitelink rank, ties averaged.
const rankOf = (xs) => { const s = xs.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]); const r = []; for (let i = 0; i < s.length;) { let j = i; while (j < s.length && s[j][0] === s[i][0]) j++; for (let k = i; k < j; k++) r[s[k][1]] = (i + j + 1) / 2; i = j; } return r; };
const pairs = found.filter((f) => f.m);
const a = rankOf(pairs.map((p) => p.tier)), b = rankOf(pairs.map((p) => p.m.rank));
const n = a.length, ma = a.reduce((x, y) => x + y, 0) / n, mb = b.reduce((x, y) => x + y, 0) / n;
const rho = a.reduce((s, x, i) => s + (x - ma) * (b[i] - mb), 0) / Math.sqrt(a.reduce((s, x) => s + (x - ma) ** 2, 0) * b.reduce((s, y) => s + (y - mb) ** 2, 0));

console.log(`${file}: ${members.size} members; ${pairs.length}/${entries.length} entries found; Spearman tier vs sitelink rank ${rho.toFixed(2)}`);
const tiers = [...new Set(entries.map((e) => e.tier))];
for (const t of tiers) {
  const ft = found.filter((f) => f.tier === t);
  const rs = ft.filter((f) => f.m).map((f) => f.m.rank).sort((x, y) => x - y);
  console.log(`  tier ${t + 1}: ranks ${rs.join(", ")}${ft.some((f) => !f.m) ? `; not found: ${ft.filter((f) => !f.m).map((f) => f.name).join(", ")}` : ""}`);
}
const lack = ranked.filter((m) => !ours.has(m.item)).slice(0, top);
console.log(`  best-known members not in our list (rank, sitelinks): ${lack.map((m) => `${m.rank} ${m.label}${groups.has(m.item) ? " (group)" : ""} ${m.links}`).join("; ")}`);
const last = Math.max(...pairs.map((p) => p.m.rank));
console.log(`  our lowest-ranked entry is #${last}; members at or above it not in our list: ${ranked.slice(0, last).filter((m) => !ours.has(m.item)).length}`);
