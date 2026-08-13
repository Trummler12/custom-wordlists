// Writes data-raw/geography/languages/<lang>.txt from umpirsky/language-list:
// one file per language, `<code> ⇥ <name>` per line, sorted by code.
//
//   node scripts/geography/dump-language-names.mjs
//
// The source is CLDR, reshaped — the same data `Intl.DisplayNames` answers from,
// which is why the two agree without either being told about the other. The app
// asks the platform (a tooltip needs a language name before any topic has
// loaded); the list asks this, because a topic is data and has to sit in a file.
//
// One file per locale rather than one big table: the same shape the Pokémon dumps
// use, and a locale we drop later leaves no hole in the ones we keep.
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const BASE = "https://raw.githubusercontent.com/umpirsky/language-list/master/data";

/** Our tag → the source's folder. They differ only in the separator, but writing
 *  it out is what stops `zh-Hans` being guessed at. */
const LOCALES = {
  // The two the interface speaks, then the rest of the language roadmap — every
  // language skribbl itself supports — so the list needs no second pass the day
  // one of them earns a dictionary. Chinese is here for the lists, not the
  // roadmap: it is a content language because Pokémon has one.
  en: "en",
  de: "de",
  es: "es",
  fr: "fr",
  it: "it",
  ja: "ja",
  ko: "ko",
  "zh-Hans": "zh_Hans",
  "zh-Hant": "zh_Hant",
  bg: "bg",
  cs: "cs",
  da: "da",
  el: "el",
  et: "et",
  fi: "fi",
  he: "he",
  hu: "hu",
  lv: "lv",
  mk: "mk",
  nb: "nb",
  nl: "nl",
  pl: "pl",
  pt: "pt",
  ro: "ro",
  ru: "ru",
  sk: "sk",
  sr: "sr",
  sv: "sv",
  tl: "tl",
  tr: "tr",
  // No es_419: the source has no Latin American Spanish for language names.
};

async function names(dir) {
  const res = await fetch(`${BASE}/${dir}/language.json`);
  if (!res.ok) throw new Error(`${dir}: HTTP ${res.status}`);
  return res.json();
}

async function main() {
  const out = join(ROOT, "data-raw", "geography", "languages");
  await mkdir(out, { recursive: true });

  for (const [tag, dir] of Object.entries(LOCALES)) {
    const rows = Object.entries(await names(dir)).sort(([a], [b]) => (a < b ? -1 : 1));
    const text = rows.map(([code, name]) => `${code}\t${name}`).join("\n") + "\n";
    await writeFile(join(out, `${tag}.txt`), text, "utf8");
    console.log(`${tag.padEnd(9)} ${String(rows.length).padStart(5)} languages`);
  }
}

main().catch((err) => {
  console.error("dump-language-names failed:", err.message);
  process.exit(1);
});
