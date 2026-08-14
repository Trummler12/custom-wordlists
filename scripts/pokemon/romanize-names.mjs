// Fills in `ja-Latn` on a flat Pokémon list by transliterating its Japanese names.
//
//   node scripts/pokemon/romanize-names.mjs <items|moves|path/to/topic.json> --check
//   node scripts/pokemon/romanize-names.mjs <…> --write   (bake the readings in)
//   node scripts/pokemon/romanize-names.mjs <…> --strip   (take them out again)
//
// The app transliterates at render time, so a list needs none of this stored —
// `--write` and `--strip` are the way back and forth, kept because the choice
// between deriving and storing is one we may want to revisit per list.
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
// Node reads the .ts directly, so the app and this script share one table.
import { toRomaji, isTransliterable } from "../../src/lib/kana.ts";

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

/** Every entry of a topic, tiers flattened. */
function allEntries(topic) {
  return topic.groups.flatMap((g) => [...(g.words ?? []), ...(g.tiers ?? []).flat()]);
}

/** What a list would cost to romanize, without writing anything: the names this
 *  cannot read, and the characters that stopped it, most common first.
 *
 *  A list of kanji compounds reports every one of its names — which is the answer
 *  "this list is not transliterable", not a list of characters to go and add.
 *  Kanji readings are not per-character: 語 is `go` in 中国語 and `kotoba` alone,
 *  and 手紙 is `tegami` rather than `tekami`. A table would produce confident
 *  wrong readings with nothing to catch them. */
function check(topic) {
  const entries = allEntries(topic).filter((e) => typeof e !== "string" && e.ja);
  const bad = entries.filter((e) => !isTransliterable(e.ja));
  const chars = new Map();
  for (const e of bad) {
    for (const c of e.ja) {
      if (isTransliterable(c)) continue;
      chars.set(c, (chars.get(c) ?? 0) + 1);
    }
  }
  console.log(`${entries.length} Japanese names, ${bad.length} unreadable`);
  if (bad.length) {
    console.log("  e.g. " + bad.slice(0, 5).map((e) => `${e.ja} (${e.en})`).join(", "));
    const top = [...chars].sort((a, b) => b[1] - a[1]);
    console.log(`  ${chars.size} character(s) it cannot read: ` +
      top.slice(0, 20).map(([c, n]) => `${c}×${n}`).join(" "));
  }
}

async function main() {
  const list = process.argv[2] ?? "";
  const file = list.endsWith(".json")
    ? join(ROOT, list)
    : join(ROOT, "data", "topics", "gaming", "pokemon", LISTS[list] ?? "");
  if (!list || (!LISTS[list] && !list.endsWith(".json"))) {
    throw new Error(`say which list: ${Object.keys(LISTS).join(" | ")}, or a path to a topic file`);
  }
  const topic = JSON.parse(await readFile(file, "utf8"));

  if (process.argv.includes("--check")) {
    check(topic);
    return;
  }

  if (process.argv.includes("--strip")) {
    let removed = 0;
    for (const group of topic.groups) {
      const strip = (e) => {
        if (typeof e === "string" || e[VARIANT] === undefined) return e;
        removed++;
        const { [VARIANT]: _gone, ...rest } = e;
        return rest;
      };
      if (group.words) group.words = group.words.map(strip);
      if (group.tiers) group.tiers = group.tiers.map((t) => t.map(strip));
    }
    console.log(`${removed} ${VARIANT} key(s) removed`);
    if (process.argv.includes("--write")) await writeFile(file, serializeTopic(topic), "utf8");
    console.log(process.argv.includes("--write") ? "written" : "dry run — add --write to save");
    return;
  }

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
