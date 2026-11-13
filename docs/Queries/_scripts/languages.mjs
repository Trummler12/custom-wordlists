// Languages: how the build's membership (a class of the modern-language family, gated by
// an ISO 639-1 code or a positive speaker count) compares with membership by ISO code, and
// which well-known languages each one loses.
//
//   node languages.mjs
import { labels, sparql } from "./wd.mjs";

// The classes #35's dump accepts (scripts/geography/dump-language-data.mjs, WHITELIST).
const WL = ["Q1288568", "Q138638548", "Q45762", "Q38058796", "Q2315359", "Q33215", "Q2623733", "Q33384", "Q1208380", "Q399495", "Q941501", "Q25295"];
const wl = WL.map((q) => `wd:${q}`).join(" ");

const ids = (rows) => new Set(rows.map((r) => r.l));
// The build's membership, reproduced: the gate first (cheap), then the class path.
const bySpk = ids(await sparql(`SELECT DISTINCT ?l WHERE { ?l wdt:P1098 ?s . FILTER(?s > 0) ?l wdt:P31/wdt:P279* ?c . VALUES ?c { ${wl} } }`));
const byIso1 = ids(await sparql(`SELECT DISTINCT ?l WHERE { ?l wdt:P218 [] . ?l wdt:P31/wdt:P279* ?c . VALUES ?c { ${wl} } }`));
const build = new Set([...bySpk, ...byIso1]);
console.log(`build membership: ${build.size} (speakers ${bySpk.size}, ISO 639-1 ${byIso1.size})`);

// Membership by code alone: ISO 639-1 / -2 / -3 name languages, macrolanguages and
// collectives, never a class decision.
const iso1 = ids(await sparql(`SELECT DISTINCT ?l WHERE { ?l wdt:P218 [] }`));
const iso2 = ids(await sparql(`SELECT DISTINCT ?l WHERE { ?l wdt:P219 [] }`));
const iso3 = ids(await sparql(`SELECT DISTINCT ?l WHERE { ?l wdt:P220 [] }`));
const iso3spk = ids(await sparql(`SELECT DISTINCT ?l WHERE { ?l wdt:P220 [] ; wdt:P1098 ?s . FILTER(?s > 0) }`));
console.log(`items with ISO 639-1: ${iso1.size}, 639-2: ${iso2.size}, 639-3: ${iso3.size} (with speakers > 0: ${iso3spk.size})`);

// What the class path loses: coded items outside the family, ranked by sitelinks.
const lost = [...new Set([...iso1, ...iso2])].filter((q) => !build.has(q));
const lost3 = [...iso3spk].filter((q) => !build.has(q) && !iso1.has(q) && !iso2.has(q));
const meta = async (qs) => {
  const out = {};
  for (let i = 0; i < qs.length; i += 200) {
    const v = qs.slice(i, i + 200).map((q) => `wd:${q}`).join(" ");
    for (const r of await sparql(`SELECT ?l ?n (GROUP_CONCAT(DISTINCT ?c; separator="|") AS ?cls) WHERE { VALUES ?l { ${v} } ?l wikibase:sitelinks ?n . OPTIONAL { ?l wdt:P31 ?c } } GROUP BY ?l ?n`))
      // GROUP_CONCAT keeps the full URIs, which wd.mjs only strips from a single value.
      out[r.l] = { n: Number(r.n), cls: r.cls ? r.cls.split("|").map((c) => c.replace(/^.*\/entity\//, "")) : [] };
  }
  return out;
};
for (const [name, list] of [["ISO 639-1 / -2 items outside the build", lost], ["ISO 639-3 items with speakers, outside the build", lost3]]) {
  const m = await meta(list);
  const top = list.sort((a, b) => (m[b]?.n ?? 0) - (m[a]?.n ?? 0));
  const L = await labels([...top.slice(0, 40), ...top.slice(0, 40).flatMap((q) => m[q]?.cls ?? [])]);
  console.log(`\n${name}: ${list.length}; ≥ 100 sitelinks: ${list.filter((q) => (m[q]?.n ?? 0) >= 100).length}`);
  for (const q of top.slice(0, 40)) console.log(`  ${L[q] ?? q} (${q}) ${m[q]?.n}: ${(m[q]?.cls ?? []).map((c) => L[c] ?? c).join(", ") || "no P31"}`);
  // Which classes keep them out: the most common truthy P31 among the lost.
  const cc = {};
  for (const q of list) for (const c of m[q]?.cls ?? []) cc[c] = (cc[c] ?? 0) + 1;
  const CL = await labels(Object.keys(cc));
  console.log(`  their classes: ${Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([c, n]) => `${CL[c] ?? c} (${c}) ${n}`).join(", ")}`);
}

// A preferred P31 hides the other classes from the truthy reading (Hindi: *register*).
const pref = await sparql(`SELECT ?l ?c WHERE { ?l p:P31 ?s . ?s wikibase:rank wikibase:PreferredRank ; ps:P31 ?c . ?l wdt:P218 [] . }`);
const PL = await labels([...pref.map((r) => r.l), ...pref.map((r) => r.c)]);
console.log(`\nISO 639-1 items with a preferred P31: ${pref.length}: ${pref.map((r) => `${PL[r.l]} => ${PL[r.c] ?? r.c}${build.has(r.l) ? "" : " (out)"}`).join(", ")}`);
