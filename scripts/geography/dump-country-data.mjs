// Writes data-raw/geography/countries/ — the raw material for the Countries and Capitals
// topics, harvested from Wikidata.
//
//   node scripts/geography/dump-country-data.mjs
//
// structure.tsv carries the numbers — ISO, population, continent, which capital belongs to
// which country — split from the names so a new population estimate is a one-line diff.
// Membership is sovereign states (P31 Q3624078) still in existence (no dissolution date
// P576), the line "List of countries of the world" draws too; Greenland and Puerto Rico sit
// outside it and are added back later as an omission rule, not here.
//
// country-names.json / capital-names.json hold every flagged name Wikidata carries, keyed by
// Q-id: rdfs:label (the pref), P1448 (official) and P1813 (short), per language, in EVERY
// language Wikidata has — no language filter, so a new content language is a build change,
// never a re-dump. Bare skos:altLabel aliases are the discardable flood the buckets never
// keep (see bucket-names.mjs), so they are not fetched. Casing and the one-continent pick
// are the build's job (build-country-data.mjs), as with the elements.
//
// CURATED TERRITORIES TOO. The matrix territories (sovereign-territories.json) that are not
// UN sovereign states are harvested alongside, so their names come from Wikidata like every
// other. territory-structure.tsv resolves each curated territory to its Q-id, population and
// capital, the join the build needs once the ISO/GeoNames handles the file still carries fall
// away with GeoNames.
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "data-raw", "geography", "countries");
const ENDPOINT = "https://query.wikidata.org/sparql";
const UA = { "User-Agent": "custom-wordlists/1.0 (https://github.com/Trummler12/custom-wordlists)" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** One row per country: ISO code, population, and the continents and capitals as they
 *  stand. `SAMPLE` collapses the odd country ranking two population figures equally;
 *  `GROUP_CONCAT` keeps every continent and capital, since dropping either is a decision
 *  the build makes with the values in hand, not one to lose here. */
const STRUCTURE = `SELECT ?country
  (SAMPLE(?iso) AS ?isoCode)
  (SAMPLE(?pop) AS ?population)
  (GROUP_CONCAT(DISTINCT ?continent; separator="|") AS ?continents)
  (GROUP_CONCAT(DISTINCT ?capital; separator="|") AS ?capitals) WHERE {
  ?country wdt:P31 wd:Q3624078 .
  FILTER NOT EXISTS { ?country wdt:P576 []. }
  OPTIONAL { ?country wdt:P297 ?iso. }
  OPTIONAL { ?country wdt:P1082 ?pop. }
  OPTIONAL { ?country wdt:P30 ?continent. }
  OPTIONAL { ?country wdt:P36 ?capital. }
} GROUP BY ?country`;

/** Every flagged name for a chunk of items, all languages. `pref`/`official`/`short` are
 *  the three flags bucket-names.mjs reads; the language rides on each term's tag. */
const NAMES = (values) => `SELECT ?item ?lang ?term ?type WHERE {
  VALUES ?item { ${values} }
  { ?item rdfs:label ?term. BIND("pref" AS ?type) }
  UNION { ?item wdt:P1448 ?term. BIND("official" AS ?type) }
  UNION { ?item wdt:P1813 ?term. BIND("short" AS ?type) }
  BIND(LANG(?term) AS ?lang)
}`;

/** SPARQL GET with retry on the transient statuses query.wikidata.org throws under load. */
async function query(sparql, tries = 5) {
  const url = `${ENDPOINT}?format=json&query=${encodeURIComponent(sparql)}`;
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(url, { headers: UA });
    } catch (err) {
      if (attempt >= tries) throw err;
      await sleep(attempt * 2000);
      continue;
    }
    if (res.ok) return (await res.json()).results.bindings;
    if (attempt >= tries || ![429, 500, 502, 503, 504].includes(res.status)) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    await sleep(attempt * 2000);
  }
}

/** `Q…` from a Wikidata entity URI. */
const qid = (uri) => uri.replace(/^.*\/entity\//, "");

/** Fetch names for `qids` in chunks small enough to keep each query well under the endpoint's
 *  limits, and fold them into `{ qid: { names: { lang: [{ name, pref?, official?, short? }] } } }`
 *  in `order`. A name seen under several flags (Germany's "Deutschland" is pref and short)
 *  becomes one entry carrying both. */
async function dumpNames(qids, order, chunk = 20) {
  const byItem = {};
  for (let i = 0; i < qids.length; i += chunk) {
    const values = qids.slice(i, i + chunk).map((q) => `wd:${q}`).join(" ");
    const rows = await query(NAMES(values));
    for (const r of rows) {
      const lang = r.lang.value;
      if (!lang) continue; // an untagged monolingual value is unusable without a language
      const item = qid(r.item.value);
      const langMap = (byItem[item] ??= {});
      const nameMap = (langMap[lang] ??= {});
      const entry = (nameMap[r.term.value] ??= { name: r.term.value });
      entry[r.type.value] = true;
    }
    process.stdout.write(`  ${Math.min(i + chunk, qids.length)}/${qids.length}\r`);
    await sleep(300);
  }
  const out = {};
  for (const q of order) {
    const langMap = byItem[q] ?? {};
    const names = {};
    for (const lang of Object.keys(langMap).sort()) names[lang] = Object.values(langMap[lang]);
    out[q] = { names };
  }
  return out;
}

/** Resolve the curated territories to Wikidata: each keeps its curated name, gains its Q-id
 *  and, from Wikidata, population (P1082) and capital (P36). The curated file still addresses
 *  them by ISO (P297) or GeoNames id (P1566); this bridges that to the Q-id the build will use
 *  once GeoNames is gone. */
async function territories() {
  const curated = JSON.parse(await readFile(join(OUT, "sovereign-territories.json"), "utf8"));
  delete curated._comment;
  const entries = Object.entries(curated);
  const isoList = entries.filter(([, m]) => m.iso).map(([, m]) => m.iso);
  const geoList = entries.filter(([, m]) => m.geonameId).map(([, m]) => String(m.geonameId));
  const resolve = (bindVar, values, prop) =>
    query(`SELECT ?item ?key (SAMPLE(?pop) AS ?population) (SAMPLE(?cap) AS ?capital) WHERE {
      VALUES ?key { ${values.map((v) => `"${v}"`).join(" ")} }
      ?item ${prop} ?key . OPTIONAL { ?item wdt:P1082 ?pop } OPTIONAL { ?item wdt:P36 ?cap }
    } GROUP BY ?item ?key`);
  const byKey = {};
  for (const r of isoList.length ? await resolve("iso", isoList, "wdt:P297") : []) byKey[`iso:${r.key.value}`] = r;
  for (const r of geoList.length ? await resolve("gid", geoList, "wdt:P1566") : []) byKey[`geo:${r.key.value}`] = r;
  return entries.map(([name, m]) => {
    const r = byKey[m.iso ? `iso:${m.iso}` : `geo:${m.geonameId}`];
    return {
      name,
      qid: r ? qid(r.item.value) : null,
      pop: r?.population ? Number(r.population.value) : null,
      capital: r?.capital ? qid(r.capital.value) : null,
    };
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });

  // --- Structure, and the country order everything else follows ---------------
  const structure = await query(STRUCTURE);
  // Descending by population, so the file already reads in tier order and the build cuts
  // thresholds down a sorted list. Missing population sorts last.
  const ranked = structure
    .map((r) => ({
      country: qid(r.country.value),
      iso: r.isoCode?.value ?? "",
      pop: r.population ? Number(r.population.value) : null,
      continents: r.continents?.value ? r.continents.value.split("|").map(qid) : [],
      capitals: r.capitals?.value ? r.capitals.value.split("|").map(qid) : [],
    }))
    .sort((a, b) => (b.pop ?? -1) - (a.pop ?? -1));

  const tsv = ranked.map((c) =>
    [c.country, c.iso, c.pop ?? "", c.continents.join("|"), c.capitals.join("|")].join("\t"),
  );
  await writeFile(
    join(OUT, "structure.tsv"),
    "# country\tiso\tpopulation\tcontinents (P30, raw)\tcapitals (P36)\n" + tsv.join("\n") + "\n",
    "utf8",
  );
  console.log(`countries — ${ranked.length}`);

  // --- Territories: the curated matrix entries, resolved to Wikidata -----------
  const terr = await territories();
  const missing = terr.filter((t) => !t.qid).map((t) => t.name);
  if (missing.length) throw new Error(`unresolved territories: ${missing.join(", ")}`);
  await writeFile(
    join(OUT, "territory-structure.tsv"),
    "# name\tqid\tpopulation (P1082)\tcapital (P36)\n" +
      terr.map((t) => [t.name, t.qid, t.pop ?? "", t.capital ?? ""].join("\t")).join("\n") + "\n",
    "utf8",
  );
  console.log(`territories — ${terr.length}`);

  // --- Names: sovereign states and territories share one file, keyed by Q-id ---
  const countryOrder = [...new Set([...ranked.map((c) => c.country), ...terr.map((t) => t.qid)])];
  const countryNames = await dumpNames(countryOrder, countryOrder);
  await writeFile(join(OUT, "country-names.json"), JSON.stringify(countryNames, null, 2) + "\n", "utf8");

  // Capitals in the same order, each country's capitals adjacent; a country with two
  // contributes both, in P36 order. Territory capitals follow.
  const capitalOrder = [...new Set([...ranked.flatMap((c) => c.capitals), ...terr.map((t) => t.capital).filter(Boolean)])];
  console.log(`capitals — ${capitalOrder.length}`);
  const capitalNames = await dumpNames(capitalOrder, capitalOrder);
  await writeFile(join(OUT, "capital-names.json"), JSON.stringify(capitalNames, null, 2) + "\n", "utf8");
}

main().catch((err) => {
  console.error("dump-country-data failed:", err.message);
  process.exit(1);
});
