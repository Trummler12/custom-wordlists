// Fills data/topics/science/chemistry/elements.json with the names that
// scripts/science/dump-element-names.mjs writes.
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
// spellings and all (aluminium, caesium, sulfur).
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
// SIMPLIFIED CHINESE FALLS BACK TO `zh`. Eight elements have no `zh-hans` label
// and do have a `zh` one. `zh` is not reliably Simplified — iron is `鐵` there,
// the Traditional form — so the fallback is reported per element rather than
// applied in silence, and a name where `zh` and `zh-Hant` agree is one to look at
// twice. For these eight they disagree except for xenon, whose `氙` is the same
// character in both scripts.
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serializeTopic } from "../lib/serialize.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DUMPS = join(ROOT, "data-raw", "science", "elements");
const TOPIC = join(ROOT, "data", "topics", "science", "chemistry", "elements.json");

/** The languages that end up in the file, in the order they are written. `zh` is
 *  not among them: it exists only as Simplified Chinese's fallback. */
const LANGS = ["en", "de", "es", "fr", "it", "ja", "ko", "zh-Hans", "zh-Hant"];

/** One dump: atomic number → name. */
async function readDump(tag) {
  const text = await readFile(join(DUMPS, `${tag}.txt`), "utf8");
  const out = new Map();
  for (const line of text.split("\n")) {
    const [z, name] = line.split("\t");
    if (name) out.set(Number(z), name.trim());
  }
  return out;
}

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
  const files = (await readdir(DUMPS)).filter((f) => f.endsWith(".txt"));
  const dumps = new Map();
  for (const f of files) dumps.set(f.slice(0, -4), await readDump(f.slice(0, -4)));

  // English is the bridge from a name in the file to an atomic number in the
  // dumps, so it is the one dump this cannot run without.
  const en = dumps.get("en");
  if (!en) throw new Error("no en.txt — run dump-element-names.mjs first");
  const zByName = new Map([...en].map(([z, name]) => [name.toLowerCase(), z]));

  const topic = JSON.parse(await readFile(TOPIC, "utf8"));
  const group = topic.groups[0];

  const missing = [];
  const gaps = [];
  const fallbacks = [];

  const enrich = (entry) => {
    const name = englishOf(entry);
    const z = zByName.get(name.toLowerCase());
    if (z === undefined) {
      missing.push(name);
      return entry;
    }
    const out = { en: name };
    const unknown = [];
    for (const tag of LANGS.slice(1)) {
      let value = dumps.get(tag)?.get(z);
      if (!value && tag === "zh-Hans") {
        value = dumps.get("zh")?.get(z);
        if (value) fallbacks.push(`${name}: zh-Hans ← zh "${value}" (zh-Hant "${dumps.get("zh-Hant")?.get(z)}")`);
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
  topic.languages = LANGS;

  console.log(`build-elements: ${group.tiers.flat().length} entries, ${LANGS.length} languages`);
  if (fallbacks.length) console.log(`  zh fallback (${fallbacks.length}):\n    ${fallbacks.join("\n    ")}`);
  if (gaps.length) console.log(`  no name at all (${gaps.length}):\n    ${gaps.join("\n    ")}`);
  if (missing.length) {
    console.error(`  NOT IN THE DUMPS (${missing.length}): ${missing.join(", ")}`);
    process.exitCode = 1;
    return;
  }

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
