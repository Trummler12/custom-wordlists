// Pokémon species: whether a Wikidata number can stand in for the editorial fame tiers
// (sitelinks against the Sporcle-based tiers per generation), how Wikidata's labels compare
// with the official names the build takes from PokéAPI, and what it holds in the
// languages the games were never released in.
//
//   node pokemon.mjs [path to data/topics/gaming/pokemon]
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { sparql } from "./wd.mjs";

const DIR = process.argv[2] ?? "../../../../data/topics/gaming/pokemon";
// The build's official languages and the Wikidata tag each reads; ja-Latn is derived.
const OFFICIAL = { de: "de", es: "es", fr: "fr", it: "it", ja: "ja", ko: "ko", "zh-Hans": "zh-hans", "zh-Hant": "zh-hant" };
const OTHER = ["pt", "ru", "tr", "pl", "nl", "bg", "cs", "da", "et", "fi", "el", "he", "hu", "lv", "mk", "nb", "ro", "sr", "sk", "sv", "tl"];
const GENS = ["Q27118928", "Q27118900", "Q27118889", "Q27118795", "Q27118381", "Q27065429", "Q26945334", "Q61951126", "Q111033398"];

// The species: a generation as first appearance, and the National Pokédex number (P1685).
const sp = await sparql(`SELECT ?i ?en ?n (SAMPLE(?d) AS ?dex) WHERE { VALUES ?g { ${GENS.map((q) => `wd:${q}`).join(" ")} }
  ?i wdt:P31/wdt:P279* wd:Q3966183 ; wdt:P4584 ?g ; wikibase:sitelinks ?n . OPTIONAL { ?i wdt:P1685 ?d }
  OPTIONAL { ?i rdfs:label ?en FILTER(LANG(?en) = "en") } } GROUP BY ?i ?en ?n`);
// ♀ and ♂ stay: they are all that tells the two Nidoran apart.
const key = (s) => s?.toLowerCase().replace(/[^\p{L}\p{N}♀♂]/gu, "");
const byEn = new Map(sp.map((r) => [key(r.en), r]));
console.log(`species with a generation: ${sp.length}; with a Pokédex number: ${sp.filter((r) => r.dex).length}`);

// Our tiers, generation by generation: does the sitelink count order them the same way?
const spearman = (xs, ys) => {
  const rank = (v) => { const s = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]); const r = []; for (let i = 0; i < s.length;) { let j = i; while (j < s.length && s[j][0] === s[i][0]) j++; for (let k = i; k < j; k++) r[s[k][1]] = (i + j - 1) / 2; i = j; } return r; };
  const a = rank(xs), b = rank(ys), m = (v) => v.reduce((x, y) => x + y) / v.length, ma = m(a), mb = m(b);
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < a.length; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  return num / Math.sqrt(da * db);
};
const entries = [];
const unmatched = [];
console.log("\nsitelinks against our tiers (Spearman; negative = more sitelinks in the higher tiers):");
for (let g = 1; g <= 9; g++) {
  const t = JSON.parse(await readFile(join(DIR, "pokemon", `generation-${g}.json`), "utf8"));
  const tiers = (t.groups?.[0] ?? t).tiers;
  const pairs = [];
  tiers.forEach((tier, ti) => tier.forEach((e) => {
    const names = typeof e === "string" ? { en: e } : e;
    const r = byEn.get(key(names.en));
    if (!r) return unmatched.push(names.en);
    pairs.push([ti, Number(r.n)]);
    entries.push({ g, ti, names, r });
  }));
  const med = (ti) => { const v = pairs.filter((p) => p[0] === ti).map((p) => p[1]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
  console.log(`  gen ${g}: ${pairs.length} matched, rho ${spearman(pairs.map((p) => p[0]), pairs.map((p) => p[1])).toFixed(2)}; median sitelinks per tier ${tiers.map((_, ti) => med(ti)).join(" / ")}`);
}
console.log(`unmatched by English name: ${unmatched.length}${unmatched.length ? ": " + unmatched.slice(0, 20).join(", ") : ""}`);
const all = entries.map((e) => Number(e.r.n));
console.log(`sitelinks over all species: min ${Math.min(...all)}, median ${all.sort((a, b) => a - b)[Math.floor(all.length / 2)]}, max ${Math.max(...all)}; species with fewer than 10: ${all.filter((n) => n < 10).length}`);

// Labels, one language per query: all at once outgrows what WDQS answers in one piece.
// Chunked by item too: a thousand ids overflow the GET request's URI.
const lab = {};
for (let c = 0; c < entries.length; c += 250) {
  const vals = `VALUES ?i { ${entries.slice(c, c + 250).map((e) => `wd:${e.r.i}`).join(" ")} }`;
  for (const t of [...Object.values(OFFICIAL), ...OTHER])
    for (const r of await sparql(`SELECT ?i ?l WHERE { ${vals} ?i rdfs:label ?l FILTER(LANG(?l) = "${t}") }`)) (lab[r.i] ??= {})[t] = r.l;
}

console.log(`\nofficial languages, Wikidata label against the official name (PokéAPI, as in our lists):`);
for (const [ours, tag] of Object.entries(OFFICIAL)) {
  const have = entries.filter((e) => lab[e.r.i]?.[tag]);
  // An absent key in our list means "same as English".
  const off = have.filter((e) => key(lab[e.r.i][tag]) !== key(e.names[ours] ?? e.names.en));
  console.log(`  ${ours}: label on ${have.length} of ${entries.length}, differs on ${off.length}${off.length ? `: ${off.slice(0, 8).map((e) => `${e.names.en} ${JSON.stringify(lab[e.r.i][tag])} vs ${JSON.stringify(e.names[ours] ?? e.names.en)}`).join(", ")}` : ""}`);
}
console.log(`\nother languages: label coverage and how many differ from the English name (a transliteration or a fan name):`);
for (const tag of OTHER) {
  const have = entries.filter((e) => lab[e.r.i]?.[tag]);
  const diff = have.filter((e) => key(lab[e.r.i][tag]) !== key(e.names.en));
  console.log(`  ${tag}: ${have.length} of ${entries.length}, ${diff.length} differ${diff.length ? `, e.g. ${diff.slice(0, 4).map((e) => `${e.names.en} => ${lab[e.r.i][tag]}`).join(", ")}` : ""}`);
}
