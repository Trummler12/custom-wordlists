// Writes data-raw/science/elements/<lang>.txt from Wikidata: one file per
// language, `<atomic number> ⇥ <name>` per line, sorted by atomic number.
//
//   node scripts/science/dump-element-names.mjs
//
// WHICH ITEMS. `wdt:P31 wd:Q11344` (chemical element) matches 174 items, because
// the class also holds the hypothetical ones past oganesson. Bounding the atomic
// number to 1…118 is the whole disambiguation: it leaves exactly 118 items, one
// per number, no gaps and no collisions.
//
// Not `Q6102450` — that is the *list article*, whose hundred-odd sitelinks point
// at Wikipedia pages rather than at element names.
//
// WHY A DUMP AND NOT A DIRECT BUILD. Same reason as the language list: a file on
// disk is what makes a later re-import reviewable as a diff, and the app never
// reads any of data-raw/ anyway. See data-raw/README.md.
//
// CASE IS THE SOURCE'S. Wikidata writes English labels in lower case as a house
// rule ("hydrogen"), which is a labelling convention rather than English
// orthography — but the dump is a snapshot, so it keeps what it was given and the
// build script decides. Every other language is written the way that language
// writes a noun, which is what the curated lists carry too: `Deutsch` and
// `alemán` sit side by side in geography/human/languages.json for the same reason.
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "data-raw", "science", "elements");
const ENDPOINT = "https://query.wikidata.org/sparql";

/** Wikidata answers `LANG()` in lower case, so `zh-Hans` arrives as `zh-hans`.
 *  The file names use our spelling; this maps between them.
 *
 *  `zh` is here although the app has no such content language: eight elements
 *  carry no `zh-hans` label and do carry a `zh` one, and the build script needs
 *  the column to fall back to. Kept a column of its own rather than merged here,
 *  so the fallback is a decision someone can see rather than one this file made
 *  quietly. */
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
  zh: "zh",
};

const QUERY = `SELECT ?z ?lang (SAMPLE(?label) AS ?name) WHERE {
  ?element wdt:P31 wd:Q11344 ; wdt:P1086 ?z ; rdfs:label ?label .
  FILTER(?z >= 1 && ?z <= 118)
  BIND(LANG(?label) AS ?lang)
  FILTER(?lang IN (${Object.values(LANGS).map((l) => `"${l}"`).join(", ")}))
} GROUP BY ?z ?lang`;

async function query() {
  const url = `${ENDPOINT}?format=json&query=${encodeURIComponent(QUERY)}`;
  // Wikidata asks every client to identify itself and throttles the ones that
  // don't; a script that runs once a year is no reason to be one of them.
  const res = await fetch(url, {
    headers: { "User-Agent": "custom-wordlists/1.0 (https://github.com/Trummler12/custom-wordlists)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return (await res.json()).results.bindings;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const rows = await query();

  for (const [tag, wdLang] of Object.entries(LANGS)) {
    const named = rows
      .filter((r) => r.lang.value === wdLang)
      .map((r) => [Number(r.z.value), r.name.value])
      .sort((a, b) => a[0] - b[0]);
    const text = named.map(([z, name]) => `${z}\t${name}`).join("\n") + "\n";
    await writeFile(join(OUT, `${tag}.txt`), text, "utf8");
    console.log(`${tag.padEnd(8)} ${String(named.length).padStart(3)} of 118 elements`);
  }
}

main().catch((err) => {
  console.error("dump-element-names failed:", err.message);
  process.exit(1);
});
