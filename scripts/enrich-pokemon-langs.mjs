// One-shot codemod: enriches each `generation-<n>.json` (today de/en only) with
// every non-duplicate PokéAPI language under `data-raw/gaming/pokemon/pokemon/
// gen-<n>/`. Names come straight from those verbatim dumps; a language key is added
// to an entry only where it differs from English — `en` is the base, so identical
// names fall back and stay a plain string. Idempotent: rebuilds each entry from the
// txt files on every run. See _untracked/PR/28-list-expansion.md.
//
// Dropped as pure duplicates (byte-identical across all 9 gens): `es-419` (== es)
// and `ja-hrkt` (== ja). PokéAPI's lowercase variant keys are normalized to BCP-47
// (`ja-roma` → ja-Latn, `zh-hans/hant` → zh-Hans/zh-Hant). Four known-broken Chinese
// entries are corrected here (see CHINESE_FIXES) rather than in the raw dump, which
// stays verbatim per its own README ("normalize before using in production").
//
// Run once: `node scripts/enrich-pokemon-langs.mjs`.
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serializeTopic } from "./lib/serialize.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data-raw", "gaming", "pokemon", "pokemon");
const TOPICS = join(ROOT, "data", "topics", "gaming", "pokemon", "pokemon");

// Source filename → output language key. Order = entry-map key order (en first, the
// base, then the rest); `languages` is derived from this and sorted separately.
const LANGS = [
  { file: "en", key: "en" },
  { file: "de", key: "de" },
  { file: "es", key: "es" },
  { file: "fr", key: "fr" },
  { file: "it", key: "it" },
  { file: "ja", key: "ja" },
  { file: "ja-roma", key: "ja-Latn" },
  { file: "ko", key: "ko" },
  { file: "zh-hans", key: "zh-Hans" },
  { file: "zh-hant", key: "zh-Hant" },
];

// PokéAPI returns these four with mixed or swapped Han scripts; corrected by hand
// (each Hans uses only simplified forms, each Hant only traditional). National-Dex →
// { key: name }. #1022/#1023: the two files are effectively swapped; #474/#973: the
// Simplified value carries a stray Traditional character.
const CHINESE_FIXES = {
  474: { "zh-Hans": "多边兽Ｚ", "zh-Hant": "多邊獸Ｚ" }, // Porygon-Z
  973: { "zh-Hans": "缠红鹤", "zh-Hant": "纏紅鶴" }, // Flamigo
  1022: { "zh-Hans": "铁磐岩", "zh-Hant": "鐵磐岩" }, // Iron Boulder
  1023: { "zh-Hans": "铁头壳", "zh-Hant": "鐵頭殼" }, // Iron Crown
};

const PROVENANCE = "Names: https://pokeapi.co";

// ─── parsing ───────────────────────────────────────────────────────────────────

/** `<dex>\t<name>` lines → Map(dex → name); CRLF and blank lines tolerated. */
function parseNames(text) {
  const map = new Map();
  for (const line of text.replace(/\r/g, "").split("\n")) {
    if (!line) continue;
    const tab = line.indexOf("\t");
    map.set(line.slice(0, tab), line.slice(tab + 1));
  }
  return map;
}

/** Build one entry: a plain string when every language equals en, else a language
 *  map { en, … } holding only the languages that differ from en. */
function buildEntry(names) {
  const en = names.en;
  const map = { en };
  for (const { key } of LANGS) {
    if (key === "en") continue;
    const v = names[key];
    if (v !== undefined && v !== en) map[key] = v;
  }
  return Object.keys(map).length === 1 ? en : map;
}

// The house-style serializer lives in scripts/lib/serialize.mjs — shared, so a
// codemod can't quietly write a file back without the fields it didn't know.

/** Order-independent canonical JSON (keys sorted recursively) for equality checks. */
function canon(v) {
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  if (v && typeof v === "object") {
    return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
  }
  return JSON.stringify(v);
}

// ─── driver ──────────────────────────────────────────────────────────────────────

async function processGen(n) {
  const genDir = join(RAW, `gen-${n}`);
  const files = {};
  for (const { file, key } of LANGS) files[key] = parseNames(await readFile(join(genDir, `${file}.txt`), "utf8"));

  const topicPath = join(TOPICS, `generation-${n}.json`);
  const topic = JSON.parse(await readFile(topicPath, "utf8"));
  if (topic.groups.length !== 1) throw new Error(`gen-${n}: expected exactly one group`);
  const group = topic.groups[0];

  const dexOrder = [...files.en.keys()];
  if (group.words.length !== dexOrder.length) {
    throw new Error(`gen-${n}: entry count differs (json ${group.words.length} / en.txt ${dexOrder.length})`);
  }

  const words = dexOrder.map((dex, i) => {
    const cur = group.words[i];
    const curEn = typeof cur === "string" ? cur : cur.en;
    const curDe = typeof cur === "string" ? cur : cur.de ?? cur.en;
    // Guard: the verbatim dump must still agree with the hand-verified en/de JSON.
    if (curEn !== files.en.get(dex)) throw new Error(`gen-${n} #${dex}: en mismatch (json "${curEn}" / dump "${files.en.get(dex)}")`);
    if (curDe !== files.de.get(dex)) throw new Error(`gen-${n} #${dex}: de mismatch (json "${curDe}" / dump "${files.de.get(dex)}")`);

    const names = {};
    for (const { key } of LANGS) names[key] = files[key].get(dex);
    Object.assign(names, CHINESE_FIXES[dex]); // no-op when undefined
    return buildEntry(names);
  });

  group.words = words;
  topic.languages = [...new Set(LANGS.map((l) => l.key))].sort();
  if (!topic.sources) topic.sources = PROVENANCE;

  const text = serializeTopic(topic);
  // Round-trip guard, key-order-independent (we mutate `topic` in place, so its key
  // order differs from the serializer's fixed order — only the content must match).
  if (canon(JSON.parse(text)) !== canon(topic)) {
    throw new Error(`gen-${n}: serializer produced non-equivalent JSON`);
  }
  await writeFile(topicPath, text, "utf8");

  const enriched = words.filter((w) => typeof w === "object").length;
  console.log(`gen-${n}: ${words.length} entries, ${enriched} carry a language map`);
}

async function main() {
  for (let n = 1; n <= 9; n++) await processGen(n);
  console.log("enrich-pokemon-langs: done");
}

main().catch((err) => {
  console.error("enrich-pokemon-langs failed:", err.message);
  process.exit(1);
});
