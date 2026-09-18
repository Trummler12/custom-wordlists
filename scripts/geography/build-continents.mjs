// Builds data/topics/geography/physical/continents.json from the dumps that
// scripts/geography/dump-plate-data.mjs leaves in data-raw/geography/.
//
//   node scripts/geography/build-continents.mjs [--write]
//
// FIVE TIERS, THREE OF THEM MEASURED. Bird (2003) gives every plate in his model
// a share of the Earth's surface in steradians, and those shares add up to 4π —
// one source, one column, no arithmetic of ours. Tiers 0 to 2 are cut from it.
// Tier 3 is what the model does not contain: plates the English list names and
// nobody has measured, so it is grouped by parent plate instead, which is the only
// order that page gives them. Tier 4 is the Wikidata catch-all — everything P31 calls
// a tectonic plate that the banded sources don't classify (mostly extinct plates),
// filtered of junk and name-duplicates. Tier 3 says so itself, in a `{br}` second line
// folded into its tier condition. Extinct plates additionally carry an `omitted` rule
// that hides them by default.
//
// TIER 0 MERGES TWO LISTS. The seven continents and the seven major plates name
// the same landmasses, so they are one tier of paired entries rather than two of
// near-duplicates — `Nordamerika` and `Nordamerikanische Platte` are the short and
// long form of one entry. Five have only one form, and each is bound to the mode
// that fits it: Asia, Europe and Oceania are no plates, so they are short-only and
// drop out of the plate (long) dropdown; the Pacific and Indo-Australian plates are
// no continents, so in tier 0 they are long-only and drop out of the continent
// (short) dropdown. Those two are no less real for that, so each also gets a plain
// two-form copy at the head of tier 1: under long it ranks where its area puts it
// in tier 0, under short it shows one rank down as a plate among plates. Every
// lower tier is plates only, left plain so a plate name shows in either dropdown.
import { readFile, writeFile } from "node:fs/promises";
import { writeCoverage } from "./coverage.mjs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serializeTopic } from "../lib/serialize.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RAW = join(ROOT, "data-raw", "geography");
const TOPIC = join(ROOT, "data", "topics", "geography", "physical", "continents.json");

// The word-list output languages: skribbl's full set, a superset of the nine the
// locale-like strings (titles, tier conditions, tooltips, notes) use. Names only —
// dormant until CONTENT_LANGS grows into them. Mirrors build-country-data / the dump.
const NAME_LANGS = [
  "en", "de", "es", "fr", "it", "ja", "ko", "zh-Hans", "zh-Hant",
  "pt", "ru", "tr", "pl", "nl", "bg", "cs", "da", "et", "fi", "el", "he",
  "hu", "lv", "mk", "no", "ro", "sr", "sk", "sv", "tl",
];

/** Our content tag → the raw Wikidata label tags the dump keyed `names` under, first hit
 *  wins — the same chains the dump and build-country-data use (zh scripts, nb/nn, fil). */
const LANG_SRC = {
  en: ["en"], de: ["de"], es: ["es"], fr: ["fr"], it: ["it"], ja: ["ja"], ko: ["ko"],
  "zh-Hans": ["zh-hans", "zh-cn", "zh-sg", "zh-my", "zh"],
  "zh-Hant": ["zh-hant", "zh-tw", "zh-hk", "zh-mo"],
  pt: ["pt", "pt-br", "pt-pt"], ru: ["ru"], tr: ["tr"], pl: ["pl"], nl: ["nl"],
  bg: ["bg"], cs: ["cs"], da: ["da"], et: ["et"], fi: ["fi"], el: ["el"], he: ["he"],
  hu: ["hu"], lv: ["lv"], mk: ["mk"], no: ["no", "nb", "nn"], ro: ["ro"], sr: ["sr"],
  sk: ["sk"], sv: ["sv"], tl: ["tl", "fil"],
};

/** Curated departures for the Wikidata P31 catch-all (dump band "unknown"), which a
 *  bare query can't clean itself. Q-ids, so a relabel upstream doesn't slip one past.
 *  Dropped entirely: things Wikidata tags as a tectonic plate that are not one, and one
 *  duplicate of a plate already present under another item. Name-level duplicates of a
 *  banded plate (a redlink and its item) are dropped separately, by name, below. */
const CATCHALL_DROP = new Set([
  "Q1933940", // the concept "microplate", not a plate
  "Q6058525", // "intraplate deformation", a process
  "Q7853562", // no English label — nothing to show
  "Q115534336", // "Central India Tectonic Zone", a zone, not a plate
  "Q3906099", // "Jan Mayen Microcontinent", a continental fragment, not a plate
  "Q19848929", // "European plate", a duplicate of the Eurasian plate
  "Q17115739", // "Western Siberia Plate", duplicate of West Siberian Plate (Q25473407)
]);

/** Extinct / ancient plates — no longer active, subducted or accreted long ago.
 *  Wikidata carries no signal for this (no end date, no "former plate" class), so the
 *  list is by hand, verified against the geology. They still sit in their tier, but an
 *  `omitted` rule hides them by default, the way the language list hides dead tongues. */
const ANCIENT = new Set([
  "Q902322", // Phoenix
  "Q1059335", // Izanagi
  "Q1203170", // Farallon
  "Q1320205", // Kula
  "Q3391669", // Bellingshausen
  "Q5074185", // Charcot
  "Q5120147", // Cimmerian
  "Q13542800", // Baltica
  "Q3391667", // Intermontane
  "Q6886313", // Moa
  "Q3391684", // Lhasa
]);

// All the locale-like prose this script used to bake — the ancient-plates reason, the tier
// conditions, the tier-3 note and its label, and the ruler tooltip — now lives in
// src/locale/topics (§M migration); the script emits prose ids and condition tokens. TITLE
// already carries all planned languages and stays put.

/** The landmasses the continent names are keyed under, Q-id per key — the same map the
 *  dump lists, repeated here because the build's identity is the English key (TIER0,
 *  structure.tsv) while the Wikidata dump is keyed by Q-id. Ten hand-picked items; the
 *  plates reconcile by Q-id through structure.tsv, but these never move. */
const LANDMASSES = {
  Africa: "Q15",
  Antarctica: "Q51",
  Asia: "Q48",
  Australia: "Q408",
  Eurasia: "Q5401",
  Europe: "Q46",
  India: "Q668",
  "North America": "Q49",
  Oceania: "Q55643",
  "South America": "Q18",
};

/** Tier 0, in the order it is shown: roughly by area, with each landmass beside
 *  the plate named after it.
 *
 *  `Indo-Australian plate` carries no short form, unlike its two halves. There is
 *  no landmass called Indo-Australia — the name exists for the plate and nothing
 *  else, so no source has it in nine languages and inventing one here would be
 *  nine guesses wearing the coat of a dump. */
const TIER0 = [
  { plate: "Pacific plate" },
  { land: "North America", plate: "North American plate" },
  { land: "Africa", plate: "African plate" },
  { land: "Eurasia", plate: "Eurasian plate" },
  { land: "Asia" },
  { land: "Europe" },
  { land: "Antarctica", plate: "Antarctic plate" },
  { plate: "Indo-Australian plate" },
  { land: "Australia", plate: "Australian plate" },
  { land: "India", plate: "Indian plate" },
  { land: "Oceania" },
  { land: "South America", plate: "South American plate" },
];

/** Curated departures from the dump, `<key>.<lang>`, for landmasses and plates
 *  alike.
 *
 *  Here rather than in the dump, which is a snapshot and has no business
 *  disagreeing with its source. Two so far, for two different reasons:
 *  *Antarktika* is the formal German name and *Antarktis* is the one anyone would
 *  draw or guess; and the item behind the Hreppar microplate is labelled with a
 *  description rather than a name, so the article title — which is the key on the
 *  left of every dump line — is the better of the two.
 *
 *  Not extended lightly. Every line is a name nobody can check against a source,
 *  which is the thing this pair of scripts exists to avoid. */
const OVERRIDES = {
  "Antarctica.de": "Antarktis",
  "Hreppar microplate.en": "Hreppar Microplate",
};

/** Short and long, like any entry with two forms: the tree row wants a word and
 *  the hover wants the whole of it. */
const TITLE = {
  short: {
    en: "Continents",
    de: "Kontinente",
    es: "Continentes",
    fr: "Continents",
    it: "Continenti",
    ja: "大陸",
    ko: "대륙",
    "zh-Hans": "大洲",
    "zh-Hant": "大洲",
    pt: "Continentes",
    ru: "Континенты",
    tr: "Kıtalar",
    pl: "Kontynenty",
    nl: "Continenten",
    bg: "Континенти",
    cs: "Kontinenty",
    da: "Kontinenter",
    et: "Mandrid",
    fi: "Maanosat",
    el: "Ήπειροι",
    he: "יבשות",
    hu: "Kontinensek",
    lv: "Kontinenti",
    mk: "Континенти",
    no: "Kontinenter",
    ro: "Continente",
    sr: "Континенти",
    sk: "Kontinenty",
    sv: "Kontinenter",
    tl: "Mga Kontinente",
  },
  long: {
    en: "Continents & Plates",
    de: "Kontinente & Platten",
    es: "Continentes y placas",
    fr: "Continents et plaques",
    it: "Continenti e placche",
    ja: "大陸とプレート",
    ko: "대륙과 판",
    "zh-Hans": "大洲与板块",
    "zh-Hant": "大洲與板塊",
    pt: "Continentes e Placas",
    ru: "Континенты и плиты",
    tr: "Kıtalar ve Levhalar",
    pl: "Kontynenty i płyty",
    nl: "Continenten & Platen",
    bg: "Континенти и плочи",
    cs: "Kontinenty a desky",
    da: "Kontinenter og plader",
    et: "Mandrid ja laamad",
    fi: "Maanosat ja laatat",
    el: "Ήπειροι & Πλάκες",
    he: "יבשות ולוחות",
    hu: "Kontinensek és lemezek",
    lv: "Kontinenti un plātnes",
    mk: "Континенти и плочи",
    no: "Kontinenter og plater",
    ro: "Continente și plăci",
    sr: "Континенти и плоче",
    sk: "Kontinenty a dosky",
    sv: "Kontinenter & plattor",
    tl: "Mga Kontinente at Tectonic Plate",
  },
};

/** What each tier's cut is, as a prose id ("continentTiers.<i>") resolved in the frontend
 *  from src/locale/topics — the plates come banded (major / minor / micro), not by a
 *  threshold, and the ruler reads them cumulatively, substituting the lowest band just
 *  added. Tier 3 folds its caveat onto a `{br}{br}` second line via the "@<noteId>" tail
 *  (see `resolveCondition`): kept out of a separate ℹ️ glyph by design — that glyph is the
 *  language lists' (transliteration and the like), and the ruler already carries the band. */
const tierConditionsWithNotes = [
  "continentTiers.0",
  "continentTiers.1",
  "continentTiers.2",
  "continentTiers.3@tier3Note",
  "continentTiers.4",
];

/** The ruler's hover, as prose ids resolved in the frontend (src/locale/topics `ruler.continents`).
 *  `text` is "{condition}" — the band the ruler brought in stands alone; `empty` names the
 *  ordering at rest. The "Selected:" / "Mostly selected:" prefix is a locale string the
 *  frontend prepends (src/lib/fame `rulerTip`). */
const RULER_TOOLTIP = { text: "ruler.continents.text", empty: "ruler.continents.empty" };

/** A Wikidata label, tidied twice — the dump keeps them raw (a snapshot has no business
 *  disagreeing with its source), so the curation is applied here on read.
 *
 *  CASE. Wikidata writes labels in the case its own house style asks for rather
 *  than the one the language uses — Spanish arrives as `placa euroasiática` beside
 *  `Placa Pacífica`. Only the first letter is touched: what a language does inside
 *  a name is that language's business, and `placa Australiana` is a mistake to
 *  report upstream, not to paper over here.
 *
 *  DISAMBIGUATORS. Where a label was taken from an article title, it can carry the
 *  bracket that title needed to be unique — `Sandwichplatte (tektonische Platte)`,
 *  which is not what the plate is called and is also two characters past what
 *  skribbl accepts. One label in nine languages has this, and dropping the tail is
 *  safe here because no plate or landmass is named with a bracket. It would not be
 *  safe everywhere: `Norwegian (Bokmål)` in the language list is the name.
 *
 *  Both are curation, so both live here rather than in the dump, which is a
 *  snapshot and has no business disagreeing with its source. */
const tidy = (name) => {
  const n = name.replace(/\s*[(（][^)）]*[)）]\s*$/, "");
  return n.charAt(0).toUpperCase() + n.slice(1);
};
/** The preferred name a content tag reads from a dump item's rich `names` map — the first
 *  of its Wikidata sources that carries a term, its `pref` label (else the first alias). */
const prefName = (names, ourTag) => {
  for (const src of LANG_SRC[ourTag]) {
    const arr = names?.[src];
    if (arr?.length) return (arr.find((t) => t.pref) ?? arr[0]).name;
  }
  return undefined;
};
/** A dump item (`{ name, area?, names }`) → our `{ tag: name }`, each name tidied. */
const resolve = (item) => {
  const out = {};
  for (const tag of NAME_LANGS) {
    const n = prefName(item?.names, tag);
    if (n) out[tag] = tidy(n);
  }
  return out;
};

async function loadNames(dir, file) {
  return JSON.parse(await readFile(join(RAW, dir, file), "utf8"));
}

async function readStructure() {
  const text = await readFile(join(RAW, "plates", "structure.tsv"), "utf8");
  return text
    .split(/\r?\n/) // CRLF-tolerant, so the last column never keeps a trailing \r
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const [name, band, parent, wikidata, sr, de] = l.split("\t");
      return { name, band, parent, wikidata, sr: sr ? Number(sr) : undefined, de: de || undefined };
    });
}

/** One entry, in the entry-level language map form: `{ en: …, de: …, "?": [] }`.
 *
 *  Not the name pair whose halves each localize, which the schema otherwise
 *  prefers — that shape has nowhere to put `?`, and the gaps here are the point:
 *  a third of these plates have no name outside English, and the ✂️ panel can only
 *  report what the entries admit to.
 *
 *  A language holding one of the two names and not the other gets that one as a
 *  plain string rather than a gap. Chinese has a name for Australia and none for
 *  its plate; dropping the entry over the missing half would take a name we have.
 *
 *  `bindSingle` decides what a single-name entry means. In tier 0 an entry with
 *  only a continent (Asia) or only a plate (Pacific) is bound to that one mode —
 *  stored as a one-sided name pair `{ short }` / `{ long }` so it never loads in
 *  the dropdown that doesn't fit it. Below tier 0 every entry is a plate and there
 *  is no continent form to withhold, so its lone name stays a plain string that
 *  shows in short and long alike. */
function entry(land, plate, lands, plates, bindSingle = false) {
  const map = {};
  const unknown = [];
  for (const lang of NAME_LANGS) {
    const short = land ? (OVERRIDES[`${land}.${lang}`] ?? lands[land]?.[lang]) : undefined;
    const long = plate ? (OVERRIDES[`${plate}.${lang}`] ?? plates[plate]?.[lang]) : undefined;
    const value =
      short && long
        ? short === long
          ? short
          : { short, long }
        : bindSingle
          ? short
            ? { short }
            : long
              ? { long }
              : undefined
          : (long ?? short);
    if (value === undefined) unknown.push(lang);
    else map[lang] = value;
  }
  if (map.en === undefined) throw new Error(`no English name for ${land ?? plate}`);
  // An absent key means "the same as English" — so a language that agrees with it
  // says so by keeping quiet, and only a real gap needs `?`.
  for (const lang of NAME_LANGS) {
    if (lang !== "en" && JSON.stringify(map[lang]) === JSON.stringify(map.en)) delete map[lang];
  }
  if (unknown.length) map["?"] = unknown;
  return map;
}

async function main() {
  const structure = await readStructure();
  const continentNames = await loadNames("continents", "continent-names.json");
  const plateNames = await loadNames("plates", "plate-names.json");
  // The names, keyed by the English name the rest of the build works in. Continents map
  // through LANDMASSES; plates join structure.tsv (name ↔ Q-id) to the Q-id-keyed dump,
  // with a redlink's English name taken from its key and its German from the Bird column.
  const lands = Object.fromEntries(
    Object.entries(LANDMASSES).map(([key, qid]) => [key, resolve(continentNames[qid])]),
  );
  const plates = {};
  for (const row of structure) {
    const names = resolve(plateNames[row.wikidata]);
    if (!names.en) names.en = tidy(row.name);
    if (!names.de && row.de) names.de = tidy(row.de);
    plates[row.name] = names;
  }

  const inTier0 = new Set(TIER0.map((e) => e.plate).filter(Boolean));
  const stray = structure.filter((p) => p.band === "major" && !inTier0.has(p.name));
  if (stray.length) throw new Error(`major plate outside tier 0: ${stray.map((p) => p.name)}`);

  // The two tier-0 plates that are no continents also head tier 1, as plain
  // two-form copies: under short they leave tier 0 and rank here among the plates,
  // and under long they render the same name as their tier-0 entry, which
  // `output.merged` and the counts deduplicate away. Pacific first, then
  // Indo-Australian, matching their order in tier 0.
  const tier1Copies = [
    entry(undefined, "Pacific plate", lands, plates),
    entry(undefined, "Indo-Australian plate", lands, plates),
  ];

  // The fifth tier: the Wikidata catch-all (dump band "unknown"), plates with no band and
  // no area, so nothing places them above the floor. Drop the curated junk by Q-id, and
  // any whose name already belongs to a banded plate — a redlink and its item differing
  // only in case (Altiplano, Futuna), the item being the duplicate to lose.
  const bandedNames = new Set(
    structure.filter((p) => p.band !== "unknown").map((p) => p.name.toLowerCase()),
  );
  const catchall = structure.filter(
    (p) =>
      p.band === "unknown" &&
      !CATCHALL_DROP.has(p.wikidata) &&
      !bandedNames.has(p.name.toLowerCase()),
  );
  // The extinct ones among them, by their English name, for the `omitted` rule below.
  const ancientNames = catchall.filter((p) => ANCIENT.has(p.wikidata)).map((p) => p.name);

  const tiers = [
    TIER0.map((e) => entry(e.land, e.plate, lands, plates, true)),
    [
      ...tier1Copies,
      ...structure.filter((p) => p.band === "minor" && !inTier0.has(p.name)),
    ],
    structure.filter((p) => p.band === "micro" && p.sr !== undefined),
    structure.filter((p) => p.band === "micro" && p.sr === undefined),
    catchall,
  ].map((tier, i) =>
    i === 0
      ? tier
      : tier.map((p) => (p.name ? entry(undefined, p.name, lands, plates) : p)),
  );

  // Extinct plates sit in the last tier like any other, but the 🚫 panel hides them by
  // default — the way the language list hides dead tongues. An `omitted` rule matching
  // their English names; the count reads "up to N", the ruler bounding how many return.
  const ancientRule = {
    id: "ancient",
    match: ancientNames,
    reason: "ancientPlates",
    count: true,
  };

  const topic = {
    id: "continents",
    title: TITLE,
    icon: "🗺️",
    description:
      "The continents and the tectonic plates, in one list: tier 0 pairs each landmass with the plate named after it, and the tiers below it walk down Bird's plate model by area until the plates run out of published ones.",
    languages: NAME_LANGS,
    sources: [
      "Grouping: https://en.wikipedia.org/wiki/List_of_tectonic_plates",
      "Areas: Bird (2003), An updated digital model of plate boundaries — via https://de.wikipedia.org/wiki/Liste_der_tektonischen_Platten",
      "Names: Wikidata labels of the plate articles and of https://www.wikidata.org/wiki/Q215680 — see scripts/geography/dump-plate-data.mjs",
    ],
    lastUpdated: new Date().toISOString().slice(0, 10),
    lastChecked: new Date().toISOString().slice(0, 10),
    defaultNames: "both",
    omitted: [ancientRule],
    tiers,
    tierConditions: tierConditionsWithNotes,
    rulerTooltip: RULER_TOOLTIP,
  };

  const text = serializeTopic(topic);
  console.log(`tiers: ${tiers.map((t) => t.length).join(" / ")} — ${tiers.flat().length} entries`);
  for (const lang of NAME_LANGS.filter((l) => l !== "en")) {
    const missing = tiers.flat().filter((e) => (e["?"] ?? []).includes(lang)).length;
    console.log(`  ${lang.padEnd(8)} ${String(missing).padStart(3)} without a name`);
  }
  await writeCoverage(ROOT, "continents", { ...continentNames, ...plateNames }, NAME_LANGS, LANG_SRC, "area", process.argv.includes("--write"));

  if (process.argv.includes("--write")) {
    await writeFile(TOPIC, text, "utf8");
    console.log(`wrote ${TOPIC}`);
  } else {
    console.log("(dry run — pass --write to save)");
  }
}

main().catch((err) => {
  console.error("build-continents failed:", err.message);
  process.exit(1);
});
