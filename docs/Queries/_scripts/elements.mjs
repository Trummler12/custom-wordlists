// Chemical elements: whether the build's membership still yields one item per atomic
// number, and how clean the labels are in the build's languages (gaps down each fallback
// chain, invisible characters, disambiguators, Simplified Chinese read from `zh`).
//
//   node elements.mjs
import { sparql } from "./wd.mjs";

// The build's chains (scripts/lib/wikidata.mjs), without `mul`: no element is named there.
const CHAINS = {
  de: ["de"], es: ["es"], fr: ["fr"], it: ["it"], ja: ["ja"], ko: ["ko"],
  "zh-Hans": ["zh-hans", "zh-cn", "zh-sg", "zh-my", "zh"], "zh-Hant": ["zh-hant", "zh-tw", "zh-hk", "zh-mo"],
  pt: ["pt", "pt-br", "pt-pt"], ru: ["ru"], tr: ["tr"], pl: ["pl"], nl: ["nl"], bg: ["bg"], cs: ["cs"], da: ["da"],
  et: ["et"], fi: ["fi"], el: ["el"], he: ["he"], hu: ["hu"], lv: ["lv"], mk: ["mk"], no: ["no", "nb", "nn"],
  ro: ["ro"], sr: ["sr"], sk: ["sk"], sv: ["sv"], tl: ["tl", "fil"],
};
const TAGS = ["en", ...new Set(Object.values(CHAINS).flat())];

const els = await sparql(`SELECT DISTINCT ?item ?z WHERE { ?item p:P31/ps:P31 wd:Q11344 .
  MINUS { ?item p:P31/ps:P31/wdt:P279* wd:Q1299291 . } OPTIONAL { ?item wdt:P1086 ?z } }`);
const zs = els.map((r) => Number(r.z));
const dupZ = zs.filter((z, i) => zs.indexOf(z) !== i);
console.log(`elements: ${els.length}; atomic numbers 1..${Math.max(...zs)}, duplicates: ${dupZ.join(", ") || "-"}, gaps: ${[...Array(118).keys()].map((i) => i + 1).filter((z) => !zs.includes(z)).join(", ") || "-"}`);

const vals = `VALUES ?item { ${els.map((r) => `wd:${r.item}`).join(" ")} }`;
// One query per language: all of them at once outgrows what WDQS answers in one piece.
const rows = [];
for (const t of TAGS) rows.push(...(await sparql(`SELECT ?item ?l ("${t}" AS ?g) WHERE { ${vals} ?item rdfs:label ?l . FILTER(LANG(?l) = "${t}") }`)));
const lab = {};
for (const r of rows) (lab[r.item] ??= {})[r.g] = r.l;
const en = (q) => lab[q]?.en ?? q;
const z = Object.fromEntries(els.map((r) => [r.item, Number(r.z)]));
const byZ = (a, b) => z[a] - z[b];

console.log("\ngaps down each chain:");
for (const [tag, chain] of Object.entries(CHAINS)) {
  const miss = els.map((r) => r.item).filter((q) => !chain.some((t) => lab[q]?.[t])).sort(byZ);
  if (miss.length) console.log(`  ${tag}: ${miss.length}: ${miss.map((q) => `${en(q)} (${z[q]})`).join(", ")}`);
}
const zhOnly = els.map((r) => r.item).filter((q) => !CHAINS["zh-Hans"].slice(0, -1).some((t) => lab[q]?.[t]) && lab[q]?.zh).sort(byZ);
console.log(`zh-Hans read from zh: ${zhOnly.length}: ${zhOnly.map((q) => `${en(q)} ${lab[q].zh}${lab[q]["zh-hant"] === lab[q].zh ? " (= zh-hant)" : ""}`).join(", ") || "-"}`);

const odd = rows.filter((r) => /\p{Cf}/u.test(r.l) || /[(（]/.test(r.l) || r.l !== r.l.trim());
console.log(`\nlabels with an invisible character, a parenthetical or stray spaces: ${odd.length}`);
for (const r of odd.sort((a, b) => byZ(a.item, b.item))) console.log(`  ${en(r.item)} (${z[r.item]}) ${r.g}: ${JSON.stringify(r.l)} ${[...r.l].filter((c) => /\p{Cf}/u.test(c)).map((c) => `U+${c.codePointAt(0).toString(16).toUpperCase()}`).join(" ")}`);

// A label that differs from the language's Wikipedia article title on more than case and
// a disambiguator is worth a look: one of the two names is likely off.
const sl = await sparql(`SELECT ?item ?t ?w WHERE { ${vals} ?a schema:about ?item ; schema:isPartOf ?w ; schema:name ?t .
  FILTER(?w IN (${["de", "es", "fr", "it", "pt", "ru", "tr", "pl", "nl", "cs", "da", "fi", "hu", "ro", "sk", "sv", "tl"].map((w) => `<https://${w}.wikipedia.org/>`).join(", ")})) }`);
const diff = sl.map((r) => ({ ...r, g: r.w.replace(/https:\/\/|\.wikipedia\.org\//g, ""), base: r.t.replace(/\s*\([^)]*\)$/, "") }))
  .filter((r) => lab[r.item]?.[r.g] && lab[r.item][r.g].toLowerCase() !== r.base.toLowerCase());
console.log(`\nlabel differs from the article title (beyond case and disambiguator): ${diff.length}`);
for (const r of diff.sort((a, b) => byZ(a.item, b.item))) console.log(`  ${en(r.item)} (${z[r.item]}) ${r.g}: label ${JSON.stringify(lab[r.item][r.g])}, article ${JSON.stringify(r.t)}`);
