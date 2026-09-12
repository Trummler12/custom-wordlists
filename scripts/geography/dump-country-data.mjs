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
// country-names.json / capital-names.json are the faithful raw picture, keyed by Q-id: every
// term Wikidata carries — rdfs:label (pref), skos:altLabel (alias), P1448 (official), P1813
// (short) — for every language skribbl supports (base-tag filter, so zh / zh-hans / zh-cn,
// pt / pt-br all ride in on their base). Nothing is filtered here on purpose: the build
// decides which forms count and which languages it targets, so a missing or odd tag stays
// visible in the raw file for report-name-quality.mjs to flag. Casing and the one-continent
// pick are the build's job too (build-country-data.mjs), as with the elements.
//
// CURATED TERRITORIES TOO. The matrix territories (sovereign-territories.json, keyed by Q-id)
// that are not UN sovereign states are harvested alongside, so their names come from Wikidata
// like every other. territory-structure.tsv adds each one's population and capital, the
// numbers the build needs beside the names.
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

/** The languages skribbl officially supports (plus Chinese, a content language for the
 *  lists). The query keeps any Wikidata tag whose base is one of these, so script and
 *  regional variants (zh-hans, zh-cn, pt-br, sr-latn, nb) all come along. */
const SKRIBBL = [
  "en", "de", "bg", "cs", "da", "nl", "fi", "fr", "et", "el", "he", "hu", "it", "ja", "ko",
  "lv", "mk", "nb", "nn", "no", "pt", "pl", "ro", "ru", "sr", "sk", "es", "sv", "tl", "tr", "zh",
];

/** Every term for a chunk of items in the supported languages. `pref`/`official`/`short` are
 *  the flags the bucketer reads; `alias` (skos:altLabel) rides along unflagged for the report
 *  and transparency. The language sits on each term's tag. */
const NAMES = (values) => `SELECT ?item ?lang ?term ?type WHERE {
  VALUES ?item { ${values} }
  { ?item rdfs:label ?term. BIND("pref" AS ?type) }
  UNION { ?item skos:altLabel ?term. BIND("alias" AS ?type) }
  UNION { ?item wdt:P1448 ?term. BIND("official" AS ?type) }
  UNION { ?item wdt:P1813 ?term. BIND("short" AS ?type) }
  BIND(LANG(?term) AS ?lang)
  FILTER(REGEX(?lang, "^(${SKRIBBL.join("|")})(-|$)"))
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
 *  limits, and fold them into
 *  `{ qid: { name, population?, country?, code?, names: { lang: […] } } }` in `order`. A name
 *  seen under several flags (Germany's "Deutschland" is pref and short) becomes one entry
 *  carrying both. The leading `name` (English preferred label), `population` and `country`/`code`
 *  from `meta` are a summary for the raw file's readers — the number sits by the name so it reads
 *  as the entry's own; `country` only on a capital, naming the state it belongs to. The build
 *  reads these from the structure, not here. */
async function dumpNames(qids, order, meta, chunk = 20) {
  const byItem = {};
  for (let i = 0; i < qids.length; i += chunk) {
    const values = qids.slice(i, i + chunk).map((q) => `wd:${q}`).join(" ");
    const rows = await query(NAMES(values));
    for (const r of rows) {
      const lang = r.lang?.value;
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
  // Deterministic order so a re-dump diffs only on real change, not on the order WDQS
  // happened to return terms — and their flags — in: preferred label first, then official,
  // short, plain alias, alphabetical within each, and the flag keys themselves in that same
  // fixed order. The build reads by flag regardless, so this is purely for the file's readers
  // and its diffs.
  const FLAGS = ["pref", "official", "short", "alias"];
  const rank = (t) => FLAGS.findIndex((f) => t[f]);
  const canon = (t) => ({ name: t.name, ...Object.fromEntries(FLAGS.filter((f) => t[f]).map((f) => [f, true])) });
  const out = {};
  for (const q of order) {
    const langMap = byItem[q] ?? {};
    const names = {};
    for (const lang of Object.keys(langMap).sort()) {
      names[lang] = Object.values(langMap[lang])
        .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
        .map(canon);
    }
    const name = (names.en ?? []).find((t) => t.pref)?.name;
    const m = meta?.[q] ?? {};
    out[q] = {
      ...(name ? { name } : {}),
      ...(m.population != null ? { population: m.population } : {}),
      ...(m.country ? { country: m.country } : {}),
      ...(m.code ? { code: m.code } : {}),
      names,
    };
  }
  return out;
}

/** The curated territories (sovereign-territories.json, keyed by Q-id), each with the
 *  population (P1082) and capital (P36) Wikidata carries — the numbers the build needs
 *  beside the names, so it holds no source but this and the curated cell/continent. */
async function territories() {
  const curated = JSON.parse(await readFile(join(OUT, "sovereign-territories.json"), "utf8"));
  delete curated._comment;
  const qids = Object.keys(curated);
  const rows = await query(`SELECT ?item (SAMPLE(?pop) AS ?population) (SAMPLE(?cap) AS ?capital) (MIN(?i) AS ?iso) WHERE {
    VALUES ?item { ${qids.map((q) => "wd:" + q).join(" ")} }
    OPTIONAL { ?item wdt:P1082 ?pop } OPTIONAL { ?item wdt:P36 ?cap } OPTIONAL { ?item wdt:P297 ?i }
  } GROUP BY ?item`);
  const byQid = {};
  for (const r of rows) byQid[qid(r.item.value)] = r;
  return qids.map((q) => ({
    qid: q,
    pop: byQid[q]?.population ? Number(byQid[q].population.value) : null,
    capital: byQid[q]?.capital ? qid(byQid[q].capital.value) : null,
    iso: byQid[q]?.iso?.value ?? "",
  }));
}

/** City populations (P1082) for a list of capitals, the largest where an item carries
 *  several, so a re-dump is deterministic. */
async function capitalPops(qids) {
  const out = {};
  for (let i = 0; i < qids.length; i += 100) {
    const values = qids.slice(i, i + 100).map((q) => `wd:${q}`).join(" ");
    const rows = await query(`SELECT ?c (MAX(?p) AS ?pop) WHERE { VALUES ?c { ${values} } ?c wdt:P1082 ?p. } GROUP BY ?c`);
    for (const r of rows) out[qid(r.c.value)] = Number(r.pop.value);
  }
  return out;
}

async function main() {
  await mkdir(OUT, { recursive: true });

  // --- Structure, and the country order everything else follows ---------------
  const structure = await query(STRUCTURE);
  // Descending by population, so the file already reads in tier order and the build cuts
  // thresholds down a sorted list. Missing population sorts last; ties break by Q-id, so the
  // order is deterministic — a re-dump doesn't reshuffle equal-population countries.
  const ranked = structure
    .map((r) => ({
      country: qid(r.country.value),
      iso: r.isoCode?.value ?? "",
      pop: r.population ? Number(r.population.value) : null,
      continents: r.continents?.value ? r.continents.value.split("|").map(qid) : [],
      capitals: r.capitals?.value ? r.capitals.value.split("|").map(qid) : [],
    }))
    .sort((a, b) => (b.pop ?? -1) - (a.pop ?? -1) || a.country.localeCompare(b.country));

  const tsv = ranked.map((c) =>
    [c.country, c.iso, c.pop ?? "", c.continents.join("|"), c.capitals.join("|")].join("\t"),
  );
  await writeFile(
    join(OUT, "structure.tsv"),
    "# country\tiso\tpopulation\tcontinents (P30, raw)\tcapitals (P36)\n" + tsv.join("\n") + "\n",
    "utf8",
  );
  console.log(`countries — ${ranked.length}`);

  // --- Territories: population and capital for the curated matrix entries ------
  const terr = await territories();
  await writeFile(
    join(OUT, "territory-structure.tsv"),
    "# qid\tpopulation (P1082)\tcapital (P36)\n" +
      terr.map((t) => [t.qid, t.pop ?? "", t.capital ?? ""].join("\t")).join("\n") + "\n",
    "utf8",
  );
  console.log(`territories — ${terr.length}`);

  // --- Names: sovereign states and territories share one file, keyed by Q-id ---
  // Each entry leads with its ISO code (P297) and population, from the structure above.
  const countryMeta = {};
  for (const c of ranked) countryMeta[c.country] = { code: c.iso || undefined, population: c.pop ?? undefined };
  for (const t of terr) countryMeta[t.qid] = { code: t.iso || undefined, population: t.pop ?? undefined };
  const countryOrder = [...new Set([...ranked.map((c) => c.country), ...terr.map((t) => t.qid)])];
  const countryNames = await dumpNames(countryOrder, countryOrder, countryMeta);
  await writeFile(join(OUT, "country-names.json"), JSON.stringify(countryNames, null, 2) + "\n", "utf8");

  // Capitals in the same order, each country's capitals adjacent; a country with two
  // contributes both, in P36 order. Territory capitals follow. Each leads with the country it
  // is a capital of — its English name and ISO code, so the bare code isn't a riddle — and its
  // own city population (P1082).
  const capitalOrder = [...new Set([...ranked.flatMap((c) => c.capitals), ...terr.map((t) => t.capital).filter(Boolean)])];
  console.log(`capitals — ${capitalOrder.length}`);
  const capitalCountry = {};
  for (const c of ranked) for (const cap of c.capitals) capitalCountry[cap] ??= c.country;
  for (const t of terr) if (t.capital) capitalCountry[t.capital] ??= t.qid;
  const capPop = await capitalPops(capitalOrder);
  const capitalMeta = Object.fromEntries(
    capitalOrder.map((cap) => {
      const cq = capitalCountry[cap];
      return [cap, { country: countryNames[cq]?.name, code: countryMeta[cq]?.code, population: capPop[cap] ?? undefined }];
    }),
  );
  const capitalNames = await dumpNames(capitalOrder, capitalOrder, capitalMeta);
  await writeFile(join(OUT, "capital-names.json"), JSON.stringify(capitalNames, null, 2) + "\n", "utf8");
}

main().catch((err) => {
  console.error("dump-country-data failed:", err.message);
  process.exit(1);
});
