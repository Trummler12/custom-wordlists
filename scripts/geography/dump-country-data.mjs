// Writes data-raw/geography/countries/ — the raw material for the Countries and
// Capitals topics.
//
//   node scripts/geography/dump-country-data.mjs
//
// WHICH ITEMS. `wdt:P31 wd:Q3624078` (sovereign state), minus anything carrying a
// dissolution date (`P576`) — the class holds the Russian Empire and its like, and
// "still exists" is the whole difference between them and the 197 the UN counts.
// That is the line "List of countries of the world" draws too; Greenland and
// Puerto Rico are deliberately outside it and get added back later as an omission
// rule, not here.
//
// TWO NAMES THE BUILD FIXES, NOT THE DUMP. Wikidata tags only the realm, "Kingdom
// of Denmark" (Q756617), as the sovereign state — Q35 "Denmark" is a constituent
// country — so the drawable short name is an override there. And St. John's
// (Q36262, Antigua's capital) has no English label at all. Both are display
// decisions, so they live in build-country-data.mjs beside the continent picks.
//
// KEYED BY Q-ID, NOT BY NAME. Every file below is keyed on the Wikidata item, the
// one identifier that survives translation: `countries/<lang>.txt` maps the
// country item to its name, `capitals/<lang>.txt` the capital item to its. A
// capital has no ISO code and some share a name across countries, so a
// language-invariant key has to be the item — and using it for both files keeps
// the join between them a single kind of lookup.
//
// STRUCTURE AND NAMES APART. structure.tsv carries the numbers — population,
// continent, which capital belongs to which country — and the name files carry
// the names, so a new population estimate is a one-line diff instead of a churn
// across 197 x 9 name columns. Same split as the plate and element dumps.
//
// CONTINENT IS RAW HERE. `P30` gives Turkey and Russia two values each, and the
// five Pacific states a spurious "Insular Oceania" beside "Oceania". The dump
// records every value as given; picking exactly one per country is the build
// script's job (build-country-data.mjs), where the two genuine cases can be named.
//
// CASE IS THE SOURCE'S. English labels arrive as Wikidata's house style writes
// them; the build script decides casing, as with the elements.
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "data-raw", "geography", "countries");
const ENDPOINT = "https://query.wikidata.org/sparql";
const UA = { "User-Agent": "custom-wordlists/1.0 (https://github.com/Trummler12/custom-wordlists)" };

/** Our spelling → Wikidata's, which lower-cases script subtags (`zh-Hans` →
 *  `zh-hans`). The nine content languages, same set as the other geography dumps. */
const LANGS = {
  en: "en",
  de: "de",
  es: "es",
  fr: "fr",
  it: "it",
  ja: "ja",
  ko: "ko",
  "zh-Hans": "zh-hans",
  "zh-Hant": "zh-hant",
};

const LANG_LIST = Object.values(LANGS).map((l) => `"${l}"`).join(", ");

/** One row per country: ISO code, population, and the continents and capitals as
 *  they stand. `SAMPLE` collapses the odd country that ranks two population figures
 *  equally; `GROUP_CONCAT` keeps every continent and capital, since dropping either
 *  is a decision the build makes with the values in hand, not one to lose here. */
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

/** Labels for the countries themselves. */
const COUNTRY_LABELS = `SELECT ?country ?lang (SAMPLE(?label) AS ?name) WHERE {
  ?country wdt:P31 wd:Q3624078 ; rdfs:label ?label .
  FILTER NOT EXISTS { ?country wdt:P576 []. }
  BIND(LANG(?label) AS ?lang)
  FILTER(?lang IN (${LANG_LIST}))
} GROUP BY ?country ?lang`;

/** Labels for every capital any sovereign state names. */
const CAPITAL_LABELS = `SELECT ?capital ?lang (SAMPLE(?label) AS ?name) WHERE {
  ?country wdt:P31 wd:Q3624078 ; wdt:P36 ?capital .
  FILTER NOT EXISTS { ?country wdt:P576 []. }
  ?capital rdfs:label ?label .
  BIND(LANG(?label) AS ?lang)
  FILTER(?lang IN (${LANG_LIST}))
} GROUP BY ?capital ?lang`;

async function query(sparql) {
  const url = `${ENDPOINT}?format=json&query=${encodeURIComponent(sparql)}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return (await res.json()).results.bindings;
}

/** `Q…` from a Wikidata entity URI. */
const qid = (uri) => uri.replace(/^.*\/entity\//, "");

/** `<item> ⇥ <label>` per line, one file per language, rows in `order`. The name
 *  files' shape, shared with the plate and element dumps. `keyVar` is the SPARQL
 *  variable holding the item — `country` or `capital`. */
async function writeLabels(dir, rows, keyVar, order, total) {
  await mkdir(dir, { recursive: true });
  const rank = new Map(order.map((k, i) => [k, i]));
  for (const [tag, wdLang] of Object.entries(LANGS)) {
    const lines = rows
      .filter((r) => r.lang.value === wdLang)
      .map((r) => [qid(r[keyVar].value), r.name.value])
      .filter(([k]) => rank.has(k))
      .sort((a, b) => rank.get(a[0]) - rank.get(b[0]))
      .map(([k, name]) => `${k}\t${name}`);
    await writeFile(join(dir, `${tag}.txt`), lines.join("\n") + "\n", "utf8");
    console.log(`  ${tag.padEnd(8)} ${String(lines.length).padStart(3)} of ${total}`);
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });

  // --- Structure, and the country order everything else follows ---------------
  const structure = await query(STRUCTURE);
  // Descending by population, so the file already reads in tier order and the
  // build cuts thresholds down a sorted list. Missing population sorts last.
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

  // --- Names ------------------------------------------------------------------
  const order = ranked.map((c) => c.country);
  await writeLabels(OUT, await query(COUNTRY_LABELS), "country", order, ranked.length);

  // Capitals in the same country order, each country's capitals adjacent; a
  // country with two contributes both, in P36 order.
  const capitalOrder = [...new Set(ranked.flatMap((c) => c.capitals))];
  console.log(`capitals — ${capitalOrder.length}`);
  await writeLabels(join(OUT, "capitals"), await query(CAPITAL_LABELS), "capital", capitalOrder, capitalOrder.length);
}

main().catch((err) => {
  console.error("dump-country-data failed:", err.message);
  process.exit(1);
});
