// Builds data/topics/geography/human/languages.json from the dumps that
// scripts/geography/dump-language-names.mjs writes.
//
// That covers the thirty name files and not the speaker table beside them:
// Speakers.txt has no generator and was pasted by hand from the source the topic
// records under `sources`. Nothing is wrong with that — data-raw/README.md allows
// a snapshot — but it is worth knowing before hunting for the script that made it.
//
//   node scripts/geography/build-languages.mjs [--write]
//
// Generated rather than pasted, for the same reason the Pokémon lists are: 600-odd
// names in nine languages is not something a person can keep aligned by hand, and
// a regenerated file is one that can be checked against its source.
//
// WHICH LANGUAGES MAKE THE LIST. All 609 the source carries would be a word list
// where most entries are unguessable — Aceh, Adangme, Afrihili. The cut is ISO
// 639-1 membership: a language with a two-letter code was, at some point, judged
// major enough to deserve one, which is the closest thing to an objective measure
// of prominence available without speaker counts. It leaves 184.
//
// FAME TIERS come from speaker counts, on absolute thresholds rather than by
// splitting the list into fixed shares. A boundary at 150 million means the same
// thing whatever else is in the list, which is what lets the tiers be argued with
// — and the 14 languages the table has no figure for (Latin, Avestan, Manx and
// other codes nobody speaks) fall to the last tier, which is where a count of
// zero belongs.
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serializeTopic } from "../lib/serialize.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DUMPS = join(ROOT, "data-raw", "geography", "languages");
const TOPIC = join(ROOT, "data", "topics", "geography", "human", "languages.json");

/** A two-letter code is ISO 639-1; three letters is 639-2/3, which is where the
 *  long tail lives. */
const ISO_639_1 = /^[a-z]{2}$/;

/** A dump file, as opposed to anything else that lives in the folder. */
const DUMP_TAG = /^[a-z]{2}(-[A-Z][a-z]{3})?$/;

/** Declared without a dump behind it. The romaji are transliterated at render time
 *  from the Japanese column, so no file here names them — but the app gates the
 *  romaji switch on the declaration, so the list has to say it carries the tag with
 *  nothing stored under it. Rebuilding without this line turns the switch off. */
const DERIVED = "ja-Latn";

/** Speakers worldwide, in millions, for the boundary between one tier and the
 *  next. Round numbers on purpose: they are a claim someone can disagree with,
 *  which a percentile split of whatever happens to be in the list is not. */
const TIERS = [150e6, 60e6, 25e6, 8e6, 2e6, 0];

/** One boundary per tier, index-aligned to `TIERS`. Number bands, in the same
 *  house style as the country lists (nine UI languages, CJK counting in 億/万);
 *  the noun ("speakers") lives in the tooltip, so these stay pure quantities. */
const TIER_CONDITIONS = [
  {"en":"150 million or more","de":"150 Millionen und mehr","es":"150 millones o más","fr":"150 millions ou plus","it":"150 milioni o più","ja":"1億5000万以上","ko":"1억 5000만 이상","zh-Hans":"1.5亿及以上","zh-Hant":"1.5億及以上"},
  {"en":"60 million or more","de":"60 Millionen und mehr","es":"60 millones o más","fr":"60 millions ou plus","it":"60 milioni o più","ja":"6000万以上","ko":"6000만 이상","zh-Hans":"6000万及以上","zh-Hant":"6000萬及以上"},
  {"en":"25 million or more","de":"25 Millionen und mehr","es":"25 millones o más","fr":"25 millions ou plus","it":"25 milioni o più","ja":"2500万以上","ko":"2500만 이상","zh-Hans":"2500万及以上","zh-Hant":"2500萬及以上"},
  {"en":"8 million or more","de":"8 Millionen und mehr","es":"8 millones o más","fr":"8 millions ou plus","it":"8 milioni o più","ja":"800万以上","ko":"800만 이상","zh-Hans":"800万及以上","zh-Hant":"800萬及以上"},
  {"en":"2 million or more","de":"2 Millionen und mehr","es":"2 millones o más","fr":"2 millions ou plus","it":"2 milioni o più","ja":"200万以上","ko":"200만 이상","zh-Hans":"200万及以上","zh-Hant":"200萬及以上"},
  {"en":"more than 0","de":"mehr als 0","es":"más de 0","fr":"plus de 0","it":"più di 0","ja":"0より多い","ko":"0보다 많음","zh-Hans":"多于0","zh-Hant":"多於0"},
];

/** The ruler's hover. `{condition}` is filled with the band above; at rest it
 *  names what the list is sorted by. Seven UI languages — the two Chinese UIs
 *  fall back to English, as everywhere prose is authored here. */
const RULER_TOOLTIP = {
  text: {
    en: "Languages with {condition} speakers worldwide",
    de: "Sprachen mit {condition} Sprechern weltweit",
    es: "idiomas con {condition} hablantes en el mundo",
    fr: "langues comptant {condition} locuteurs dans le monde",
    it: "lingue con {condition} parlanti nel mondo",
    ja: "世界の話者数が{condition}の言語",
    ko: "전 세계 사용자 수가 {condition}인 언어",
  },
  empty: {
    en: "Ranked by speakers worldwide.",
    de: "Nach Sprecherzahl weltweit geordnet.",
    es: "Ordenados por número de hablantes en el mundo.",
    fr: "Classées par nombre de locuteurs dans le monde.",
    it: "Ordinate per numero di parlanti nel mondo.",
    ja: "世界の話者数順。",
    ko: "전 세계 사용자 수 기준 정렬.",
  },
};

/** `Name ⇥ … ⇥ <iso2> ⇥ <iso3> ⇥ <speakers>`, with the countries a language is
 *  spoken in on their own lines between the rows. Read by shape rather than by
 *  column: the header shifts by one on the first row, and a table pasted out of a
 *  browser has no promises to keep. */
async function readSpeakers() {
  const text = await readFile(join(DUMPS, "Speakers.txt"), "utf8");
  const out = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line.includes("\t")) continue;
    const fields = line.split("\t").map((f) => f.trim());
    const at = fields.findIndex((f) => ISO_639_1.test(f));
    if (at === -1) continue;
    const n = fields.slice(at + 1).find((f) => /^\d+$/.test(f));
    if (n) out.set(fields[at], Number(n));
  }
  return out;
}

async function readDump(tag) {
  const rows = new Map();
  for (const line of (await readFile(join(DUMPS, `${tag}.txt`), "utf8")).trim().split(/\r?\n/)) {
    const t = line.indexOf("\t");
    rows.set(line.slice(0, t), line.slice(t + 1));
  }
  return rows;
}

async function main() {
  const tags = (await readdir(DUMPS))
    .filter((f) => f.endsWith(".txt"))
    .map((f) => f.slice(0, -4))
    .filter((t) => DUMP_TAG.test(t));
  const speakers = await readSpeakers();
  const dump = Object.fromEntries(await Promise.all(tags.map(async (t) => [t, await readDump(t)])));

  const codes = [...dump.en.keys()].filter((c) => ISO_639_1.test(c));
  // Most spoken first, and alphabetically among the ones no figure covers — they
  // share a tier anyway, so the only order left to give them is a readable one.
  codes.sort(
    (a, b) =>
      (speakers.get(b) ?? 0) - (speakers.get(a) ?? 0) ||
      dump.en.get(a).localeCompare(dump.en.get(b), "en"),
  );

  const entryOf = (code) => {
    const en = dump.en.get(code);
    const entry = { en };
    for (const tag of tags) {
      if (tag === "en") continue;
      const name = dump[tag].get(code);
      // An absent key means "the same as English", which here is often true —
      // Zulu is Zulu in a good many of the thirty.
      if (name !== undefined && name !== en) entry[tag] = name;
    }
    return Object.keys(entry).length === 1 ? en : entry;
  };

  const tiers = TIERS.map((floor, i) =>
    codes
      .filter((c) => {
        const n = speakers.get(c) ?? 0;
        return n >= floor && (i === 0 || n < TIERS[i - 1]);
      })
      .map(entryOf),
  );
  const words = tiers.flat();

  const topic = {
    id: "languages",
    title: {
      en: "Languages",
      de: "Sprachen",
      es: "Idiomas",
      fr: "Langues",
      it: "Lingue",
      ja: "言語",
      ko: "언어",
    },
    icon: "🗣️",
    description:
      "The world's languages, each named in thirty of them. Fame tiers by speakers worldwide.",
    languages: [...tags, DERIVED].sort(),
    generatedRomaji: true,
    sources: [
      "Names: https://github.com/umpirsky/language-list (CLDR)",
      "Speakers: https://www.languagecourse.net/languages-worldwide",
    ],
    tiers,
    tierConditions: TIER_CONDITIONS,
    rulerTooltip: RULER_TOOLTIP,
  };

  const localized = words.filter((w) => typeof w !== "string").length;
  console.log(`${words.length} of ${dump.en.size} languages kept (ISO 639-1 only)`);
  console.log(`tiers: ${tiers.map((t) => t.length).join(" / ")}`);
  console.log(`${codes.filter((c) => !speakers.has(c)).length} have no speaker figure`);
  console.log(`${localized} carry a language map; ${words.length - localized} read the same in all`);
  // One row per dump rather than per declared language: `ja-Latn` is declared and
  // stored nowhere, so it would report zero and read like a failed import.
  for (const tag of tags.slice().sort()) {
    const n = words.filter((w) => typeof w !== "string" && w[tag]).length;
    console.log(`  ${tag.padEnd(8)} ${String(tag === "en" ? words.length : n).padStart(5)}`);
  }

  if (process.argv.includes("--write")) {
    await writeFile(TOPIC, serializeTopic(topic), "utf8");
    console.log("written");
  } else {
    console.log("dry run — pass --write to save");
  }
}

main().catch((err) => {
  console.error("build-languages failed:", err.message);
  process.exit(1);
});
