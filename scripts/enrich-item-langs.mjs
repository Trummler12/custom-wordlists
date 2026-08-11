// Adds every language PokéAPI has to data/topics/gaming/pokemon/items.json, from
// the dumps scripts/dump-item-names.mjs writes. The item counterpart of
// enrich-pokemon-langs.mjs, and separate from it because the join is different:
// the generations align positionally to National Dex order, while items carry no
// id of their own and are matched by their English name.
//
//   node scripts/enrich-item-langs.mjs [--write]
//
// Three things worth knowing about the source:
//   · `ja-hrkt` is a SUPERSET of `ja` here, not the duplicate it was for the
//     Pokémon — 1327 of our items against 1282, never disagreeing where both
//     exist. Merged rather than dropped, or 45 Japanese names go missing.
//   · `es-419` genuinely differs from `es` on five items, so it is not a pure
//     duplicate either. Left out for now by decision, not by discovery — the dump
//     is committed, so adding it later costs nothing.
//   · There is no `ja-roma`, `cs` or `pt-br` for items, so no `ja-Latn` either.
//
// Duplicate names need no handling: counts and output de-duplicate rendered
// strings already, so two rows spelled the same are one word downstream.
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serializeTopic } from "./lib/serialize.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DUMPS = join(ROOT, "data-raw", "gaming", "pokemon", "items");
const TOPIC = join(ROOT, "data", "topics", "gaming", "pokemon", "items.json");

/** Dump filename → the tag stored in the data. Absent = not stored. */
const TAG = {
  de: "de",
  en: "en",
  es: "es",
  fr: "fr",
  it: "it",
  ja: "ja",
  ko: "ko",
  "zh-hans": "zh-Hans",
  "zh-hant": "zh-Hant",
  // "es-419": pending a decision; "ja-hrkt" is merged into ja below.
};

async function readDump(name) {
  const rows = new Map();
  for (const line of (await readFile(join(DUMPS, `${name}.txt`), "utf8")).trim().split(/\r?\n/)) {
    const t = line.indexOf("\t");
    rows.set(Number(line.slice(0, t)), line.slice(t + 1));
  }
  return rows;
}

async function main() {
  const names = (await readdir(DUMPS)).filter((f) => f.endsWith(".txt")).map((f) => f.slice(0, -4));
  const dump = Object.fromEntries(await Promise.all(names.map(async (n) => [n, await readDump(n)])));

  // An English name can belong to several item ids — older and newer rows, or two
  // genuinely different items. Take the id carrying the most languages, then the
  // lowest, which is the complete one in every case here.
  const idsByEn = new Map();
  for (const [id, name] of dump.en) {
    if (!idsByEn.has(name)) idsByEn.set(name, []);
    idsByEn.get(name).push(id);
  }
  const pick = (name) =>
    (idsByEn.get(name) ?? [])
      .map((id) => [id, names.filter((n) => dump[n].has(id)).length])
      .sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0];

  const topic = JSON.parse(await readFile(TOPIC, "utf8"));
  const group = topic.groups[0];
  const enOf = (e) => (typeof e === "string" ? e : e.en);
  const deOf = (e) => (typeof e === "string" ? e : e.de);

  const problems = [];
  const enriched = group.words.map((entry) => {
    const id = pick(enOf(entry));
    if (id === undefined) {
      problems.push(`no id for "${enOf(entry)}"`);
      return entry;
    }
    // The existing en/de were verified by hand long before PokéAPI was involved.
    // A bulk source may add languages; it may not quietly rewrite those two.
    const de = dump.de.get(id);
    if (de && deOf(entry) && de !== deOf(entry)) {
      problems.push(`"${enOf(entry)}": de is "${deOf(entry)}" here, "${de}" upstream`);
    }

    const out = { en: enOf(entry) };
    for (const [file, tag] of Object.entries(TAG)) {
      if (tag === "en") continue;
      // `ja` falls back to the kana spelling, which covers more of the list.
      const value = file === "ja" ? (dump.ja.get(id) ?? dump["ja-hrkt"].get(id)) : dump[file].get(id);
      if (value && value !== out.en) out[tag] = value;
    }
    // Nothing translates: a plain string, as the ★ crystals are.
    return Object.keys(out).length === 1 ? out.en : out;
  });

  if (problems.length) {
    for (const p of problems.slice(0, 10)) console.error(`  ${p}`);
    throw new Error(`${problems.length} entr(ies) disagree with the source`);
  }

  group.words = enriched;
  topic.languages = [...new Set(Object.values(TAG))].sort();
  topic.sources = [...new Set([...[topic.sources ?? []].flat(), "Names: https://pokeapi.co"])];
  if (topic.sources.length === 1) topic.sources = topic.sources[0];

  const localized = enriched.filter((e) => typeof e !== "string").length;
  console.log(`${enriched.length} entries, ${localized} carry a language map`);
  for (const tag of topic.languages) {
    const n = enriched.filter((e) => typeof e !== "string" && e[tag]).length;
    console.log(`  ${tag.padEnd(8)} ${String(tag === "en" ? enriched.length : n).padStart(5)}`);
  }

  if (process.argv.includes("--write")) {
    await writeFile(TOPIC, serializeTopic(topic), "utf8");
    console.log("written");
  } else {
    console.log("dry run — pass --write to save");
  }
}

main().catch((err) => {
  console.error("enrich-item-langs failed:", err.message);
  process.exit(1);
});
