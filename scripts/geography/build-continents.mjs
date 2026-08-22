// Builds data/topics/geography/physical/continents.json from the dumps that
// scripts/geography/dump-plate-data.mjs leaves in data-raw/geography/.
//
//   node scripts/geography/build-continents.mjs [--write]
//
// FOUR TIERS, THREE OF THEM MEASURED. Bird (2003) gives every plate in his model
// a share of the Earth's surface in steradians, and those shares add up to 4π —
// one source, one column, no arithmetic of ours. Tiers 0 to 2 are cut from it.
// Tier 3 is what the model does not contain: plates the English list names and
// nobody has measured, so it is grouped by parent plate instead, which is the only
// order that page gives them. The list says so itself, through `tierNotes`.
//
// TIER 0 MERGES TWO LISTS. The seven continents and the seven major plates name
// the same landmasses, so they are one tier of paired entries rather than two of
// near-duplicates — `Nordamerika` and `Nordamerikanische Platte` are the short and
// long form of one entry. Four have only one form: the Pacific plate is no
// continent, and Asia, Europe and Oceania are no plates.
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serializeTopic } from "../lib/serialize.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RAW = join(ROOT, "data-raw", "geography");
const TOPIC = join(ROOT, "data", "topics", "geography", "physical", "continents.json");

const LANGS = ["en", "de", "es", "fr", "it", "ja", "ko", "zh-Hans", "zh-Hant"];

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
  },
  long: {
    en: "Continents & Plates",
    de: "Kontinente & Platten",
    es: "Continentes y placas",
    fr: "Continents et plaques",
    it: "Continenti e placche",
    ja: "大陸とプレート",
    ko: "대륙과 판",
  },
};

/** What each tier's cut is, named rather than numbered — the plates come banded
 *  (major / minor / micro), not by a threshold. Read cumulatively, as the ruler
 *  brings everything down to and including a band: the tooltip substitutes the
 *  lowest one just added. Seven languages, matching `TIER3_NOTE`; the two Chinese
 *  UIs fall back to English there too. */
const TIER_CONDITIONS = [
  {
    en: "continents and major plates",
    de: "Kontinente und Grossplatten",
    es: "continentes y placas mayores",
    fr: "continents et plaques majeures",
    it: "continenti e placche maggiori",
    ja: "大陸と主要プレート",
    ko: "대륙과 주요 판",
  },
  {
    en: "minor plates and larger",
    de: "Kleinplatten und grösser",
    es: "placas menores y mayores",
    fr: "plaques mineures et au-delà",
    it: "placche minori e maggiori",
    ja: "小規模プレート以上",
    ko: "소규모 판 이상",
  },
  {
    en: "microplates with a measured area, and larger",
    de: "Mikroplatten mit gemessener Fläche und grösser",
    es: "microplacas con superficie medida y mayores",
    fr: "microplaques à superficie mesurée et au-delà",
    it: "microplacche con superficie misurata e maggiori",
    ja: "面積が測定された微小プレート以上",
    ko: "면적이 측정된 미소판 이상",
  },
  {
    en: "microplates and larger, measured or not",
    de: "Mikroplatten und grösser, ob gemessen oder nicht",
    es: "microplacas y mayores, medidas o no",
    fr: "microplaques et au-delà, mesurées ou non",
    it: "microplacche e maggiori, misurate o no",
    ja: "微小プレート以上、測定の有無を問わず",
    ko: "미소판 이상, 측정 여부와 무관",
  },
];

/** The ruler's hover. `{condition}` is filled with the band above; at rest it
 *  names what the list is sorted by, the one thing a selection can't show. The
 *  "Selected:" / "Mostly selected:" prefix is a locale string the frontend
 *  prepends (src/locale, src/lib/fame `rulerTip`), so the text here is bare. */
const RULER_TOOLTIP = {
  text: "{condition}",
  empty: {
    en: "Ordered by plate area (Bird 2003).",
    de: "Nach Plattenfläche geordnet (Bird 2003).",
    es: "Ordenadas por superficie de la placa (Bird 2003).",
    fr: "Classées par superficie des plaques (Bird 2003).",
    it: "Ordinate per superficie delle placche (Bird 2003).",
    ja: "プレート面積順（Bird 2003）。",
    ko: "판 면적 순 (Bird 2003).",
  },
};

/** The note tier 3 raises about itself, once the ruler reaches it. */
const TIER3_NOTE = {
  en: "No area has ever been published for these plates, so this tier is grouped by the plate each sits under rather than ordered by size — and several of them are not their own encyclopedia article either.",
  de: "Für diese Platten wurde nie eine Fläche veröffentlicht, daher ist diese Stufe nach Mutterplatte gruppiert statt nach Grösse sortiert — und mehrere von ihnen haben nicht einmal einen eigenen Enzyklopädie-Artikel.",
  es: "Nunca se ha publicado la superficie de estas placas, así que este nivel se agrupa por la placa a la que pertenece cada una en lugar de ordenarse por tamaño, y varias ni siquiera tienen artículo propio.",
  fr: "Aucune superficie n'a jamais été publiée pour ces plaques : ce niveau est donc regroupé par plaque parente plutôt que classé par taille, et plusieurs d'entre elles n'ont même pas d'article propre.",
  it: "Per queste placche non è mai stata pubblicata una superficie, quindi questo livello è raggruppato per placca madre anziché ordinato per dimensione, e diverse non hanno nemmeno una voce propria.",
  ja: "これらのプレートの面積は公表されたことがないため、この段階は大きさ順ではなく所属するプレートごとにまとめてあります。独立した記事すらないものもいくつかあります。",
  ko: "이 판들은 면적이 공표된 적이 없어 이 단계는 크기순이 아니라 상위 판별로 묶여 있으며, 그중 몇몇은 독립된 문서조차 없습니다.",
};

/** `<key> ⇥ <name>` per line → `{ key: { lang: name } }`, tidied twice.
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
async function readDump(dir) {
  const out = {};
  for (const lang of LANGS) {
    const text = await readFile(join(RAW, dir, `${lang}.txt`), "utf8");
    // Split CRLF-tolerantly: a Windows-checked-out dump would otherwise leave a \r
    // on every name and bake it into the JSON strings.
    for (const row of text.split(/\r?\n/).filter(Boolean)) {
      const [key, raw] = row.split("\t");
      const name = raw.replace(/\s*[(（][^)）]*[)）]\s*$/, "");
      (out[key] ??= {})[lang] = name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  return out;
}

async function readStructure() {
  const text = await readFile(join(RAW, "plates", "structure.tsv"), "utf8");
  return text
    .split(/\r?\n/) // CRLF-tolerant, so the last column never keeps a trailing \r
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const [name, band, parent, wikidata, sr] = l.split("\t");
      return { name, band, parent, wikidata, sr: sr ? Number(sr) : undefined };
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
 *  its plate; dropping the entry over the missing half would take a name we have. */
function entry(land, plate, lands, plates) {
  const map = {};
  const unknown = [];
  for (const lang of LANGS) {
    const short = land ? (OVERRIDES[`${land}.${lang}`] ?? lands[land]?.[lang]) : undefined;
    const long = plate ? (OVERRIDES[`${plate}.${lang}`] ?? plates[plate]?.[lang]) : undefined;
    const value =
      short && long ? (short === long ? short : { short, long }) : (long ?? short);
    if (value === undefined) unknown.push(lang);
    else map[lang] = value;
  }
  if (map.en === undefined) throw new Error(`no English name for ${land ?? plate}`);
  // An absent key means "the same as English" — so a language that agrees with it
  // says so by keeping quiet, and only a real gap needs `?`.
  for (const lang of LANGS) {
    if (lang !== "en" && JSON.stringify(map[lang]) === JSON.stringify(map.en)) delete map[lang];
  }
  if (unknown.length) map["?"] = unknown;
  return map;
}

async function main() {
  const lands = await readDump("continents");
  const plates = await readDump("plates");
  const structure = await readStructure();

  const inTier0 = new Set(TIER0.map((e) => e.plate).filter(Boolean));
  const stray = structure.filter((p) => p.band === "major" && !inTier0.has(p.name));
  if (stray.length) throw new Error(`major plate outside tier 0: ${stray.map((p) => p.name)}`);

  const tiers = [
    TIER0.map((e) => entry(e.land, e.plate, lands, plates)),
    structure.filter((p) => p.band === "minor" && !inTier0.has(p.name)),
    structure.filter((p) => p.band === "micro" && p.sr !== undefined),
    structure.filter((p) => p.band === "micro" && p.sr === undefined),
  ].map((tier, i) =>
    i === 0 ? tier : tier.map((p) => entry(undefined, p.name, lands, plates)),
  );

  const topic = {
    id: "continents",
    title: TITLE,
    icon: "🗺️",
    description:
      "The continents and the tectonic plates, in one list: tier 0 pairs each landmass with the plate named after it, and the tiers below it walk down Bird's plate model by area until the plates run out of published ones.",
    languages: LANGS,
    sources: [
      "Grouping: https://en.wikipedia.org/wiki/List_of_tectonic_plates",
      "Areas: Bird (2003), An updated digital model of plate boundaries — via https://de.wikipedia.org/wiki/Liste_der_tektonischen_Platten",
      "Names: Wikidata labels of the plate articles and of https://www.wikidata.org/wiki/Q215680 — see scripts/geography/dump-plate-data.mjs",
    ],
    lastUpdated: new Date().toISOString().slice(0, 10),
    lastChecked: new Date().toISOString().slice(0, 10),
    defaultNames: "both",
    tierNotes: [{ fromTier: 4, icon: "ℹ️", text: TIER3_NOTE }],
    tiers,
    tierConditions: TIER_CONDITIONS,
    rulerTooltip: RULER_TOOLTIP,
  };

  const text = serializeTopic(topic);
  console.log(`tiers: ${tiers.map((t) => t.length).join(" / ")} — ${tiers.flat().length} entries`);
  for (const lang of LANGS.filter((l) => l !== "en")) {
    const missing = tiers.flat().filter((e) => (e["?"] ?? []).includes(lang)).length;
    console.log(`  ${lang.padEnd(8)} ${String(missing).padStart(3)} without a name`);
  }
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
