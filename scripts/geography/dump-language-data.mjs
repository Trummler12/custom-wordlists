// Writes data-raw/geography/languages/ — the raw material for the Languages topic,
// harvested from Wikidata.
//
//   node scripts/geography/dump-language-data.mjs
//
// Membership is NATURAL languages (P31/P279* Q33742) — ~1337, conlangs excluded by
// definition. Not `human language` (Q20162172, 9427) or `modern language` (Q1288568,
// 7113): both sweep in far too much for a word list. See the overlap research in
// scripts/test/Wikidata_Language_*.
//
// language-structure.tsv carries the numbers and flags — the ISO code, the speaker
// count that tiers the list, and the four linguistic-type booleans the build folds
// into its type matrix — split from the names so a new speaker estimate is a one-line
// diff. code is ISO 639: P218 (639-1) => P219 (639-2) => P220 (639-3), first present;
// empty when Wikidata has none, and the build fills it from the English name.
//
// language-names.json is the faithful raw picture, keyed by Q-id: every term Wikidata
// carries — rdfs:label (pref), skos:altLabel (alias), P1448 (official), P1813 (short) —
// in every language skribbl supports. Nothing is filtered here on purpose (build's job).
//
// The query/dumpNames/NAMES/SKRIBBL machinery mirrors dump-country-data.mjs verbatim;
// the code-review pass (Z) is to extract the shared half into one module.
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "data-raw", "geography", "languages");
const ENDPOINT = "https://query.wikidata.org/sparql";
const UA = { "User-Agent": "custom-wordlists/1.0 (https://github.com/Trummler12/custom-wordlists)" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** The linguistic-type classes the matrix reads, each tested with P31/P279* so a
 *  subclass (a specific dead language) counts. Natural (Q33742) is the membership
 *  itself, so every row has it; the four below are the flags that place a row. */
const TYPE = {
  dead: "Q45762",
  extinct: "Q38058796",
  historical: "Q2315359",
  artificial: "Q3247505",
};

/** One row per natural language: its ISO code (639-1 => 639-2 => 639-3), speaker
 *  count, and the four type flags. MIN/MAX rather than SAMPLE so a re-dump is a
 *  stable diff (a language with two speaker figures keeps the larger, the fuller
 *  claim; two codes at one level keep the alphabetically-first). The EXISTS flags
 *  are constant per language, so grouping by them collapses nothing. */
const STRUCTURE = `SELECT ?lang
  (MIN(?p218) AS ?iso1) (MIN(?p219) AS ?iso2) (MIN(?p220) AS ?iso3)
  (MAX(?spk) AS ?speakers)
  ?dead ?extinct ?historical ?artificial WHERE {
  ?lang wdt:P31/wdt:P279* wd:Q33742 .
  OPTIONAL { ?lang wdt:P218 ?p218. }
  OPTIONAL { ?lang wdt:P219 ?p219. }
  OPTIONAL { ?lang wdt:P220 ?p220. }
  OPTIONAL { ?lang wdt:P1098 ?spk. }
  BIND(EXISTS { ?lang wdt:P31/wdt:P279* wd:${TYPE.dead} } AS ?dead)
  BIND(EXISTS { ?lang wdt:P31/wdt:P279* wd:${TYPE.extinct} } AS ?extinct)
  BIND(EXISTS { ?lang wdt:P31/wdt:P279* wd:${TYPE.historical} } AS ?historical)
  BIND(EXISTS { ?lang wdt:P31/wdt:P279* wd:${TYPE.artificial} } AS ?artificial)
} GROUP BY ?lang ?dead ?extinct ?historical ?artificial`;

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
 *  limits, and fold them into `{ qid: { names: { lang: [{ name, pref?, official?, short? }] } } }`
 *  in `order`. A name seen under several flags becomes one entry carrying both. */
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

async function main() {
  await mkdir(OUT, { recursive: true });

  // --- Structure, and the language order everything else follows --------------
  const rows = await query(STRUCTURE);
  const flag = (r, k) => (r[k]?.value === "true" ? "1" : "");
  // Descending by speakers, so the file already reads in tier order and the build cuts
  // thresholds down a sorted list. No figure sorts last (a dead language's zero).
  const ranked = rows
    .map((r) => ({
      lang: qid(r.lang.value),
      code: r.iso1?.value || r.iso2?.value || r.iso3?.value || "",
      speakers: r.speakers ? Number(r.speakers.value) : null,
      dead: flag(r, "dead"),
      extinct: flag(r, "extinct"),
      historical: flag(r, "historical"),
      artificial: flag(r, "artificial"),
    }))
    .sort((a, b) => (b.speakers ?? -1) - (a.speakers ?? -1));

  const tsv = ranked.map((l) =>
    [l.lang, l.code, l.speakers ?? "", l.dead, l.extinct, l.historical, l.artificial].join("\t"),
  );
  await writeFile(
    join(OUT, "language-structure.tsv"),
    "# qid\tcode (P218/P219/P220)\tspeakers (P1098)\tdead\textinct\thistorical\tartificial\n" +
      tsv.join("\n") + "\n",
    "utf8",
  );
  console.log(`languages — ${ranked.length}`);

  // --- Names, keyed by Q-id in the same order ---------------------------------
  const order = ranked.map((l) => l.lang);
  const names = await dumpNames(order, order);
  await writeFile(join(OUT, "language-names.json"), JSON.stringify(names, null, 2) + "\n", "utf8");
}

main().catch((err) => {
  console.error("dump-language-data failed:", err.message);
  process.exit(1);
});
