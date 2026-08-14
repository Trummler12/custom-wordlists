// Fills in `ja-Latn` on a flat Pokémon list by transliterating its Japanese names.
//
//   node scripts/pokemon/romanize-names.mjs <items|moves> [--write]
//
// PokéAPI has romaji for the Pokémon themselves and for nothing else, so the
// romaji switch left the items and the moves in kana. Their Japanese names hold
// no kanji at all — 0 of 2115 and 0 of 919 — so the reading is derivable from the
// characters, which is the whole reason this can be a script rather than a
// translation job. See scripts/lib/kana.mjs for the style and its limits.
//
// Written wherever the transliteration differs from the ENGLISH name, since that
// is what an absent key means. It rarely doesn't: すごいキズぐすり is Sugoikizugusuri
// and the item is Hyper Potion.
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serializeTopic } from "../lib/serialize.mjs";
import { toRomaji } from "../lib/kana.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LISTS = { items: "items.json", moves: "moves.json" };
const VARIANT = "ja-Latn";

/** `en` first, the rest alphabetically, `?` last — the order the files have. */
function ordered(entry) {
  const { en, "?": unknown, ...rest } = entry;
  const out = { en };
  for (const k of Object.keys(rest).sort()) out[k] = rest[k];
  if (unknown) out["?"] = unknown;
  return out;
}

async function main() {
  const list = process.argv[2];
  if (!LISTS[list]) throw new Error(`say which list: ${Object.keys(LISTS).join(" | ")}`);
  const file = join(ROOT, "data", "topics", "gaming", "pokemon", LISTS[list]);
  const topic = JSON.parse(await readFile(file, "utf8"));

  let written = 0;
  let sameAsEnglish = 0;
  let noJapanese = 0;
  let unreadable = 0;

  for (const group of topic.groups) {
    group.words = group.words.map((entry) => {
      if (typeof entry === "string") {
        // A plain string is the same name everywhere; its Japanese is its English.
        noJapanese++;
        return entry;
      }
      const ja = entry.ja;
      if (ja === undefined) {
        noJapanese++;
        return entry;
      }
      const romaji = toRomaji(ja);
      if (romaji === undefined) {
        console.error(`  cannot read "${ja}" (${entry.en})`);
        unreadable++;
        return entry;
      }
      if (romaji === entry.en) {
        sameAsEnglish++;
        return entry;
      }
      written++;
      return ordered({ ...entry, [VARIANT]: romaji });
    });
  }

  topic.languages = [...new Set([...(topic.languages ?? []), VARIANT])].sort();

  console.log(`${list}: ${written} romanized`);
  console.log(`  ${sameAsEnglish} read the same as their English name — an absent key says that`);
  console.log(`  ${noJapanese} have no Japanese name to romanize`);
  if (unreadable) console.log(`  ${unreadable} could not be read`);

  if (process.argv.includes("--write")) {
    await writeFile(file, serializeTopic(topic), "utf8");
    console.log("written");
  } else {
    console.log("dry run — pass --write to save");
  }
}

main().catch((err) => {
  console.error("romanize-names failed:", err.message);
  process.exit(1);
});
