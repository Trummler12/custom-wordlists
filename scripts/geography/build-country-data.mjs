// Builds data/topics/geography/human/<continent>/ from the country dump —
// one folder per continent, each with a countries list and a capitals list.
//
//   node scripts/geography/build-country-data.mjs [--write]
//
// TIERED BY POPULATION, THE SAME CUT EVERYWHERE. Every countries file draws its
// five tiers at 100M / 20M / 5M / 1M, and every file declares those cuts in
// `tierConditions` — so the inheritsUpwards family check (later) can confirm the
// continents agree, and the ruler tooltip can say what a stop selects. Capitals
// take their country's tier unchanged, so the two rulers mean the same thing.
//
// A COUNTRY LIVES ON EVERY CONTINENT IT SPANS. Russia, Turkey and Kazakhstan get
// an entry under both Europe and Asia — the redundancy is wanted; each continent
// carries the countries that sit on it. The world level de-duplicates for its
// counts (that is inheritsUpwards' job, not this script's). Insular Oceania (Q538)
// maps to Oceania rather than being dropped, because Fiji and Vanuatu carry only
// it; Eurasia (Q5401) is dropped, its one bearer already listed under both halves.
//
// THREE FORMAL LABELS GET A SHORT NAME. Wikidata's label for China, the
// Netherlands and Denmark is the formal one ("People's Republic of China"); the
// drawable name is the short one, so those three become a short/long pair and the
// group defaults to `short`. St. John's has no English label at all and gets one.
// These are the only hand-set names here — everything else is the dump verbatim.
//
// CONTESTED AND DEPENDENT TERRITORIES, PROVISIONAL. Beyond the 197 sovereign
// states the dump yields, the lists carry territories placed on one axis: how far
// the world sees each as its own state versus part of another. Recognition (or
// perception) mostly won => `omittable` (shown, removable); mostly lost =>
// `omitted` (hidden, offerable). Five rules span the axis (see RULES). The already
// present trio (Kosovo, Taiwan, Palestine) is only classified; the rest are added
// here as English-only placeholders (`?` for the other eight languages) — the full
// multilingual fill comes later with the geonames expansion, so it is not done
// twice. Countries only for now; capitals inherit the pattern in that same round.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serializeTopic } from "../lib/serialize.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RAW = join(ROOT, "data-raw", "geography");
const OUT = join(ROOT, "data", "topics", "geography", "human");

const LANGS = ["en", "de", "es", "fr", "it", "ja", "ko", "zh-Hans", "zh-Hant"];
const TODAY = new Date().toISOString().slice(0, 10);

/** P30 item → our folder. Insular Oceania folds into Oceania (see header); Eurasia
 *  is absent on purpose, so it drops. */
const CONTINENT = {
  Q15: "africa",
  Q46: "europe",
  Q48: "asia",
  Q49: "north-america",
  Q18: "south-america",
  Q55643: "oceania",
  Q538: "oceania",
};

/** The landmass name in data-raw/geography/continents/, per folder — the source
 *  of each category's title, so the continent names are the dump's, not typed. */
const LANDMASS = {
  africa: "Africa",
  asia: "Asia",
  europe: "Europe",
  "north-america": "North America",
  "south-america": "South America",
  oceania: "Oceania",
  antarctica: "Antarctica",
};

/** Region-centred globe per continent; ❄️ for the empty one. */
const ICON = {
  africa: "🌍",
  europe: "🌍",
  asia: "🌏",
  "north-america": "🌎",
  "south-america": "🌎",
  oceania: "🌏",
  antarctica: "❄️",
};

/** Population tier boundaries, descending. Five tiers: ≥100M, ≥20M, ≥5M, ≥1M, <1M. */
const CUTS = [100e6, 20e6, 5e6, 1e6];
const tierOf = (pop) => {
  for (let i = 0; i < CUTS.length; i++) if (pop >= CUTS[i]) return i;
  return CUTS.length;
};

/** The five tier conditions, localized. The tooltip supplies "inhabitants", so the
 *  condition is the bare quantity — and CJK counts in 万/億, not millions. */
const NUM = {
  en: ["100 million", "20 million", "5 million", "1 million"],
  de: ["100 Millionen", "20 Millionen", "5 Millionen", "1 Million"],
  es: ["100 millones", "20 millones", "5 millones", "1 millón"],
  fr: ["100 millions", "20 millions", "5 millions", "1 million"],
  it: ["100 milioni", "20 milioni", "5 milioni", "1 milione"],
  ja: ["1億", "2000万", "500万", "100万"],
  ko: ["1억", "2000만", "500만", "100만"],
  "zh-Hans": ["1亿", "2000万", "500万", "100万"],
  "zh-Hant": ["1億", "2000萬", "500萬", "100萬"],
};
const MORE = {
  en: (n) => `${n} or more`,
  de: (n) => `${n} und mehr`,
  es: (n) => `${n} o más`,
  fr: (n) => `${n} ou plus`,
  it: (n) => `${n} o più`,
  ja: (n) => `${n}以上`,
  ko: (n) => `${n} 이상`,
  "zh-Hans": (n) => `${n}及以上`,
  "zh-Hant": (n) => `${n}及以上`,
};
// The last tier is the cumulative floor: the ruler selects everything down to it,
// so the honest bound is "more than 0", not "under 1 million" — which would read
// as excluding the larger tiers the selection has in fact already swept in.
const ABOVE_ZERO = {
  en: "more than 0",
  de: "mehr als 0",
  es: "más de 0",
  fr: "plus de 0",
  it: "più di 0",
  ja: "0より多い",
  ko: "0보다 많음",
  "zh-Hans": "多于0",
  "zh-Hant": "多於0",
};
/** `tierConditions`, one locString per tier. */
function tierConditions() {
  const cond = (fn) => Object.fromEntries(LANGS.map((l) => [l, fn(l)]));
  return [
    cond((l) => MORE[l](NUM[l][0])),
    cond((l) => MORE[l](NUM[l][1])),
    cond((l) => MORE[l](NUM[l][2])),
    cond((l) => MORE[l](NUM[l][3])),
    cond((l) => ABOVE_ZERO[l]),
  ];
}

/** Topic titles, localized. Groups reuse them. */
const T_COUNTRIES = { en: "Countries", de: "Länder", es: "Países", fr: "Pays", it: "Paesi", ja: "国", ko: "국가", "zh-Hans": "国家", "zh-Hant": "國家" };
const T_CAPITALS = { en: "Capitals", de: "Hauptstädte", es: "Capitales", fr: "Capitales", it: "Capitali", ja: "首都", ko: "수도", "zh-Hans": "首都", "zh-Hant": "首都" };

/** The ruler hovers. `{condition}` is the population band just brought in; the
 *  empty text names the ordering at rest. The "Selected:" / "Mostly selected:"
 *  prefix is a locale string the frontend prepends, so the text is bare and carries
 *  no absolute — the list is what it is, "Countries with …", not "every country".
 *  Seven UI languages; the capitals are tiered by their country's population. */
const RULER_COUNTRIES = {
  text: {
    en: "Countries with {condition} inhabitants",
    de: "Länder mit {condition} Einwohnern",
    es: "países con {condition} habitantes",
    fr: "pays comptant {condition} habitants",
    it: "paesi con {condition} abitanti",
    ja: "人口が{condition}の国",
    ko: "인구가 {condition}인 국가",
  },
  empty: {
    en: "Ranked by population.",
    de: "Nach Einwohnerzahl geordnet.",
    es: "Ordenados por población.",
    fr: "Classés par population.",
    it: "Ordinati per popolazione.",
    ja: "人口順。",
    ko: "인구순 정렬.",
  },
};
const RULER_CAPITALS = {
  text: {
    en: "Capitals of countries with {condition} inhabitants",
    de: "Hauptstädte von Ländern mit {condition} Einwohnern",
    es: "capitales de países con {condition} habitantes",
    fr: "capitales de pays comptant {condition} habitants",
    it: "capitali di paesi con {condition} abitanti",
    ja: "人口が{condition}の国の首都",
    ko: "인구가 {condition}인 국가의 수도",
  },
  empty: {
    en: "Ranked by their country's population.",
    de: "Nach Einwohnerzahl des Landes geordnet.",
    es: "Ordenadas por la población de su país.",
    fr: "Classées par la population de leur pays.",
    it: "Ordinate per la popolazione del loro paese.",
    ja: "国の人口順。",
    ko: "해당 국가의 인구순 정렬.",
  },
};

/** The short name for the three formal-label states, per language. `long` is the
 *  dump's formal label; this is what the row shows. */
const SHORT = {
  Q148: { en: "China", de: "China", es: "China", fr: "Chine", it: "Cina", ja: "中国", ko: "중국", "zh-Hans": "中国", "zh-Hant": "中國" },
  Q29999: { en: "Netherlands", de: "Niederlande", es: "Países Bajos", fr: "Pays-Bas", it: "Paesi Bassi", ja: "オランダ", ko: "네덜란드", "zh-Hans": "荷兰", "zh-Hant": "荷蘭" },
  Q756617: { en: "Denmark", de: "Dänemark", es: "Dinamarca", fr: "Danemark", it: "Danimarca", ja: "デンマーク", ko: "덴마크", "zh-Hans": "丹麦", "zh-Hant": "丹麥" },
};
/** Names the dump is missing outright — St. John's carries no English label. */
const NAME_OVERRIDE = { "Q36262.en": "St. John's" };

/** Every content language but English — the `?` list a placeholder entry carries,
 *  saying it has no name yet in any of them. */
const OTHER = LANGS.filter((l) => l !== "en");
/** A provisional entry: an English name and nothing else yet. The geonames round
 *  fills the eight `?` languages later, so no name is hand-typed twice. */
const placeholder = (en) => ({ en, "?": [...OTHER] });

/** The five recognition rules, in axis order (most state-like first). `default`
 *  decides the array: `omittable` shows by default, `omitted` hides. Every rule
 *  carries a count, so its `reason` opens lower-case with the countable noun and
 *  reads on from the "up to N" the panel prepends — seven UI languages, like every
 *  other prose in the data; the two Chinese UIs fall back to English. */
const RULES = {
  "contested-states": {
    default: "omittable",
    reason: {
      en: "sovereign states with contested international recognition",
      de: "souveräne Staaten mit umstrittener internationaler Anerkennung",
      es: "estados soberanos con reconocimiento internacional disputado",
      fr: "états souverains à la reconnaissance internationale contestée",
      it: "stati sovrani dal riconoscimento internazionale conteso",
      ja: "国際的承認が争われている主権国家",
      ko: "국제적 승인이 논쟁 중인 주권 국가",
    },
  },
  "autonomous-territories": {
    default: "omittable",
    reason: {
      en: "highly autonomous territories often taken for countries of their own",
      de: "weitgehend autonome Gebiete, die viele für eigene Länder halten",
      es: "territorios muy autónomos que muchos toman por países propios",
      fr: "territoires très autonomes que beaucoup prennent pour des pays à part entière",
      it: "territori molto autonomi che molti scambiano per paesi a sé",
      ja: "独自の国と見なされがちな高度な自治地域",
      ko: "독립국으로 여겨지곤 하는 고도 자치 지역",
    },
  },
  "associated-states": {
    default: "omittable",
    reason: {
      en: "states in free association with another, with limited recognition",
      de: "Staaten in freier Assoziation mit einem anderen, begrenzt anerkannt",
      es: "estados en libre asociación con otro, de reconocimiento limitado",
      fr: "états en libre association avec un autre, à reconnaissance limitée",
      it: "stati in libera associazione con un altro, dal riconoscimento limitato",
      ja: "他国と自由連合を結ぶ、承認が限られた国",
      ko: "다른 나라와 자유연합을 맺은, 승인이 제한된 국가",
    },
  },
  "breakaway-states": {
    default: "omitted",
    reason: {
      en: "self-declared states recognized by few or no UN members",
      de: "selbsterklärte Staaten, von wenigen oder keinen UN-Mitgliedern anerkannt",
      es: "estados autoproclamados reconocidos por pocos o ningún miembro de la ONU",
      fr: "états autoproclamés reconnus par peu ou aucun membre de l'ONU",
      it: "stati autoproclamati riconosciuti da pochi o nessun membro dell'ONU",
      ja: "国連加盟国のごく一部にしか、あるいは全く承認されない自称国家",
      ko: "유엔 회원국 중 극소수만이 또는 전혀 승인하지 않는 자칭 국가",
    },
  },
  dependencies: {
    default: "omitted",
    reason: {
      en: "territories generally regarded as part of a sovereign state",
      de: "Gebiete, die allgemein als Teil eines souveränen Staates gelten",
      es: "territorios considerados en general parte de un Estado soberano",
      fr: "territoires généralement considérés comme partie d'un État souverain",
      it: "territori generalmente considerati parte di uno Stato sovrano",
      ja: "一般に主権国家の一部と見なされる地域",
      ko: "일반적으로 주권 국가의 일부로 여겨지는 지역",
    },
  },
};

/** The territories to add, per continent folder — each an English-only placeholder
 *  filed under one rule and given a rough population for its tier. Provisional and
 *  meant to be edited by hand; the geonames round fills the languages and the rest
 *  of the set. */
const EXTRA = [
  // omittable — shown by default, offered for removal
  { folder: "africa", en: "Western Sahara", pop: 600000, rule: "contested-states" },
  { folder: "asia", en: "Hong Kong", pop: 7500000, rule: "autonomous-territories" },
  { folder: "north-america", en: "Puerto Rico", pop: 3200000, rule: "autonomous-territories" },
  { folder: "oceania", en: "Cook Islands", pop: 15000, rule: "associated-states" },
  { folder: "oceania", en: "Niue", pop: 1600, rule: "associated-states" },
  // omitted — hidden by default, offered by the bar
  { folder: "africa", en: "Somaliland", pop: 5700000, rule: "breakaway-states" },
  { folder: "europe", en: "Northern Cyprus", pop: 380000, rule: "breakaway-states" },
  { folder: "europe", en: "Transnistria", pop: 470000, rule: "breakaway-states" },
  { folder: "asia", en: "Abkhazia", pop: 245000, rule: "breakaway-states" },
  { folder: "asia", en: "South Ossetia", pop: 55000, rule: "breakaway-states" },
  { folder: "north-america", en: "Greenland", pop: 56000, rule: "dependencies" },
  { folder: "europe", en: "Faroe Islands", pop: 54000, rule: "dependencies" },
  { folder: "oceania", en: "Guam", pop: 170000, rule: "dependencies" },
];

/** Territories already in the dump that only need classifying — the widely (if
 *  contestedly) recognized trio, by the continent folder each sits in. */
const CONTESTED_EXISTING = {
  europe: ["Kosovo"],
  asia: ["Taiwan", "Palestine"],
};

/** The `omitted` / `omittable` rules for one continent: every rule that has a
 *  territory here, its `match` the names of those territories. Same id, same
 *  reason across continents — so the synthesized world topic merges them into one
 *  row (see mergeGroups) — while each continent matches only its own. */
function rulesFor(folder) {
  const names = {};
  const add = (id, name) => (names[id] ??= []).push(name);
  for (const e of EXTRA) if (e.folder === folder) add(e.rule, e.en);
  for (const name of CONTESTED_EXISTING[folder] ?? []) add("contested-states", name);
  const omitted = [];
  const omittable = [];
  for (const id of Object.keys(names).sort()) {
    const rule = { id, match: names[id].slice().sort(), reason: RULES[id].reason, count: true };
    (RULES[id].default === "omitted" ? omitted : omittable).push(rule);
  }
  return { omitted, omittable };
}

async function readColumns(dir) {
  const out = {};
  for (const lang of LANGS) {
    const text = await readFile(join(RAW, dir, `${lang}.txt`), "utf8");
    for (const row of text.split(/\r?\n/).filter(Boolean)) {
      const [key, name] = row.split("\t");
      (out[key] ??= {})[lang] = name;
    }
  }
  return out;
}

async function readStructure() {
  const text = await readFile(join(RAW, "countries", "structure.tsv"), "utf8");
  return text
    // Tolerate CRLF dumps: without this a Windows-checked-out structure.tsv leaves
    // a trailing \r on the last column (the capital Q-id), and every lookup misses.
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const [country, iso, pop, continents, capitals] = l.split("\t");
      return {
        country,
        pop: pop ? Number(pop) : 0,
        continents: continents ? continents.split("|") : [],
        capitals: capitals ? capitals.split("|") : [],
      };
    });
}

async function readContinentNames() {
  const out = {};
  for (const lang of LANGS) {
    const text = await readFile(join(RAW, "continents", `${lang}.txt`), "utf8");
    for (const row of text.split(/\r?\n/).filter(Boolean)) {
      const [key, name] = row.split("\t");
      (out[key] ??= {})[lang] = name;
    }
  }
  return out;
}

/** A localized name map for one item, with the keys equal to English dropped and a
 *  `?` listing the languages it has no name in — the shape the dump produced for
 *  the continents. `shortByLang` (only the three formal states) turns each language
 *  into a short/long pair. */
function entry(qid, names, shortByLang) {
  const map = {};
  const unknown = [];
  for (const lang of LANGS) {
    const long = NAME_OVERRIDE[`${qid}.${lang}`] ?? names?.[lang];
    if (!long) {
      unknown.push(lang);
      continue;
    }
    const short = shortByLang?.[lang];
    map[lang] = short && short !== long ? { short, long } : long;
  }
  if (map.en === undefined) throw new Error(`no English name for ${qid}`);
  for (const lang of LANGS) {
    if (lang !== "en" && JSON.stringify(map[lang]) === JSON.stringify(map.en)) delete map[lang];
  }
  if (unknown.length) map["?"] = unknown;
  return map;
}

function topic(id, title, tiers, sources, rulerTooltip, omitted, omittable) {
  return {
    id,
    title,
    languages: LANGS,
    sources,
    lastUpdated: TODAY,
    lastChecked: TODAY,
    defaultNames: "short",
    ...(omitted?.length ? { omitted } : {}),
    ...(omittable?.length ? { omittable } : {}),
    tiers,
    tierConditions: tierConditions(),
    rulerTooltip,
    // Each continent's list merges one level up into a single "Countries" /
    // "Capitals" topic under human/, a sibling of languages. See src/lib/tree.ts.
    inheritsUpwards: 1,
  };
}

const SRC_COUNTRIES = [
  "Names & population: Wikidata sovereign states (P31 Q3624078) — https://www.wikidata.org/wiki/Q3624078 (see scripts/geography/dump-country-data.mjs)",
];
const SRC_CAPITALS = [
  "Names: Wikidata capitals (P36) of the sovereign states — https://www.wikidata.org/wiki/Property:P36 (see scripts/geography/dump-country-data.mjs)",
];

async function main() {
  const structure = await readStructure();
  const countryNames = await readColumns("countries");
  const capitalNames = await readColumns(join("countries", "capitals"));
  const continentNames = await readContinentNames();

  // Each country to every continent it spans, deduplicated (Q538 and Q55643 both
  // map to oceania), sorted by population within a continent.
  const byContinent = {};
  for (const c of structure) {
    const folders = [...new Set(c.continents.map((q) => CONTINENT[q]).filter(Boolean))];
    for (const f of folders) (byContinent[f] ??= []).push(c);
  }

  const order = Object.keys(byContinent)
    .sort((a, b) => sumPop(byContinent[b]) - sumPop(byContinent[a]))
    .concat("antarctica");

  const summary = [];
  for (let i = 0; i < order.length; i++) {
    const folder = order[i];
    const dir = join(OUT, folder);
    await mkdir(dir, { recursive: true });

    // Category label, from the continent dump.
    const catTitle = pick(continentNames[LANDMASS[folder]]);
    await write(join(dir, "_category.json"), category(catTitle, ICON[folder], i + 1));

    if (folder === "antarctica") {
      await write(join(dir, "antarctica.json"), cricket());
      summary.push(`${folder.padEnd(14)} (empty joke)`);
      continue;
    }

    const list = byContinent[folder].slice().sort((a, b) => b.pop - a.pop);

    // Real countries plus this continent's provisional placeholders, tiered by
    // population together — an omittable placeholder then shows in its true band.
    const extras = EXTRA.filter((e) => e.folder === folder);
    const items = [
      ...list.map((c) => ({ pop: c.pop, make: () => entry(c.country, countryNames[c.country], SHORT[c.country]) })),
      ...extras.map((e) => ({ pop: e.pop, make: () => placeholder(e.en) })),
    ].sort((a, b) => b.pop - a.pop);
    const countryTiers = [[], [], [], [], []];
    for (const it of items) countryTiers[tierOf(it.pop)].push(it.make());
    const { omitted, omittable } = rulesFor(folder);
    await write(join(dir, "countries.json"), topic(`${folder}-countries`, T_COUNTRIES, countryTiers, SRC_COUNTRIES, RULER_COUNTRIES, omitted, omittable));

    // Capitals take their country's tier; a country with several contributes each.
    // The placeholders stay out of the capitals for now (see header).
    const capTiers = [[], [], [], [], []];
    for (const c of list) for (const cap of c.capitals) capTiers[tierOf(c.pop)].push(entry(cap, capitalNames[cap]));
    await write(join(dir, "capitals.json"), topic(`${folder}-capitals`, T_CAPITALS, capTiers, SRC_CAPITALS, RULER_CAPITALS));

    summary.push(`${folder.padEnd(14)} ${String(items.length).padStart(3)} countries, tiers ${countryTiers.map((t) => t.length).join("/")}`);
  }

  for (const s of summary) console.log(s);
}

const sumPop = (list) => list.reduce((n, c) => n + c.pop, 0);
const pick = (names) => Object.fromEntries(LANGS.filter((l) => names?.[l]).map((l) => [l, names[l]]));

function category(title, icon, order) {
  return { title, icon, order };
}

/** The Antarctica gag: a category that looks like the others and turns out empty.
 *  A flat topic with no entries and no ruler. */
function cricket() {
  return {
    id: "antarctica",
    title: { short: "", long: { en: "*crickets*", de: "*Grillenzirpen*" } },
    icon: "🦗",
    languages: LANGS,
    hideRulers: true,
    words: [],
  };
}

async function write(path, data) {
  const text = path.endsWith("_category.json") ? JSON.stringify(data, null, 2) + "\n" : serializeTopic(data);
  if (process.argv.includes("--write")) {
    await writeFile(path, text, "utf8");
  }
}

main().catch((err) => {
  console.error("build-country-data failed:", err.message);
  process.exit(1);
});
