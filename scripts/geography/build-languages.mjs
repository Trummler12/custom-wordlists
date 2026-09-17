// Builds data/topics/geography/human/languages.json from the Wikidata dump
// (dump-language-data.mjs => language-structure.tsv + language-names.json).
//
//   node scripts/geography/build-languages.mjs [--write]
//
// THE DEFAULT LIST IS THE LIVING, SINGLE, NATURAL LANGUAGES. Everything the dump carries
// goes into the fame tiers, but every language that carries a Wikidata TYPE — dead, extinct,
// historical, dialect, dialect group, language group, language family, constructed, fictional
// (see TYPES) — is hidden by default, one opt-in checkbox each. What is left, a living modern
// language that is none of those, is the base: some 1600 of the 2000, about 300 at a million
// speakers or more. The reader includes a type by ticking it (the frontend ✅ panel, L3), and
// a language shows if ANY of its types is on — so the match lists here overlap by design
// (Latin is in both `dead` and `historical`). The base has its own checkbox too, synthesized
// in L3; nothing here filters it.
//
// STANDARD LANGUAGE IS NOT A TYPE. Wikidata tags English, Mandarin and Standard Arabic
// `standard language`; it says nothing about drawability, so the build ignores that flag —
// a standard language sits under whichever *other* types it carries (usually none, so base).
//
// A MACROLANGUAGE KEEPS ITS PLACE, A FAMILY LABEL DOES NOT. `language group`/`language
// family` catch both real macrolanguages (Chinese, Persian, Albanian — each with a
// two-letter ISO 639-1 code) and family phrases (Indo-European, Bantu — a three-letter
// collective code, or none). The 639-1 code is the divider: with one, the entry is a
// language and stays in the base; without, it takes the group/family checkbox.
//
// FAME TIERS BY SPEAKERS, absolute thresholds (CUTS), the millions boundary a real stop
// so a later ruler can default to it. TWO LANGUAGE SETS as in build-country-data: names
// harvested for NAME_LANGS (skribbl's full set), the locale-like strings on the smaller
// LANGS. The name/bucket machinery mirrors that script; the review pass (Z) extracts the
// shared half.
import { readFile, writeFile } from "node:fs/promises";
import { writeCoverage } from "./coverage.mjs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serializeTopic } from "../lib/serialize.mjs";
import { bucketLangWiki } from "./bucket-names.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RAW = join(ROOT, "data-raw", "geography", "languages");
const TOPIC = join(ROOT, "data", "topics", "geography", "human", "languages.json");
const TODAY = new Date().toISOString().slice(0, 10);

// The locale-like languages: the ones whose *strings* (title, tier conditions, ruler
// tooltip, stratum reasons) this script writes by hand. Small on purpose — UI text.
const LANGS = ["en", "de", "es", "fr", "it", "ja", "ko", "zh-Hans", "zh-Hant", "ru"];
// The word-list output languages: skribbl's full set, so a language *name* is harvested
// for every language the picker may later offer. A superset of LANGS, listed explicitly so
// its order (which the coverage column order follows) stays put as LANGS grows. See
// build-country-data.
const NAME_LANGS = [
  "en", "de", "es", "fr", "it", "ja", "ko", "zh-Hans", "zh-Hant",
  "pt", "ru", "tr", "pl", "nl", "bg", "cs", "da", "et", "fi", "el", "he",
  "hu", "lv", "mk", "no", "ro", "sr", "sk", "sv", "tl",
];

/** Our content tag => the Wikidata tags to read it from, first hit wins (Chinese script
 *  variants, Norwegian nb/nn, Portuguese/Tagalog siblings). Mirrors build-country-data. */
const LANG_SRC = {
  en: ["en"], de: ["de"], es: ["es"], fr: ["fr"], it: ["it"], ja: ["ja"], ko: ["ko"],
  "zh-Hans": ["zh-hans", "zh-cn", "zh-sg", "zh-my", "zh"],
  "zh-Hant": ["zh-hant", "zh-tw", "zh-hk", "zh-mo"],
  pt: ["pt", "pt-br", "pt-pt"], ru: ["ru"], tr: ["tr"], pl: ["pl"], nl: ["nl"],
  bg: ["bg"], cs: ["cs"], da: ["da"], et: ["et"], fi: ["fi"], el: ["el"], he: ["he"],
  hu: ["hu"], lv: ["lv"], mk: ["mk"], no: ["no", "nb", "nn"], ro: ["ro"], sr: ["sr"],
  sk: ["sk"], sv: ["sv"], tl: ["tl", "fil"],
};
const pickLang = (names, tag) => {
  for (const s of LANG_SRC[tag]) if (names?.[s]?.length) return names[s];
  return undefined;
};
/** One entity's dumped names bucketed into our content tags. */
const bucketWiki = (names) => {
  const out = {};
  for (const lang of NAME_LANGS) {
    const v = bucketLangWiki(pickLang(names, lang));
    if (v !== undefined) out[lang] = v;
  }
  return out;
};
/** The English name a bucketed entity draws by, for the stratum match lists. */
const enNameOf = (en) =>
  en === undefined ? undefined : typeof en === "string" ? en : en.pref ?? en.short ?? en.long;

// --- Classification ---------------------------------------------------------
// The ten type flags, in the column order dump-language-data.mjs writes them.
const FLAG_KEYS = [
  "dead", "extinct", "historical", "constructed", "fictional",
  "dialect", "dialectGroup", "standard", "langGroup", "langFamily",
];
/** ISO 639-1 is the two-letter code — the mark of a language prominent enough to have
 *  earned one, which is what tells a macrolanguage (zh) from a family label (ine). */
const has639_1 = (code) => code.length === 2;

/** The icon key that groups the type rules into one ✅ inclusion control (like the
 *  countries' `geoguessr` / `sovereignty`). The frontend resolves it to the panel. */
const TYPE_ICON = "language-type";

/** The opt-in TYPES, one Wikidata class each — every one its own inclusion checkbox (the
 *  ✅ panel groups them only visually, in L3). A language carries a rule for EVERY type it
 *  matches, not just one: tick "dead" and every dead language comes, Latin (dead + historical)
 *  among them — union, not a single bucket. Array order is the order the panel lists them.
 *  `standard` is absent by design: it discriminates nothing (English, Mandarin and Standard
 *  Arabic all carry it — see header). A language matching no type is the living-modern base,
 *  shown by default; its own checkbox is synthesized in the frontend (L3), so no rule here. */
// Each type's label is kept to the bare Wikidata class name and linked to that
// class's page — one URL for every language, the label localized. The rest ("what
// is a dead language?") is one click away rather than spelled out in the row, so the
// checkbox reads "Up to N <type>" and no more. The link is safe inside the <label>:
// an <a> is interactive content, so clicking it opens Wikidata without ticking the box.
//
// The label is a prose id (`languageType.<camel-of-id>`) resolved from src/locale/topics
// at render; the Wikidata `wd` Q-id stays here (language-independent) and the frontend
// wraps the resolved label in its link — see `resolveReason` in src/lib/words.
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

// @migrate (PR plan §M, Batch 2b): NUM/MORE/ABOVE_ZERO (tier conditions) and RULER_TOOLTIP
// still bake every language; they move to src/locale/topics next, when the topic data carries
// band keys and rulerTooltip ids. The reasons (TYPES, SIGN_LANGUAGES) are already migrated.
// TITLE already carries all planned languages and stays put.
const TYPES = [
  { id: "dead", flag: (f) => f.dead, wd: "Q45762" },
  { id: "extinct", flag: (f) => f.extinct, wd: "Q38058796" },
  { id: "historical", flag: (f) => f.historical, wd: "Q2315359" },
  { id: "dialect", flag: (f) => f.dialect, wd: "Q33384" },
  { id: "dialect-group", flag: (f) => f.dialectGroup, wd: "Q1208380" },
  { id: "language-group", flag: (f, code) => f.langGroup && !has639_1(code), wd: "Q941501" },
  { id: "language-family", flag: (f, code) => f.langFamily && !has639_1(code), wd: "Q25295" },
  { id: "constructed", flag: (f) => f.constructed, wd: "Q33215" },
  { id: "fictional", flag: (f) => f.fictional, wd: "Q2623733" },
];
/** The types a language carries — its inclusion checkboxes; empty means the living-modern base. */
const typesOf = (flags, code) => TYPES.filter((t) => t.flag(flags, code));

// --- Fame tiers -------------------------------------------------------------
// Speaker thresholds, descending — the 1-3-10 ladder run per decade all the way down.
// The 1M cut (index 4) is a deliberate stop: the first five tiers are the ~300 languages
// a ruler can default to, the rest the long tail a reader opts into. A language with no
// speaker figure (Latin) tiers last, with a count of 0.
const CUTS = [100e6, 30e6, 10e6, 3e6, 1e6, 300e3, 100e3, 30e3, 10e3, 3e3, 1e3];
// How many tiers the ruler reaches by default — down to the million mark (the tiers below
// are the long tail the reader opts into with the ✅ panel's "< 1M" box). See extendFrom.
const EXTEND_FROM = CUTS.indexOf(1e6) + 1;
const tierOf = (spk) => {
  const n = spk ?? 0;
  for (let i = 0; i < CUTS.length; i++) if (n >= CUTS[i]) return i;
  return CUTS.length;
};

// @migrate (PR plan §M, Batch 3): the band words and the "or more" / "more than 0" formats
// now live in src/locale/topics (`bands` / `more` / `aboveZero`); this script emits bare
// band-key tokens for tierConditions and prose ids for the ruler tooltip.

/** A speaker cut to its band key ("100M", "300k"), the token the topic data carries per tier;
 *  the frontend composes each into "<band> or more" / "more than 0" from the topic-prose
 *  dictionary — see `resolveCondition` in src/locale/topics. Keys must match its `bands`. */
const bandKey = (n) => (n >= 1e6 ? `${n / 1e6}M` : `${n / 1e3}k`);

/** `tierConditions` as tokens: one band key per CUT, then the cumulative floor (">0" must
 *  match `FLOOR` in src/locale/topics). */
const tierConditions = () => [...CUTS.map(bandKey), ">0"];

const TITLE = {
  en: "Languages",
  de: "Sprachen",
  es: "Idiomas",
  fr: "Langues",
  it: "Lingue",
  ja: "言語",
  ko: "언어",
  "zh-Hans": "语言",
  "zh-Hant": "語言",
  pt: "Idiomas",
  ru: "Языки",
  tr: "Diller",
  pl: "Języki",
  nl: "Talen",
  bg: "Езици",
  cs: "Jazyky",
  da: "Sprog",
  et: "Keeled",
  fi: "Kielet",
  el: "Γλώσσες",
  he: "שפות",
  hu: "Nyelvek",
  lv: "Valodas",
  mk: "Јазици",
  no: "Språk",
  ro: "Limbi",
  sr: "Језици",
  sk: "Jazyky",
  sv: "Språk",
  tl: "Mga Wika"
};

/** The ruler's hover, as prose ids resolved in the frontend (src/locale/topics `ruler.languages`).
 *  `text` carries `{condition}`, the band just brought in; `empty` names the ordering at rest. */
const RULER_TOOLTIP = { text: "ruler.languages.text", empty: "ruler.languages.empty" };

// Sign languages are living, natural, single languages — base entries — but they draw
// nothing like a spoken one, so the list offers them by default and lets the reader drop
// them, a plain omittable in the 🚫 panel. Matched by the English name (any form matches).
const SIGN_LANGUAGES = {
  id: "sign-languages",
  match: "* Sign Language",
  count: true,
  reason: "signLanguages",
};

const SOURCES = [
  "Names & variants: Wikidata labels, official names (P1448) and short names (P1813) — https://www.wikidata.org/wiki/Q34770 (see scripts/geography/dump-language-data.mjs)",
  "Speakers & type: Wikidata number of speakers (P1098) and instance/subclass of the modern-language family (P31/P279*) — https://www.wikidata.org/wiki/Q34770 (see scripts/geography/dump-language-data.mjs)",
];

/** The structure rows: qid, ISO code, speaker count, and the ten type flags. */
async function readStructure() {
  const text = await readFile(join(RAW, "language-structure.tsv"), "utf8");
  return text
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const f = l.split("\t");
      const flags = {};
      FLAG_KEYS.forEach((k, i) => (flags[k] = f[3 + i] === "1"));
      return { qid: f[0], code: (f[1] || "").trim(), speakers: f[2] ? Number(f[2]) : null, flags };
    });
}

async function main() {
  const structure = await readStructure();
  const nameData = JSON.parse(await readFile(join(RAW, "language-names.json"), "utf8"));

  /** A language's localized entry: NAME_LANGS names, those equal to English dropped, the
   *  missing ones listed under `?` (same shape build-country-data emits). Returns null for
   *  a Q-item with no name in any supported language — it cannot be a word, so it drops.
   *  Where a name exists but not an English one (a handful of obscure, default-hidden
   *  dialects), the first available language's name stands in, so the list never shows a
   *  bare Q-id. */
  const entryOf = (qid) => {
    const b = bucketWiki(nameData[qid]?.names ?? {});
    if (b.en === undefined) {
      const firstLang = NAME_LANGS.find((l) => b[l] !== undefined);
      if (firstLang === undefined) return null;
      b.en = b[firstLang];
    }
    const map = { en: b.en };
    const unknown = [];
    for (const lang of NAME_LANGS) {
      if (lang === "en") continue;
      const v = b[lang];
      if (v === undefined || v === "") unknown.push(lang);
      else if (JSON.stringify(v) !== JSON.stringify(b.en)) map[lang] = v;
    }
    if (unknown.length) map["?"] = unknown;
    return map;
  };

  // One record per language: its entry, its English draw name, its speakers and stratum.
  // Nameless Q-items (entryOf === null) drop out.
  let dropped = 0;
  let langs = structure
    .map((r) => {
      const entry = entryOf(r.qid);
      if (entry === null) {
        dropped++;
        return null;
      }
      return {
        qid: r.qid,
        speakers: r.speakers,
        en: enNameOf(entry.en),
        types: typesOf(r.flags, r.code),
        entry,
      };
    })
    .filter(Boolean);

  // Distinct by English draw name. Two Wikidata items can share one — Marwari the
  // language beside two of its dialects, a language beside a like-named family (Bade,
  // Ron). A word list can't tell identical entries apart, so keep a single representative:
  // a base (typeless) language over a typed one, then the most spoken.
  let namesakes = 0;
  langs.sort((a, b) => (a.types.length ? 1 : 0) - (b.types.length ? 1 : 0) || (b.speakers ?? -1) - (a.speakers ?? -1));
  const seen = new Set();
  langs = langs.filter((l) => {
    if (seen.has(l.en)) {
      namesakes++;
      return false; // a later, less-preferred namesake — the first kept is the representative
    }
    seen.add(l.en);
    return true;
  });

  // Most spoken first; alphabetically among the ones sharing a tier (and the figure-less
  // tail, which all sits in the last one).
  langs.sort(
    (a, b) => (b.speakers ?? -1) - (a.speakers ?? -1) || (a.en ?? "").localeCompare(b.en ?? "", "en"),
  );

  // Every language into its speaker tier; each type collects the draw names it covers. A
  // language lands in EVERY type it carries (union) — the match lists overlap on purpose.
  const tiers = Array.from({ length: CUTS.length + 1 }, () => []);
  const match = Object.fromEntries(TYPES.map((t) => [t.id, []]));
  for (const l of langs) {
    tiers[tierOf(l.speakers)].push(l.entry);
    for (const t of l.types) match[t.id].push(l.en);
  }

  // One omitted rule per type that has a member, in TYPES (panel) order. `count` turns on
  // the "up to N" label; the reason reads on from it. All default-off — the reader includes
  // a type by ticking it; the base is what remains shown when none is ticked. The shared
  // `icon` lifts them out of the 🚫 panel into their own ✅ inclusion control (union
  // semantics, a synthesized base checkbox; see the language-type panel in the frontend).
  const omitted = TYPES.filter((t) => match[t.id].length).map((t) => ({
    id: t.id,
    match: match[t.id].slice().sort(),
    count: true,
    icon: TYPE_ICON,
    reason: `languageType.${camel(t.id)}`,
    wd: t.wd,
  }));

  const topic = {
    id: "languages",
    title: TITLE,
    icon: "🗣️",
    description: "The world's languages, each named in every language skribbl offers. Fame tiers by speakers worldwide.",
    // ja-Latn is offered but not sourced: the reader opts into romaji, derived from the
    // Japanese name at render (see generatedRomaji / lib/kana), as in the country lists.
    languages: NAME_LANGS.flatMap((l) => (l === "ja" ? ["ja", "ja-Latn"] : [l])),
    generatedRomaji: true,
    sources: SOURCES,
    lastUpdated: TODAY,
    lastChecked: TODAY,
    defaultNames: "pref",
    omitted,
    omittable: [SIGN_LANGUAGES],
    tiers,
    tierConditions: tierConditions(),
    rulerTooltip: RULER_TOOLTIP,
    extendFrom: EXTEND_FROM,
  };

  const base = langs.filter((l) => !l.types.length).length;
  console.log(`${langs.length} languages — ${base} base, ${langs.length - base} typed (${dropped} nameless, ${namesakes} namesakes dropped)`);
  console.log(`tiers: ${tiers.map((t) => t.length).join(" / ")}  (first 5 = >=1M)`);
  for (const t of TYPES) console.log(`  ${t.id.padEnd(16)} ${match[t.id].length}`);

  await writeCoverage(ROOT, "languages", nameData, NAME_LANGS, LANG_SRC, "users", process.argv.includes("--write"));

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
