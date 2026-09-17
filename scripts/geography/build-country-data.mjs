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
// NAMES COME FROM THE DUMP, BUCKETED. Each language's Wikidata forms bucket into
// pref/short/long/others (see bucket-names.mjs). Where Wikidata's label is a formal or
// realm title (China, the Kingdoms of the Netherlands and Denmark) or missing (St. John's),
// name-overrides.json asserts the common drawable name — the only hand-set names here.
//
// TWO LANGUAGE SETS. Names are harvested for NAME_LANGS — skribbl's full set — so the data
// is ready in every language the picker may later offer; the app's CONTENT_LANGS still gates
// what a reader can pick, so the extra ones lie dormant. The topic TITLES (T_COUNTRIES,
// T_CAPITALS) carry that full set too, pre-filled and dormant; the other locale-like prose
// (tier conditions, ruler tooltips, sovereignty/coverage reasons) stays on LANGS, the nine
// official interface languages (Chinese in both scripts included).
//
// SOVEREIGNTY & RECOGNITION, A 2D MATRIX (C10). Beyond the UN sovereign states the dump
// yields, the lists carry the curated territories (sovereign-territories.json) placed in a
// matrix: de-jure recognition (row) × de-facto control (column). Each non-regular cell is
// one `icon:"sovereignty"` rule, so the frontend shows them as a grid the reader fills as a
// staircase; the default staircase splits them into `omittable` (shown) and `omitted`
// (hidden). See CELLS. The recognised trio (Kosovo, Taiwan, Palestine) are already sovereign
// states in the dump, so they take only their cell; the rest are their own entries, their
// names harvested from Wikidata like every other. The trio's capitals are in the dump and
// carry the cell through; the other territories' capitals stay out of the capitals lists.
//
// GEOGUESSR / STREET VIEW COVERAGE. Two more omittable rules, tagged with the
// Pegman icon so the frontend shows them as a three-level radio (all / with
// coverage / reliable only) instead of checkboxes: `no-coverage` and
// `rare-coverage`. A country is fully covered, only sparsely (rare), or not at all:
// geohints' official list gives covered-or-not, and the RARE_COVERAGE hand list
// overrides the thin ones to "covered but sparse". The capitals inherit the same
// rules, matched on the capital's own name.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { writeCoverage } from "./coverage.mjs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serializeTopic } from "../lib/serialize.mjs";
import { bucketLangWiki } from "./bucket-names.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RAW = join(ROOT, "data-raw", "geography");
const OUT = join(ROOT, "data", "topics", "geography", "human");

// The locale-like languages: the ones whose *strings* (titles, tier conditions, ruler
// tooltips, sovereignty/coverage reasons, continent names) this script writes by hand.
// Kept small on purpose — these are UI text, and grow with the interface, not the data.
const LANGS = ["en", "de", "es", "fr", "it", "ja", "ko", "zh-Hans", "zh-Hant", "ru"];
// The word-list output languages: skribbl's full set, so a country/capital *name* is
// harvested for every language the picker may later offer. A superset of LANGS, listed
// explicitly so its order (which the coverage column order follows) stays put as LANGS
// grows. Names only — declaring a language here carries its names into the data, but the
// app's CONTENT_LANGS still gates what a reader can pick, so the extra ones sit dormant
// until the interface grows into them (see docs/Language-Roadmap.md, src/locale CONTENT_LANGS).
const NAME_LANGS = [
  "en", "de", "es", "fr", "it", "ja", "ko", "zh-Hans", "zh-Hant",
  "pt", "ru", "tr", "pl", "nl", "bg", "cs", "da", "et", "fi", "el", "he",
  "hu", "lv", "mk", "no", "ro", "sr", "sk", "sv", "tl",
];
const TODAY = new Date().toISOString().slice(0, 10);

/** Our content tag => the Wikidata tags to read it from, first hit wins. Wikidata files a
 *  Chinese name under any of zh / zh-cn / zh-tw / … as readily as under the explicit
 *  zh-hans / zh-hant, so the script slot needs a fallback chain; Norwegian rides nb/nn,
 *  and Portuguese/Tagalog their regional siblings. The rest are 1:1. */
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

/** One entity's dumped names (per Wikidata tag) bucketed into our content tags. `keep` is the
 *  abbreviation whitelist (USA, UK) that survives the code filter. */
const bucketWiki = (names, keep) => {
  const out = {};
  for (const lang of NAME_LANGS) {
    const v = bucketLangWiki(pickLang(names, lang), keep);
    if (v !== undefined) out[lang] = v;
  }
  return out;
};

/** The English name a bucketed entity draws by, for matching the coverage/recognition lists. */
const enNameOf = (b) => {
  const en = b?.en;
  if (en === undefined) return undefined;
  return typeof en === "string" ? en : en.pref ?? en.short ?? en.long;
};

/** Every English form of a bucketed entity — pref, short, long and others — since the
 *  coverage lists spell a country however geohints happens to ({pref:"Czechia",
 *  long:"Czech Republic"} must still match the "Czech Republic" line). */
const enForms = (b) => {
  const en = b?.en;
  if (en === undefined) return [];
  if (typeof en === "string") return [en];
  return [en.pref, en.short, en.long, ...(en.others ?? [])].filter((s) => s !== undefined);
};

/** P30 item => our folder. Insular Oceania folds into Oceania (see header); Eurasia
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

/** The landmass Q-id in data-raw/geography/continents/continent-names.json, per folder —
 *  the source of each category's title, so the continent names are the dump's, not typed. */
const LANDMASS = {
  africa: "Q15",
  asia: "Q48",
  europe: "Q46",
  "north-america": "Q49",
  "south-america": "Q18",
  oceania: "Q55643",
  antarctica: "Q51",
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

/** kebab id ("de-facto-recognized") to the camelCase prose key the topic-prose
 *  dictionary uses ("deFactoRecognized"), so a rule can emit its reason as an id. */
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

// @migrate (PR plan §M, Batch 3): the number-band words and the "or more" / "more than 0"
// formats now live in src/locale/topics (`bands` / `more` / `aboveZero`); this script emits
// bare band-key tokens for tierConditions and prose ids for the ruler tooltip. Still dead here
// (removed in Batch 3): the CELLS sovereignty reasons and COVERAGE prose maps (they interleave
// with the live cell/default fields). Titles (T_COUNTRIES etc.) carry all planned languages.

/** `tierConditions` as band-key tokens (same for countries and capitals): the four population
 *  bands, then the cumulative floor. The frontend composes each into "<band> or more" or
 *  "more than 0" from the topic-prose dictionary — see `resolveCondition` in src/locale/topics.
 *  The floor token ">0" must match `FLOOR` there. */
const tierConditions = () => ["100M", "20M", "5M", "1M", ">0"];

/** Topic titles, localized. Groups reuse them. */
const T_COUNTRIES = {
  en: "Countries",
  de: "Länder",
  es: "Países",
  fr: "Pays",
  it: "Paesi",
  ja: "国",
  ko: "국가",
  "zh-Hans": "国家",
  "zh-Hant": "國家",
  pt: "Países",
  ru: "Страны",
  tr: "Ülkeler",
  pl: "Kraje",
  nl: "Landen",
  bg: "Страни",
  cs: "Země",
  da: "Lande",
  et: "Riigid",
  fi: "Maat",
  el: "Χώρες",
  he: "מדינות",
  hu: "Országok",
  lv: "Valstis",
  mk: "Земји",
  no: "Land",
  ro: "Țări",
  sr: "Земље",
  sk: "Krajiny",
  sv: "Länder",
  tl: "Mga Bansa"
};
const T_CAPITALS = {
  en: "Capitals",
  de: "Hauptstädte",
  es: "Capitales",
  fr: "Capitales",
  it: "Capitali",
  ja: "首都",
  ko: "수도",
  "zh-Hans": "首都",
  "zh-Hant": "首都",
  pt: "Capitais",
  ru: "Столицы",
  tr: "Başkentler",
  pl: "Stolice",
  nl: "Hoofdsteden",
  bg: "Столици",
  cs: "Hlavní města",
  da: "Hovedstæder",
  et: "Pealinnad",
  fi: "Pääkaupungit",
  el: "Πρωτεύουσες",
  he: "ערי בירה",
  hu: "Fővárosok",
  lv: "Galvaspilsētas",
  mk: "Главни градови",
  no: "Hovedsteder",
  ro: "Capitale",
  sr: "Главни градови",
  sk: "Hlavné mestá",
  sv: "Huvudstäder",
  tl: "Mga Kabisera"
};

/** The ruler hovers, as prose ids resolved in the frontend (src/locale/topics `ruler.*`).
 *  `text` carries `{condition}`, the population band just brought in; `empty` names the
 *  ordering at rest. The "Selected:" / "Mostly selected:" prefix is a locale string the
 *  frontend prepends. The capitals are tiered by their country's population. */
const RULER_COUNTRIES = { text: "ruler.countries.text", empty: "ruler.countries.empty" };
const RULER_CAPITALS = { text: "ruler.capitals.text", empty: "ruler.capitals.empty" };

/** The icon key that groups the sovereignty cells into one matrix control. */
const SOVEREIGNTY = "sovereignty";

/** The sovereignty & recognition matrix (C10). Each non-regular cell is one rule,
 *  placed on a `[row, col]`: rows are de-jure recognition (1 universal … 4 none),
 *  columns are de-facto control (1 fully independent, 2 partially autonomous). The
 *  top-left `Reguläre Staaten` cell is the unruled base (every sovereign state no
 *  cell matches). `default` decides the array and, together, the cells form the
 *  default staircase — column 1 included through row 4, column 2 through row 3, so
 *  only the bottom-right cell (row 4, col 2) hides by default. Every
 *  reason opens lower-case with the countable noun so it reads on from the panel's
 *  "up to N"; the nine UI languages (Chinese in both scripts have their own now). */
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
      "zh-Hans": "拥有国际公认的广泛自治权的自治地区",
      "zh-Hant": "擁有國際公認的廣泛自治權的自治地區",
      ru: "автономные регионы, чьё широкое самоуправление признано на международном уровне",
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
      "zh-Hans": "获得许多（但非全部）联合国成员国承认的完全主权国家",
      "zh-Hant": "獲得許多（但非全部）聯合國成員國承認的完全主權國家",
      ru: "полностью суверенные государства, признанные многими, хотя и не всеми, членами ООН",
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
      "zh-Hans": "与他国自由联合、获得有限承认的国家",
      "zh-Hant": "與他國自由聯合、獲得有限承認的國家",
      ru: "государства в свободной ассоциации с другим, с ограниченным признанием",
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
      "zh-Hans": "仅获少数联合国成员国承认的完全自治国家",
      "zh-Hant": "僅獲少數聯合國成員國承認的完全自治國家",
      ru: "полностью самоуправляемые государства, признанные лишь несколькими членами ООН",
    },
  },
  "special-status": {
    cell: [3, 2],
    default: "omittable",
    reason: {
      en: "highly autonomous territories with a distinct international presence, often taken for countries of their own",
      de: "weitgehend autonome Gebiete mit eigenständigem internationalem Auftreten, die viele für eigene Länder halten",
      es: "territorios muy autónomos con presencia internacional propia, que muchos toman por países propios",
      fr: "territoires très autonomes à présence internationale propre, que beaucoup prennent pour des pays à part entière",
      it: "territori molto autonomi con una presenza internazionale propria, che molti scambiano per paesi a sé",
      ja: "独自の国際的存在感を持ち、独自の国と見なされがちな高度な自治地域",
      ko: "독자적 국제적 존재감을 지녀 독립국으로 여겨지곤 하는 고도 자치 지역",
      "zh-Hans": "拥有独特国际存在感、常被视为独立国家的高度自治地区",
      "zh-Hant": "擁有獨特國際存在感、常被視為獨立國家的高度自治地區",
      ru: "высокоавтономные территории с самостоятельным международным присутствием, которые часто принимают за отдельные страны",
    },
  },
  "pure-de-facto": {
    cell: [4, 1],
    default: "omittable",
    reason: {
      en: "self-declared states recognized by few or no UN members",
      de: "selbsterklärte Staaten, von wenigen oder keinen UN-Mitgliedern anerkannt",
      es: "estados autoproclamados reconocidos por pocos o ningún miembro de la ONU",
      fr: "états autoproclamés reconnus par peu ou aucun membre de l'ONU",
      it: "stati autoproclamati riconosciuti da pochi o nessun membro dell'ONU",
      ja: "国連加盟国のごく一部にしか、あるいは全く承認されない自称国家",
      ko: "유엔 회원국 중 극소수만이 또는 전혀 승인하지 않는 자칭 국가",
      "zh-Hans": "仅获极少数或未获联合国成员国承认的自称国家",
      "zh-Hant": "僅獲極少數或未獲聯合國成員國承認的自稱國家",
      ru: "самопровозглашённые государства, признанные немногими членами ООН или не признанные вовсе",
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
      "zh-Hans": "国际上被视为某主权国家一部分的自治地区",
      "zh-Hant": "國際上被視為某主權國家一部分的自治地區",
      ru: "автономные территории, на международном уровне считающиеся частью суверенного государства",
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
    const rule = { id, match: names[id].slice().sort(), count: true, icon: SOVEREIGNTY, cell: c.cell, reason: `sovereignty.${camel(id)}` };
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
  "Pitcairn Islands",
]);

/** The two coverage reasons — lower-case leading noun, so the "up to N" the panel
 *  prepends reads on. The nine UI languages, Chinese in both scripts included. */
const COVERAGE = {
  "no-coverage": {
    en: "countries with no Google Street View coverage",
    de: "Länder ohne Google-Street-View-Abdeckung",
    es: "países sin cobertura de Google Street View",
    fr: "pays sans couverture Google Street View",
    it: "paesi senza copertura di Google Street View",
    ja: "Google ストリートビュー非対応の国",
    ko: "구글 스트리트 뷰가 없는 국가",
    "zh-Hans": "没有 Google 街景覆盖的国家",
    "zh-Hant": "沒有 Google 街景覆蓋的國家",
    ru: "страны без покрытия Google Street View",
  },
  "rare-coverage": {
    en: "countries with only sparse Street View coverage",
    de: "Länder mit nur spärlicher Street-View-Abdeckung",
    es: "países con cobertura de Street View muy escasa",
    fr: "pays à couverture Street View très rare",
    it: "paesi con copertura Street View molto scarsa",
    ja: "ストリートビューがまばらな国",
    ko: "스트리트 뷰가 드문 국가",
    "zh-Hans": "街景覆盖稀疏的国家",
    "zh-Hant": "街景覆蓋稀疏的國家",
    ru: "страны лишь с редким покрытием Street View",
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
  const rule = (id, match) => ({ id, match, count: true, icon: PEGMAN, reason: `coverage.${camel(id)}` });
  const rules = [];
  const none = pick(false);
  const rare = pick(true);
  if (none.length) rules.push(rule("no-coverage", none));
  if (rare.length) rules.push(rule("rare-coverage", rare));
  return rules;
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
  // The continent dump moved to a single Q-id-keyed JSON (rich `names` arrays) with the
  // plates; read the preferred label per language from it. A continent name is a proper
  // name the dump carries in every language, so the category title takes the full
  // NAME_LANGS set — pre-filled and dormant like the country and capital names.
  const raw = JSON.parse(await readFile(join(RAW, "continents", "continent-names.json"), "utf8"));
  const out = {};
  for (const [qid, v] of Object.entries(raw)) {
    out[qid] = {};
    for (const lang of NAME_LANGS) {
      const arr = pickLang(v.names, lang);
      const term = arr?.find((t) => t.pref) ?? arr?.[0];
      if (term) out[qid][lang] = term.name;
    }
  }
  return out;
}

function topic(id, title, tiers, sources, rulerTooltip, omitted, omittable, defaultNames = "short") {
  return {
    id,
    title,
    // ja-Latn is offered but not sourced: the reader opts into romaji and the app
    // derives it from the Japanese name at render (see generatedRomaji / lib/kana).
    languages: NAME_LANGS.flatMap((l) => (l === "ja" ? ["ja", "ja-Latn"] : [l])),
    generatedRomaji: true,
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
  "Names & variants: Wikidata labels, official names (P1448) and short names (P1813) — https://www.wikidata.org/wiki/Q3624078 (see scripts/geography/dump-country-data.mjs)",
  "Population & tiers: Wikidata sovereign states (P1082 on P31 Q3624078) — https://www.wikidata.org/wiki/Q3624078 (see scripts/geography/dump-country-data.mjs)",
];
const SRC_CAPITALS = [
  "Names & variants: Wikidata labels, official and short names of the capitals (P36) — https://www.wikidata.org/wiki/Property:P36 (see scripts/geography/dump-country-data.mjs)",
];

async function main() {
  const structure = await readStructure();
  const countryNames = JSON.parse(await readFile(join(RAW, "countries", "country-names.json"), "utf8"));
  const capitalNames = JSON.parse(await readFile(join(RAW, "countries", "capital-names.json"), "utf8"));
  const continentNames = await readContinentNames();
  const official = await readOfficial();
  // Curated overrides for entities whose Wikidata label is a formal/realm title or missing
  // (name-overrides.json), keyed by Q-id then content tag. See its _comment.
  const OVERRIDE = Object.fromEntries(
    Object.entries(JSON.parse(await readFile(join(RAW, "countries", "name-overrides.json"), "utf8"))).filter(
      ([k]) => k !== "_comment",
    ),
  );
  // Abbreviations that survive the code filter: the legit ones (name-abbreviations.json) that
  // also read as a word — 3+ letters, letters only, so U.S. / HK / UK stay out of the lists.
  const KEEP = new Set(
    JSON.parse(await readFile(join(RAW, "countries", "name-abbreviations.json"), "utf8")).legit.filter((s) =>
      /^\p{Lu}{3,}$/u.test(s),
    ),
  );

  // Every dumped entity's names bucketed into pref/short/long/others per content language.
  const bucketByQid = new Map();
  for (const [qid, v] of Object.entries(countryNames)) bucketByQid.set(qid, bucketWiki(v.names, KEEP));
  const capBucketByQid = new Map();
  for (const [qid, v] of Object.entries(capitalNames)) capBucketByQid.set(qid, bucketWiki(v.names, KEEP));

  /** A localized name map for one bucketed item: OVERRIDE wins, else the bucket; languages
   *  equal to English dropped, the missing ones listed under `?`. */
  const localized = (qid, buckets) => {
    const b = buckets.get(qid) ?? {};
    const map = {};
    const unknown = [];
    for (const lang of NAME_LANGS) {
      const v = OVERRIDE[qid]?.[lang] ?? b[lang];
      if (v === undefined || v === "") {
        unknown.push(lang);
        continue;
      }
      map[lang] = v;
    }
    if (map.en === undefined) throw new Error(`no English name for ${qid}`);
    for (const lang of NAME_LANGS) {
      if (lang !== "en" && JSON.stringify(map[lang]) === JSON.stringify(map.en)) delete map[lang];
    }
    if (unknown.length) map["?"] = unknown;
    return map;
  };
  const countryEntry = (qid) => localized(qid, bucketByQid);

  // The English name (and every English form) a country matches the coverage/recognition
  // lists by — OVERRIDE's common name (China's "China") winning over the bucket's formal label.
  const bucketEn = (qid) => (OVERRIDE[qid]?.en !== undefined ? { en: OVERRIDE[qid].en } : bucketByQid.get(qid));
  const commonEnOf = (c) => enNameOf(bucketEn(c.country));
  const enFormsOf = (qid) => enForms(bucketEn(qid));

  // Territories beyond the UN sovereign states (sovereign-territories.json, keyed by Q-id),
  // each placed in one C10 cell. Names come from the same Wikidata dump; territory-structure
  // adds each one's population and capital. The recognised trio are already sovereign states
  // in the dump, so they take only their cell.
  const TERRITORIES = Object.fromEntries(
    Object.entries(JSON.parse(await readFile(join(RAW, "countries", "sovereign-territories.json"), "utf8"))).filter(
      ([k]) => k !== "_comment",
    ),
  );
  const terrStruct = {};
  for (const line of (await readFile(join(RAW, "countries", "territory-structure.tsv"), "utf8")).split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const [q, pop, cap] = line.split("\t");
    terrStruct[q] = { pop: pop ? Number(pop) : null, capital: cap || null };
  }
  const structureQids = new Set(structure.map((c) => c.country));
  const isExisting = (qid) => structureQids.has(qid); // the trio are already sovereign states
  const territoriesOf = (folder) => Object.entries(TERRITORIES).filter(([, m]) => m.folder === folder);
  const territoryPop = (qid, m) => m.pop ?? terrStruct[qid]?.pop ?? 0;

  /** A territory's English forms — its curated name plus Wikidata's English variants — for
   *  matching against the coverage lists, the same way `enFormsOf` does for a country. */
  const territoryEnForms = (qid, m) => [m.en, ...enForms(bucketByQid.get(qid)).filter((n) => n !== m.en)];

  /** A territory's localized entry: the curated `en` is the drawable name (Wikidata labels
   *  Iraqi Kurdistan "Kurdistan" and Transnistria with its formal title), its other English
   *  forms trailing as `others`; every other language comes from the bucket. */
  const territoryEntry = (qid, m) => {
    const b = bucketByQid.get(qid) ?? {};
    const extraEn = [...new Set(enForms(b).filter((n) => n !== m.en))];
    const map = { en: extraEn.length ? { pref: m.en, others: extraEn } : m.en };
    const unknown = [];
    for (const lang of NAME_LANGS) {
      if (lang === "en") continue;
      const v = b[lang];
      if (v === undefined || v === "") {
        unknown.push(lang);
        continue;
      }
      map[lang] = v;
    }
    for (const lang of NAME_LANGS) {
      if (lang !== "en" && JSON.stringify(map[lang]) === JSON.stringify(map.en)) delete map[lang];
    }
    if (unknown.length) map["?"] = unknown;
    return map;
  };

  /** A capital's localized entry: the same bucketing as a country — the Wikidata label the
   *  pref, its official/short forms filling short/long, the rest `others`. */
  const capitalEntry = (qid) => localized(qid, capBucketByQid);
  const capEnOf = (qid) => enNameOf(OVERRIDE[qid]?.en !== undefined ? { en: OVERRIDE[qid].en } : capBucketByQid.get(qid));

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
    const newTerritories = territoriesOf(folder).filter(([qid]) => !isExisting(qid));
    const items = [
      ...list.map((c) => ({ pop: c.pop, make: () => countryEntry(c.country) })),
      ...newTerritories.map(([qid, m]) => ({ pop: territoryPop(qid, m), make: () => territoryEntry(qid, m) })),
    ].sort((a, b) => b.pop - a.pop);
    const countryTiers = [[], [], [], [], []];
    for (const it of items) countryTiers[tierOf(it.pop)].push(it.make());

    // Coverage: each real country is fully covered, only sparsely (rare), or not at
    // all. The official list gives covered-or-not; the rare hand list overrides to
    // "covered but thin". Only none and rare become rules; the capitals inherit them,
    // matched on the capital's own name (from the country => capital mapping).
    const classOfForms = (forms) => {
      if (forms.some((n) => RARE_COVERAGE.has(n))) return "rare";
      return forms.some((n) => official.has(n)) ? "full" : "none";
    };
    // Countries and this continent's new territories alike: each is fully covered, only
    // sparsely (rare), or not at all. Territories carry no capital yet, so an empty list.
    const covSubjects = [
      ...list.map((c) => ({ forms: enFormsOf(c.country), nm: commonEnOf(c), caps: c.capitals })),
      ...newTerritories.map(([qid, m]) => ({ forms: territoryEnForms(qid, m), nm: m.en, caps: [] })),
    ];
    const filtered = covSubjects
      .map((s) => ({ ...s, cls: classOfForms(s.forms) }))
      .filter((x) => x.cls !== "full");
    const covCountry = coverageRules(filtered.map((x) => ({ match: x.nm, rare: x.cls === "rare" })));
    const capItems = [];
    for (const x of filtered) {
      for (const cap of x.caps) {
        const nm = capEnOf(cap);
        if (nm) capItems.push({ match: nm, rare: x.cls === "rare" });
      }
    }
    const covCapital = coverageRules(capItems);

    // Sovereignty rules: every territory in this continent, matched by its English name
    // (a new territory's file key, the trio's common country name), sorted into the cells.
    const sovNames = {};
    for (const [qid, m] of territoriesOf(folder)) {
      (sovNames[m.cell] ??= []).push(isExisting(qid) ? enNameOf(bucketEn(qid)) : m.en);
    }
    const { omitted, omittable } = cellRules(sovNames);
    await write(join(dir, "countries.json"), topic(`${folder}-countries`, T_COUNTRIES, countryTiers, SRC_COUNTRIES, RULER_COUNTRIES, omitted, [...omittable, ...covCountry], "pref"));

    // Sovereignty on capitals: only the classified real states (the trio) have a
    // capital in the data — the placeholders have none yet — so the capitals carry
    // just those, matched on the capital's name, under the same cell as the country.
    const capSov = {};
    for (const [qid, m] of territoriesOf(folder)) {
      if (!isExisting(qid)) continue; // only the trio have a capital in the dump
      const c = list.find((x) => x.country === qid);
      for (const cap of c?.capitals ?? []) {
        const capNm = capEnOf(cap);
        if (capNm) (capSov[m.cell] ??= []).push(capNm);
      }
    }
    const { omitted: capSovOmitted, omittable: capSovOmittable } = cellRules(capSov);

    // Capitals take their country's tier; a country with several contributes each.
    // The placeholders stay out of the capitals for now (see header).
    const capTiers = [[], [], [], [], []];
    for (const c of list) for (const cap of c.capitals) capTiers[tierOf(c.pop)].push(capitalEntry(cap));
    await write(join(dir, "capitals.json"), topic(`${folder}-capitals`, T_CAPITALS, capTiers, SRC_CAPITALS, RULER_CAPITALS, capSovOmitted.length ? capSovOmitted : undefined, [...capSovOmittable, ...covCapital], "pref"));

    const none = filtered.filter((x) => x.cls === "none").length;
    const rare = filtered.length - none;
    summary.push(`${folder.padEnd(14)} ${String(items.length).padStart(3)} countries, tiers ${countryTiers.map((t) => t.length).join("/")}, coverage ${none} none / ${rare} rare`);
  }

  for (const s of summary) console.log(s);

  const WRITE = process.argv.includes("--write");
  await writeCoverage(ROOT, "countries", countryNames, NAME_LANGS, LANG_SRC, "population", WRITE);
  await writeCoverage(ROOT, "capitals", capitalNames, NAME_LANGS, LANG_SRC, "population", WRITE);
}

const sumPop = (list) => list.reduce((n, c) => n + c.pop, 0);
const pick = (names) => Object.fromEntries(NAME_LANGS.filter((l) => names?.[l]).map((l) => [l, names[l]]));

function category(title, icon, order) {
  return { title, icon, order };
}

/** The Antarctica gag: a category that looks like the others and turns out empty.
 *  A flat topic with no entries and no ruler. */
function cricket() {
  return {
    id: "antarctica",
    title: {
      short: "",
      // The empty-Antarctica gag: the sound of an awkward silence. Each language's own
      // version of it (Japanese reaches for its silence onomatopoeia シーン rather than
      // crickets); machine-written and unreviewed, like the rest of the locale text.
      long: {
        en: "*crickets*",
        de: "*Grillenzirpen*",
        es: "*grillos*",
        fr: "*bruit de grillons*",
        it: "*grilli*",
        ja: "*シーン*",
        ko: "*귀뚜라미 소리*",
        "zh-Hans": "*蟋蟀声*",
        "zh-Hant": "*蟋蟀聲*",
        pt: "*grilos*",
        ru: "*стрёкот сверчков*",
        tr: "*cırcır böcekleri*",
        pl: "*cykanie świerszczy*",
        nl: "*krekels*",
        bg: "*звук на щурци*",
        cs: "*cvrčci*",
        da: "*fårekyllinger*",
        et: "*kilkide siristamine*",
        fi: "*sirkkojen siritystä*",
        el: "*γρύλοι*",
        he: "*צרצרים*",
        hu: "*tücsökciripelés*",
        lv: "*circeņu čirkšķi*",
        mk: "*цврчење на штурци*",
        no: "*sirisser*",
        ro: "*greieri*",
        sr: "*зрикавци*",
        sk: "*cvrčky*",
        sv: "*syrsor*",
        tl: "*mga kuliglig*",
      },
    },
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
