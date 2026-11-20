// Fills data/topics/science/chemistry/elements.json with the names that
// scripts/science/dump-element-names.mjs writes, and writes the elements' language
// coverage page data (data/coverage/elements.json).
//
//   node scripts/science/build-elements.mjs [--write]
//
// ONLY THE NAMES. Tier membership and the order within a tier are editorial —
// they answer "what can a player draw of this?", which no source knows — so this
// script never touches either. It walks the entries where they are and swaps each
// one for a language map, which is what makes re-running it safe after the tiers
// have been argued over again.
//
// THE JOIN IS THE ENGLISH NAME, as everywhere else in this repo: an entry's `en`
// form is its identity. That works here without a single exception — the 118
// Wikidata labels and the 118 names in the file match one for one, IUPAC
// spellings and all (aluminium, caesium, sulfur). The English name leads to the
// atomic number, and the number to every other language.
//
// ENGLISH IS NOT REWRITTEN. Wikidata lower-cases its English labels by house
// rule, and the list has always carried them capitalized. Since `en` is the join
// key it is also the one column the source cannot improve on, so it is left
// exactly as the file has it.
//
// EVERY NAME IS CAPITALIZED. Wikidata lower-cases its labels by house rule in
// every language it holds one for, so the case it hands over says nothing about
// how a language writes the word. An entry in a word list is a name on a card
// rather than a noun in a sentence — and it is the whole card, so it is at the
// start of one either way. Capitalizing all of them is what keeps a language from
// showing `oro` beside `Argon`, which is what leaving the source's case in place
// produced. Scripts without case (Japanese, Korean, Chinese) are untouched by it.
//
// A LANGUAGE EQUAL TO ENGLISH IS DROPPED, per the schema: an absent key means
// "same as en". Compared without regard to case, for the reason above: German
// `Oganesson` matched and vanished while French `oganesson` differed by one
// letter and stayed, leaving one word stored three different ways.
//
// EACH LANGUAGE READS DOWN ITS FALLBACK CHAIN (LANG_SRC in scripts/lib/wikidata.mjs):
// Norwegian from Bokmål, Portuguese from its Brazilian label, and so on. Simplified
// Chinese ends on `zh`, which is not reliably Simplified (iron is `鐵` there, the
// Traditional form), so every name taken from it is reported rather than applied in
// silence; one where `zh` and `zh-Hant` agree is one to look at twice.
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCoverage } from "../geography/coverage.mjs";
import { serializeTopic } from "../lib/serialize.mjs";
import { LANG_SRC, NAME_LANGS, labelFor } from "../lib/wikidata.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DUMP = join(ROOT, "data-raw", "science", "elements", "element-names.json");
const TOPIC = join(ROOT, "data", "topics", "science", "chemistry", "elements.json");

/** An entry's English name — its identity, whatever shape the entry has. */
const englishOf = (entry) => (typeof entry === "string" ? entry : entry.en);

/** Whether two names are the same word. Case is not part of the answer: the app
 *  matches a guess without it, and the only case differences the source produces
 *  are its own labelling rule rather than anything a language does. */
const sameWord = (a, b) => a.toLowerCase() === b.toLowerCase();

/** A name as the list shows it. `Array.from` rather than `[0]`, so a first
 *  character outside the basic plane is taken whole instead of by half. */
function capitalize(name) {
  const [first, ...rest] = Array.from(name);
  return first === undefined ? name : first.toUpperCase() + rest.join("");
}

async function main() {
  const dump = JSON.parse(await readFile(DUMP, "utf8"));
  // The English label is the bridge from a name in the file to an element in the dump.
  const byName = new Map(
    Object.values(dump).map((el) => [(labelFor(el.names, "en") ?? "").toLowerCase(), el]),
  );

  const topic = JSON.parse(await readFile(TOPIC, "utf8"));
  // A flat topic is its own group; a grouped one still has exactly the one.
  const group = topic.groups?.[0] ?? topic;

  const missing = [];
  const gaps = [];
  const fallbacks = [];

  const enrich = (entry) => {
    const name = englishOf(entry);
    const el = byName.get(name.toLowerCase());
    if (el === undefined) {
      missing.push(name);
      return entry;
    }
    const out = { en: name };
    const unknown = [];
    for (const tag of NAME_LANGS.slice(1)) {
      // Labels can carry invisible format characters (a stray left-to-right mark before
      // helium in Simplified Chinese), which no one types and the game would not match.
      const value = labelFor(el.names, tag)?.replace(/\p{Cf}/gu, "").trim() || undefined;
      if (tag === "zh-Hans" && value && !LANG_SRC[tag].slice(0, -1).some((s) => el.names[s])) {
        fallbacks.push(`${name}: zh-Hans <= zh "${value}" (zh-Hant "${labelFor(el.names, "zh-Hant")}")`);
      }
      if (!value) unknown.push(tag);
      // An absent key already says "same as en" — see the schema's langMapEntry.
      else if (!sameWord(value, name)) out[tag] = capitalize(value);
    }
    if (unknown.length) {
      out["?"] = unknown;
      gaps.push(`${name}: ${unknown.join(", ")}`);
    }
    // Nothing to say beyond the English name: keep it a plain string rather than
    // a one-key map, which is the same claim written longer.
    return Object.keys(out).length === 1 ? name : out;
  };

  group.tiers = group.tiers.map((tier) => tier.map(enrich));
  topic.languages = NAME_LANGS;

  console.log(`build-elements: ${group.tiers.flat().length} entries, ${NAME_LANGS.length} languages`);
  if (fallbacks.length) console.log(`  zh fallback (${fallbacks.length}):\n    ${fallbacks.join("\n    ")}`);
  if (gaps.length) console.log(`  no name at all (${gaps.length}):\n    ${gaps.join("\n    ")}`);
  if (missing.length) {
    console.error(`  NOT IN THE DUMPS (${missing.length}): ${missing.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  // Only the names are this script's; the tiers stay editorial.
  Object.assign(topic, {
    generated: ["names"],
    dataOrigin: "Wikidata",
    filePaths: {
      "scripts/science/": ["dump-element-names.mjs", "build-elements.mjs"],
      "data-raw/science/": "elements/",
    },
  });

  // The coverage page lists every element the dump holds, by atomic number.
  // Its first column capitalized like the list, not in the source's lower case.
  const listed = Object.fromEntries(Object.entries(dump).map(([q, el]) => [q, { ...el, name: capitalize(el.name) }]));
  await writeCoverage(ROOT, "elements", listed, NAME_LANGS, LANG_SRC, "atomicNumber", process.argv.includes("--write"));

  if (process.argv.includes("--write")) {
    await writeFile(TOPIC, serializeTopic(topic), "utf8");
    console.log(`  written → ${TOPIC}`);
  } else {
    console.log("  dry run — pass --write to save");
  }
}

main().catch((err) => {
  console.error("build-elements failed:", err.message);
  process.exit(1);
});
