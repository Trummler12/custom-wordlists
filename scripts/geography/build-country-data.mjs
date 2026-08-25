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
// SOVEREIGNTY & RECOGNITION, A 2D MATRIX (C10). Beyond the 197 sovereign states the
// dump yields, the lists carry territories placed in a matrix: de-jure recognition
// (row) × de-facto control (column). Each non-regular cell is one `icon:"sovereignty"`
// rule, so the frontend shows them as a grid the reader fills as a staircase; the
// default staircase splits them into `omittable` (shown) and `omitted` (hidden). See
// CELLS. The already present trio (Kosovo, Taiwan, Palestine) is only placed; the
// rest are English-only placeholders (`?` for the other eight languages), filled by
// the later geonames round so no name is typed twice. The trio also carry through to
// the capitals (their capitals are in the dump); the placeholder territories have no
// capital yet, so the rest of the capitals wait for that same round.
//
// GEOGUESSR / STREET VIEW COVERAGE. Two more omittable rules, tagged with the
// Pegman icon so the frontend shows them as a three-level radio (all / with
// coverage / reliable only) instead of checkboxes: `no-coverage` and
// `rare-coverage`. A country is fully covered, only sparsely (rare), or not at all:
// geohints' official list gives covered-or-not, and the RARE_COVERAGE hand list
// overrides the thin ones to "covered but sparse". The capitals inherit the same
// rules, matched on the capital's own name.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serializeTopic } from "../lib/serialize.mjs";
import { bucketCountry, commonEn } from "./bucket-names.mjs";

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

/** Names the dump is missing outright — St. John's carries no English label. The
 *  formal-label states (China, Netherlands, Denmark) need no override anymore: the
 *  geonames bucket picks their common name as `pref` on its own. */
const NAME_OVERRIDE = { "Q36262.en": "St. John's" };

/** Structure rows the Wikidata dump left without an ISO code, mapped by hand so they
 *  still reach their geonames names: the Kingdom of Denmark (Q756617) carries none —
 *  the code belongs to Denmark proper. */
const ISO_OVERRIDE = { Q756617: "DK" };


/** The icon key that groups the sovereignty cells into one matrix control. */
const SOVEREIGNTY = "sovereignty";

/** The sovereignty & recognition matrix (C10). Each non-regular cell is one rule,
 *  placed on a `[row, col]`: rows are de-jure recognition (1 universal … 4 none),
 *  columns are de-facto control (1 fully independent, 2 partially autonomous). The
 *  top-left `Reguläre Staaten` cell is the unruled base (every sovereign state no
 *  cell matches). `default` decides the array and, together, the cells form the
 *  default staircase — column 1 included through row 3, column 2 through row 2. Every
 *  reason opens lower-case with the countable noun so it reads on from the panel's
 *  "up to N"; seven UI languages, the two Chinese UIs falling back to English. */
const CELLS = {
  "asymmetric-autonomy": {
    cell: [1, 2],
    default: "omittable",
    reason: {
      en: "autonomous regions whose broad self-rule is internationally recognized",
      de: "autonome Regionen, deren weitreichende Selbstverwaltung völkerrechtlich anerkannt ist",
      es: "regiones autónomas cuyo amplio autogobierno está reconocido internacionalmente",
      fr: "régions autonomes dont la large autonomie est reconnue internationalement",
      it: "regioni autonome la cui ampia autonomia è riconosciuta a livello internazionale",
      ja: "広範な自治が国際的に認められている自治地域",
      ko: "폭넓은 자치가 국제적으로 인정된 자치 지역",
    },
  },
  "de-facto-recognized": {
    cell: [2, 1],
    default: "omittable",
    reason: {
      en: "fully sovereign states recognized by many, though not all, UN members",
      de: "vollständig souveräne Staaten, von vielen, aber nicht allen UN-Mitgliedern anerkannt",
      es: "estados plenamente soberanos reconocidos por muchos, aunque no todos, los miembros de la ONU",
      fr: "états pleinement souverains reconnus par de nombreux membres de l'ONU, mais pas tous",
      it: "stati pienamente sovrani riconosciuti da molti, ma non tutti, i membri dell'ONU",
      ja: "全てではないが多くの国連加盟国に承認された、完全な主権国家",
      ko: "전부는 아니지만 다수의 유엔 회원국이 승인한 완전한 주권 국가",
    },
  },
  "free-association": {
    cell: [2, 2],
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
  "de-facto-narrow": {
    cell: [3, 1],
    default: "omittable",
    reason: {
      en: "fully self-governing states recognized by only a few UN members",
      de: "vollständig selbstverwaltete Staaten, nur von wenigen UN-Mitgliedern anerkannt",
      es: "estados con autogobierno pleno reconocidos por solo unos pocos miembros de la ONU",
      fr: "états pleinement autonomes reconnus par seulement quelques membres de l'ONU",
      it: "stati pienamente autogovernati riconosciuti solo da pochi membri dell'ONU",
      ja: "ごく一部の国連加盟国のみに承認された、完全に自治を行う国家",
      ko: "소수의 유엔 회원국만이 승인한, 완전한 자치 국가",
    },
  },
  "special-status": {
    cell: [3, 2],
    default: "omitted",
    reason: {
      en: "highly autonomous territories with a distinct international presence, often taken for countries of their own",
      de: "weitgehend autonome Gebiete mit eigenständigem internationalem Auftreten, die viele für eigene Länder halten",
      es: "territorios muy autónomos con presencia internacional propia, que muchos toman por países propios",
      fr: "territoires très autonomes à présence internationale propre, que beaucoup prennent pour des pays à part entière",
      it: "territori molto autonomi con una presenza internazionale propria, che molti scambiano per paesi a sé",
      ja: "独自の国際的存在感を持ち、独自の国と見なされがちな高度な自治地域",
      ko: "독자적 국제적 존재감을 지녀 독립국으로 여겨지곤 하는 고도 자치 지역",
    },
  },
  "pure-de-facto": {
    cell: [4, 1],
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
  "classic-autonomous": {
    cell: [4, 2],
    default: "omitted",
    reason: {
      en: "autonomous territories internationally regarded as part of a sovereign state",
      de: "autonome Gebiete, die international als Teil eines souveränen Staates gelten",
      es: "territorios autónomos considerados internacionalmente parte de un Estado soberano",
      fr: "territoires autonomes internationalement considérés comme partie d'un État souverain",
      it: "territori autonomi considerati a livello internazionale parte di uno Stato sovrano",
      ja: "国際的に主権国家の一部と見なされる自治地域",
      ko: "국제적으로 주권 국가의 일부로 여겨지는 자치 지역",
    },
  },
};

/** Build `omitted` / `omittable` sovereignty rules from a `{ cellId: [names] }`
 *  map: one rule per cell that has a member, its `match` those names, sorted into
 *  the two arrays by the cell's default. Same id, cell and reason across continents
 *  — so the synthesized world topic merges them into one control (see mergeGroups)
 *  — while each continent matches only its own. */
function cellRules(names) {
  const omitted = [];
  const omittable = [];
  for (const id of Object.keys(names).sort()) {
    const c = CELLS[id];
    const rule = { id, match: names[id].slice().sort(), count: true, icon: SOVEREIGNTY, cell: c.cell, reason: c.reason };
    (c.default === "omitted" ? omitted : omittable).push(rule);
  }
  return { omitted, omittable };
}

// --- Geoguessr / Street View coverage ---------------------------------------
// Two omittable rules tagged with the Pegman icon, so the frontend lifts them out
// of the 🚫 panel into a three-level radio (all / with coverage / reliable only).
// See C8 in _untracked/PR/34-geography-elements.md.

/** The icon key that groups the two coverage rules into one control. */
const PEGMAN = "geoguessr";

/** Continent headers and the footer to skip when reading the official list. */
const GEOHINTS_HEADERS = new Set([
  "Africa", "Antarctica", "Asia", "Europe", "North America", "Oceania", "South America",
]);

/** Countries whose Street View is only *sparse* — official coverage exists but
 *  thin (China's handful of sites, Mali's few roads). They count as covered, so on
 *  the ladder they sit above no-coverage. geohints' rare-coverage list, maintained
 *  by hand (the official yes/no can't tell sparse from full); English short names,
 *  and names not in our sovereign list (Martinique, Falklands…) simply never match. */
const RARE_COVERAGE = new Set([
  "Martinique", "Falkland Islands", "South Georgia and the South Sandwich Islands",
  "Mali", "Egypt", "Tanzania", "Belarus", "Iraq", "Afghanistan",
  "British Indian Ocean Territory", "China", "Cocos (Keeling) Islands", "Vanuatu",
  "Western Sahara", // only a few main roads, caught during Morocco's official drives
]);

/** The two coverage reasons — lower-case leading noun, so the "up to N" the panel
 *  prepends reads on. Seven UI languages; the two Chinese UIs fall back to English. */
const COVERAGE = {
  "no-coverage": {
    en: "countries with no Google Street View coverage",
    de: "Länder ohne Google-Street-View-Abdeckung",
    es: "países sin cobertura de Google Street View",
    fr: "pays sans couverture Google Street View",
    it: "paesi senza copertura di Google Street View",
    ja: "Google ストリートビュー非対応の国",
    ko: "구글 스트리트 뷰가 없는 국가",
  },
  "rare-coverage": {
    en: "countries with only sparse Street View coverage",
    de: "Länder mit nur spärlicher Street-View-Abdeckung",
    es: "países con cobertura de Street View muy escasa",
    fr: "pays à couverture Street View très rare",
    it: "paesi con copertura Street View molto scarsa",
    ja: "ストリートビューがまばらな国",
    ko: "스트리트 뷰가 드문 국가",
  },
};

/** The official-coverage names, headers and footer stripped. A superset of our
 *  list (it carries dependencies too), read only as a membership test. */
async function readOfficial() {
  const text = await readFile(join(RAW, "countries", "Geoguessr", "geohints_official.txt"), "utf8");
  const out = new Set();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.includes("http") || GEOHINTS_HEADERS.has(line)) continue;
    out.add(line);
  }
  return out;
}

/** The two coverage rules for one list, from its uncovered members. `items` is
 *  `{ match, rare }` per uncovered entry (a country by its short name, a capital by
 *  its own); each rule is emitted only when it has a member. */
function coverageRules(items) {
  const pick = (rare) => items.filter((i) => i.rare === rare).map((i) => i.match).sort();
  const rule = (id, match) => ({ id, match, count: true, icon: PEGMAN, reason: COVERAGE[id] });
  const rules = [];
  const none = pick(false);
  const rare = pick(true);
  if (none.length) rules.push(rule("no-coverage", none));
  if (rare.length) rules.push(rule("rare-coverage", rare));
  return rules;
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
        iso,
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

function topic(id, title, tiers, sources, rulerTooltip, omitted, omittable, defaultNames = "short") {
  return {
    id,
    title,
    languages: LANGS,
    sources,
    lastUpdated: TODAY,
    lastChecked: TODAY,
    defaultNames,
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
  "Names & variants: geonames country info and alternate names — https://www.geonames.org/countries/ (see scripts/geography/dump-geonames.mjs)",
  "Population & tiers: Wikidata sovereign states (P31 Q3624078) — https://www.wikidata.org/wiki/Q3624078 (see scripts/geography/dump-country-data.mjs)",
];
const SRC_CAPITALS = [
  "Names: Wikidata capitals (P36) of the sovereign states — https://www.wikidata.org/wiki/Property:P36 (see scripts/geography/dump-country-data.mjs)",
];

async function main() {
  const structure = await readStructure();
  const countryNames = await readColumns("countries");
  const capitalNames = await readColumns(join("countries", "capitals"));
  const continentNames = await readContinentNames();
  const official = await readOfficial();
  const geo = JSON.parse(await readFile(join(RAW, "countries", "geonames-names.json"), "utf8"));

  // geonames names per country QID, bucketed into pref/short/long/others and matched
  // to the Wikidata dump by ISO code. The names come from geonames — richer, several
  // variants per language; population, tiers and continents stay Wikidata's.
  const geoBucketByQid = new Map();
  for (const c of structure) {
    const iso = ISO_OVERRIDE[c.country] ?? c.iso;
    if (iso && geo[iso]) geoBucketByQid.set(c.country, bucketCountry(geo[iso].names, iso, LANGS));
  }

  /** A country's localized entry: names from its geonames bucket, the Wikidata dump as
   *  the per-language fallback, languages equal to English dropped and the missing ones
   *  listed under `?` — the same shape `entry` makes. */
  const countryEntry = (qid) => {
    const geoB = geoBucketByQid.get(qid);
    const wiki = countryNames[qid];
    const map = {};
    const unknown = [];
    for (const lang of LANGS) {
      const v = geoB?.[lang] ?? NAME_OVERRIDE[`${qid}.${lang}`] ?? wiki?.[lang];
      if (v === undefined || v === "") {
        unknown.push(lang);
        continue;
      }
      map[lang] = v;
    }
    if (map.en === undefined) throw new Error(`no English name for ${qid}`);
    for (const lang of LANGS) {
      if (lang !== "en" && JSON.stringify(map[lang]) === JSON.stringify(map.en)) delete map[lang];
    }
    if (unknown.length) map["?"] = unknown;
    return map;
  };

  /** The common English name for matching against the coverage and recognition lists:
   *  the geonames English pref, or the Wikidata English name where geonames has none. */
  const commonEnOf = (c) => commonEn(geoBucketByQid.get(c.country)) ?? countryNames[c.country]?.en;

  /** Every English form of a country — pref, short, long and the others — for matching
   *  against the coverage lists, which spell a country however geohints happens to
   *  ({pref:"Czechia", long:"Czech Republic"} must match the "Czech Republic" line). */
  const enFormsOf = (c) => {
    const en = geoBucketByQid.get(c.country)?.en;
    if (en === undefined) {
      const w = countryNames[c.country]?.en;
      return w ? [w] : [];
    }
    if (typeof en === "string") return [en];
    const others = en.others === undefined ? [] : Array.isArray(en.others) ? en.others : [en.others];
    return [en.pref, en.short, en.long, ...others].filter((s) => s !== undefined);
  };

  // Territories beyond the ISO sovereign states (sovereign-territories.json), each placed
  // in one C10 cell. Names come from geonames: by ISO from the country dump, or by
  // geonameId from the territory dump for the six non-ISO ones. The recognised trio are
  // already countries in the dump, so they take only their cell.
  const TERRITORIES = Object.fromEntries(
    Object.entries(JSON.parse(await readFile(join(RAW, "countries", "sovereign-territories.json"), "utf8"))).filter(
      ([k]) => k !== "_comment",
    ),
  );
  const TERR_NAMES = JSON.parse(await readFile(join(RAW, "countries", "geonames-territories.json"), "utf8"));
  const structureIsos = new Set(structure.map((c) => c.iso).filter(Boolean));
  const isExisting = (m) => Boolean(m.iso && structureIsos.has(m.iso));
  const territoriesOf = (folder) => Object.entries(TERRITORIES).filter(([, m]) => m.folder === folder);
  const territoryPop = (m) => m.pop ?? (m.iso ? geo[m.iso]?.population : undefined) ?? 0;

  /** A territory's English forms — its curated name plus the geonames English variants —
   *  for matching against the coverage lists, the same way `enFormsOf` does for a country. */
  const territoryEnForms = (name, m) => {
    const names = m.iso ? geo[m.iso]?.names : TERR_NAMES[m.geonameId]?.names;
    const en = (names ? bucketCountry(names, m.iso ?? String(m.geonameId), LANGS) : {}).en;
    const forms =
      en === undefined
        ? []
        : typeof en === "string"
          ? [en]
          : [en.pref, en.short, en.long, ...(en.others ?? [])].filter((s) => s !== undefined);
    return [name, ...forms.filter((n) => n !== name)];
  };

  /** A territory's localized entry: the curated file key is the English name (geonames
   *  labels Iraqi Kurdistan "Kurdistan" and Transnistria with its formal title), while
   *  geonames supplies the other languages and the English variants (as `others`). */
  const territoryEntry = (name, m) => {
    const names = m.iso ? geo[m.iso]?.names : TERR_NAMES[m.geonameId]?.names;
    const bucket = names ? bucketCountry(names, m.iso ?? String(m.geonameId), LANGS) : {};
    const geoEn = bucket.en;
    const enForms =
      geoEn === undefined
        ? []
        : typeof geoEn === "string"
          ? [geoEn]
          : [geoEn.pref, geoEn.short, geoEn.long, ...(geoEn.others ?? [])].filter((s) => s !== undefined);
    const extraEn = [...new Set(enForms.filter((n) => n !== name))];
    const map = { en: extraEn.length ? { pref: name, others: extraEn } : name };
    const unknown = [];
    for (const lang of LANGS) {
      if (lang === "en") continue;
      const v = bucket[lang];
      if (v === undefined || v === "") {
        unknown.push(lang);
        continue;
      }
      map[lang] = v;
    }
    for (const lang of LANGS) {
      if (lang !== "en" && JSON.stringify(map[lang]) === JSON.stringify(map.en)) delete map[lang];
    }
    if (unknown.length) map["?"] = unknown;
    return map;
  };

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

    // Real countries plus this continent's non-country territories, tiered by population
    // together — a territory then shows in its true band.
    const newTerritories = territoriesOf(folder).filter(([, m]) => !isExisting(m));
    const items = [
      ...list.map((c) => ({ pop: c.pop, make: () => countryEntry(c.country) })),
      ...newTerritories.map(([n, m]) => ({ pop: territoryPop(m), make: () => territoryEntry(n, m) })),
    ].sort((a, b) => b.pop - a.pop);
    const countryTiers = [[], [], [], [], []];
    for (const it of items) countryTiers[tierOf(it.pop)].push(it.make());

    // Coverage: each real country is fully covered, only sparsely (rare), or not at
    // all. The official list gives covered-or-not; the rare hand list overrides to
    // "covered but thin". Only none and rare become rules; the capitals inherit them,
    // matched on the capital's own name (from the country → capital mapping).
    const classOfForms = (forms) => {
      if (forms.some((n) => RARE_COVERAGE.has(n))) return "rare";
      return forms.some((n) => official.has(n)) ? "full" : "none";
    };
    // Countries and this continent's new territories alike: each is fully covered, only
    // sparsely (rare), or not at all. Territories carry no capital yet, so an empty list.
    const covSubjects = [
      ...list.map((c) => ({ forms: enFormsOf(c), nm: commonEnOf(c), caps: c.capitals })),
      ...newTerritories.map(([n, m]) => ({ forms: territoryEnForms(n, m), nm: n, caps: [] })),
    ];
    const filtered = covSubjects
      .map((s) => ({ ...s, cls: classOfForms(s.forms) }))
      .filter((x) => x.cls !== "full");
    const covCountry = coverageRules(filtered.map((x) => ({ match: x.nm, rare: x.cls === "rare" })));
    const capItems = [];
    for (const x of filtered) {
      for (const cap of x.caps) {
        const nm = capitalNames[cap]?.en;
        if (nm) capItems.push({ match: nm, rare: x.cls === "rare" });
      }
    }
    const covCapital = coverageRules(capItems);

    // Sovereignty rules: every territory in this continent, matched by its English name
    // (a new territory's file key, the trio's common country name), sorted into the cells.
    const sovNames = {};
    for (const [n, m] of territoriesOf(folder)) {
      const c = isExisting(m) ? list.find((x) => x.iso === m.iso) : undefined;
      (sovNames[m.cell] ??= []).push(c ? commonEnOf(c) : n);
    }
    const { omitted, omittable } = cellRules(sovNames);
    await write(join(dir, "countries.json"), topic(`${folder}-countries`, T_COUNTRIES, countryTiers, SRC_COUNTRIES, RULER_COUNTRIES, omitted, [...omittable, ...covCountry], "pref"));

    // Sovereignty on capitals: only the classified real states (the trio) have a
    // capital in the data — the placeholders have none yet — so the capitals carry
    // just those, matched on the capital's name, under the same cell as the country.
    const capSov = {};
    for (const [, m] of territoriesOf(folder)) {
      if (!isExisting(m)) continue; // only the trio have a capital in the dump
      const c = list.find((x) => x.iso === m.iso);
      for (const cap of c?.capitals ?? []) {
        const capNm = capitalNames[cap]?.en;
        if (capNm) (capSov[m.cell] ??= []).push(capNm);
      }
    }
    const { omitted: capSovOmitted, omittable: capSovOmittable } = cellRules(capSov);

    // Capitals take their country's tier; a country with several contributes each.
    // The placeholders stay out of the capitals for now (see header).
    const capTiers = [[], [], [], [], []];
    for (const c of list) for (const cap of c.capitals) capTiers[tierOf(c.pop)].push(entry(cap, capitalNames[cap]));
    await write(join(dir, "capitals.json"), topic(`${folder}-capitals`, T_CAPITALS, capTiers, SRC_CAPITALS, RULER_CAPITALS, capSovOmitted.length ? capSovOmitted : undefined, [...capSovOmittable, ...covCapital]));

    const none = filtered.filter((x) => x.cls === "none").length;
    const rare = filtered.length - none;
    summary.push(`${folder.padEnd(14)} ${String(items.length).padStart(3)} countries, tiers ${countryTiers.map((t) => t.length).join("/")}, coverage ${none} none / ${rare} rare`);
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
