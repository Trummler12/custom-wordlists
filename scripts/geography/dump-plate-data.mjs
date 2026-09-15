// Writes data-raw/geography/{continents,plates}/ — the raw material for the
// "Continents & Plates" topic.
//
//   node scripts/geography/dump-plate-data.mjs
//
// THREE SOURCES, EACH FOR ONE THING.
//
// 1. Wikidata labels, for the NAMES. Nine hand-listed items for the continents,
//    and whatever the plate articles are attached to. Same reasoning as the
//    element dump: `rdfs:label` is CLDR-adjacent and agrees with itself across
//    languages, so nothing here is hand-typed.
//
// 2. en:List of tectonic plates, for the GROUPING. It is the only place that
//    sorts plates into major / minor / micro, and it is prose rather than a
//    table — the areas it does quote come from a different compilation than the
//    one below and disagree with it about the ORDER (North America 75.9 M km²
//    puts it ahead of Eurasia and Africa; Bird puts it behind both). So the
//    membership is taken and the numbers are not.
//
// 3. de:Liste der tektonischen Platten, for the AREAS. It reproduces Bird (2003)
//    in full: 52 plates, one steradian column, summing to exactly 4π. One
//    source, one column, internally consistent — that is the ranking.
//
//    It is also a better German name list than Wikidata is: twenty of its rows
//    are red links, so the German Wikipedia has no article and Wikidata
//    therefore no `de` label — but the table names the plate anyway. Those
//    twenty are matched by name through REDLINKS below, since there is no item
//    to match them by.
//
// WHAT IS NOT HERE. Ancient plates (the en page's last section) — the list is
// about plates that exist, and how to carry the extinct ones is still open.
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "data-raw", "geography");
const UA = { "User-Agent": "custom-wordlists/1.0 (https://github.com/Trummler12/custom-wordlists)" };

/** The word-list output languages: skribbl's full set, a superset of the nine the
 *  locale-like strings use. Names only — declaring one here carries its names into the
 *  data; the app's CONTENT_LANGS still gates what a reader can pick, so the extra ones
 *  sit dormant until the interface grows into them. Mirrors build-country-data. */
const NAME_LANGS = [
  "en", "de", "es", "fr", "it", "ja", "ko", "zh-Hans", "zh-Hant",
  "pt", "ru", "tr", "pl", "nl", "bg", "cs", "da", "et", "fi", "el", "he",
  "hu", "lv", "mk", "no", "ro", "sr", "sk", "sv", "tl",
];

/** Our content tag → the Wikidata label tags to read it from, first hit wins — the same
 *  chains build-country-data uses (Chinese scripts, Norwegian nb/nn, Tagalog fil). */
const LANG_SRC = {
  en: ["en"], de: ["de"], es: ["es"], fr: ["fr"], it: ["it"], ja: ["ja"], ko: ["ko"],
  "zh-Hans": ["zh-hans", "zh-cn", "zh-sg", "zh-my", "zh"],
  "zh-Hant": ["zh-hant", "zh-tw", "zh-hk", "zh-mo"],
  pt: ["pt", "pt-br", "pt-pt"], ru: ["ru"], tr: ["tr"], pl: ["pl"], nl: ["nl"],
  bg: ["bg"], cs: ["cs"], da: ["da"], et: ["et"], fi: ["fi"], el: ["el"], he: ["he"],
  hu: ["hu"], lv: ["lv"], mk: ["mk"], no: ["no", "nb", "nn"], ro: ["ro"], sr: ["sr"],
  sk: ["sk"], sv: ["sv"], tl: ["tl", "fil"],
};
/** Every Wikidata label tag to request, flattened from the chains above. The build reads
 *  the preferred name for a content tag by walking these sources (see LANG_SRC there). */
const WD_TAGS = [...new Set(Object.values(LANG_SRC).flat())];

/** The landmasses, by hand. `P31 wd:Q5107` answers with fifteen items and most of
 *  them are noise — *African Continent* beside *Africa*, *Turtle Island*,
 *  *Afro-Eurasia*. For nine entries the list is shorter than the filter would be,
 *  and the names still come from the query.
 *
 *  Not all nine are continents, because what this table is for is the short form
 *  of a plate's name: Eurasia and India name plates without being continents, and
 *  Asia, Europe and Oceania are continents that name no plate.
 *
 *  Australia is the country (`Q408`) rather than the continent (`Q3960`), whose
 *  label is a description in half our languages — *Australian continent*,
 *  *continent australien*, *오스트레일리아 대륙*. The continent's name is the
 *  country's name, and this table holds names. */
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

/** Bird rows the German Wikipedia links but has no article for, and so no
 *  Wikidata item to match on. English title → the table's German name. */
const REDLINKS = {
  "Altiplano plate": "Altiplanoplatte",
  "Banda Sea plate": "Bandaseeplatte",
  "Bird's Head plate": "Bird's-Head-Platte",
  "Conway Reef plate": "Conway-Riff-Platte",
  "Easter microplate": "Osterplatte",
  "Futuna plate": "Futunaplatte",
  "Galápagos microplate": "Galapagosplatte",
  "Kermadec plate": "Kermadecplatte",
  "Maoke plate": "Maokeplatte",
  "Mariana plate": "Marianenplatte",
  "Molucca Sea plate": "Molukkenseeplatte",
  "New Hebrides plate": "Neue-Hebriden-Platte",
  "Niuafo'ou plate": "Niuafo'ou-Platte",
  "North Andes plate": "Nordandenplatte",
  "North Bismarck plate": "Nordbismarckplatte",
  "Panama plate": "Panamaplatte",
  "Solomon Sea plate": "Salomonenseeplatte",
  "South Bismarck plate": "Südbismarckplatte",
  "Timor plate": "Timorplatte",
  "Woodlark plate": "Woodlarkplatte",
};

async function api(host, params) {
  const url = `https://${host}/w/api.php?${new URLSearchParams({ format: "json", ...params })}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

/** Page wikitext, which is where the structure lives — the rendered HTML would
 *  have to be un-templated again. */
async function wikitext(host, page) {
  const r = await api(host, { action: "parse", prop: "wikitext", page });
  if (r.error) throw new Error(`${page}: ${r.error.info}`);
  return r.parse.wikitext["*"];
}

/** The English page's three bands, and — for the microplates — which plate each
 *  sits under. That nesting is the only order the section has: it lists no areas,
 *  so a list built from it cannot be sorted by size and groups by parent instead.
 *
 *  Only the outermost parent is kept. A handful nest twice (Gorda under Juan de
 *  Fuca under Pacific), and the group a reader wants is the plate they have heard
 *  of. Document order within a group is preserved, which keeps those pairs
 *  together anyway.
 *
 *  Names arrive three ways on that page — a template, a bare link, and plain text
 *  for the parent lines — and a parser that knew only the template would drop
 *  entries silently, which is the kind of gap nobody notices for a year. */
function bands(text) {
  const between = (a, b) => text.slice(text.indexOf(a), text.indexOf(b));
  const links = (s) => [...s.matchAll(/\{\{annotated link\|([^|}]+)/g)].map((m) => m[1].trim());
  const name = (s) =>
    (s.match(/\{\{annotated link\|([^|}]+)/) ?? s.match(/\[\[([^\]|]+)/) ?? [, s])[1]
      ?.replace(/<ref.*/s, "")
      .trim();

  const micro = [];
  let parent = "";
  for (const [, depth, rest] of between("===Microplates===", "==Ancient tectonic plates==")
    .matchAll(/^(\*+) *(.+)$/gm)) {
    const title = name(rest);
    if (!title) continue;
    if (depth.length === 1) parent = title;
    else micro.push({ title, parent });
  }
  return {
    major: links(between("===Major plates===", "===Minor plates===")),
    minor: links(between("===Minor plates===", "===Microplates===")),
    micro,
  };
}

/** Bird's table: article title, the name as printed, and the area. */
function birdTable(text) {
  const tbl = text.slice(text.indexOf('{| class="wikitable'), text.indexOf("== Weitere Platten"));
  const rows = [];
  for (const row of tbl.split(/\n\|-\n/).slice(1)) {
    const name = row.match(/^\| \[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/);
    const area = row.match(/align="right" \| ([\d,]+) \|\| align="right" \| ([\d,]+) ?%/);
    if (name && area) {
      rows.push({
        title: name[1],
        de: name[2] || name[1],
        sr: Number(area[1].replace(",", ".")),
        pct: Number(area[2].replace(",", ".")),
      });
    }
  }
  return rows;
}

/** Wikibase items for a list of article titles, following redirects back to the
 *  title we asked about. A title that redirects into a section has no item of
 *  its own and answers `null`. */
async function itemsFor(host, titles) {
  const out = {};
  for (let i = 0; i < titles.length; i += 45) {
    const r = await api(host, {
      action: "query",
      redirects: "1",
      prop: "pageprops",
      ppprop: "wikibase_item",
      titles: titles.slice(i, i + 45).join("|"),
    });
    const back = {};
    for (const n of r.query.normalized ?? []) back[n.to] = n.from;
    for (const n of r.query.redirects ?? []) back[n.to] = back[n.from] ?? n.from;
    for (const p of Object.values(r.query.pages)) {
      out[back[p.title] ?? p.title] = p.pageprops?.wikibase_item ?? null;
    }
  }
  return out;
}

/** Wikidata terms for a chunk of items: the preferred label and every alias, keyed by the
 *  raw Wikidata language tag as arrays of `{ name, pref? | alias? }` — the rich shape the
 *  country and language dumps use, so a reader sees every form a plate is known by. Only
 *  the tags Wikidata actually carries appear; the build reads the pref through LANG_SRC. */
async function termsFor(ids) {
  const out = {};
  for (let i = 0; i < ids.length; i += 45) {
    const r = await api("www.wikidata.org", {
      action: "wbgetentities",
      props: "labels|aliases",
      languages: WD_TAGS.join("|"),
      ids: ids.slice(i, i + 45).join("|"),
    });
    for (const [q, e] of Object.entries(r.entities)) {
      const rich = {};
      for (const [tag, l] of Object.entries(e.labels ?? {})) (rich[tag] ??= []).push({ name: l.value, pref: true });
      for (const [tag, arr] of Object.entries(e.aliases ?? {}))
        for (const a of arr) (rich[tag] ??= []).push({ name: a.value, alias: true });
      out[q] = rich;
    }
  }
  return out;
}

/** A WDQS SPARQL query, returning its result bindings. */
async function wdqs(query) {
  const url = `https://query.wikidata.org/sparql?${new URLSearchParams({ format: "json", query })}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`WDQS HTTP ${res.status} ${res.statusText}`);
  return (await res.json()).results.bindings;
}

/** Every Wikidata item that is P31 tectonic plate (Q215680) — the catch-all the English
 *  list doesn't band. WDQS rather than the article API: many have no article to reach. */
async function tectonicPlateItems() {
  return (await wdqs("SELECT ?i WHERE { ?i wdt:P31 wd:Q215680. }")).map((b) => b.i.value.split("/").pop());
}

/** Surface areas (km²) from Wikidata P2046, for the items that carry one. An item with
 *  several P2046 values (with and without islands, say) keeps the largest, so a re-dump is
 *  deterministic rather than taking whichever row WDQS returned last. */
async function areasFor(ids) {
  const values = ids.map((q) => `wd:${q}`).join(" ");
  const rows = await wdqs(`SELECT ?i (MAX(?ar) AS ?a) WHERE { VALUES ?i { ${values} } ?i wdt:P2046 ?ar. } GROUP BY ?i`);
  const out = {};
  for (const b of rows) out[b.i.value.split("/").pop()] = Math.round(Number(b.a.value));
  return out;
}
/** A steradian of Earth's surface in km² (mean radius 6371 km), to read Bird's shares. */
const STERAD_TO_KM2 = 6371 ** 2;

/** The leading summary ahead of the rich name map, so a reader sees what an entry is at a
 *  glance: `name` (the English preferred label) and, where known, `area` in km². */
const itemObj = (rich, area) => {
  const name = (rich.en ?? []).find((t) => t.pref)?.name;
  return { ...(name ? { name } : {}), ...(area != null ? { area } : {}), names: rich };
};

/** A single JSON per dump, `{ <Q-id>: { name, area?, names } }` — keyed by Wikidata Q-id
 *  like the country and language dumps, not a column per language. */
async function writeNames(path, obj) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

/** Per-language coverage: how many of the ids carry a name our content tag can read. */
const logCoverage = (heading, byId, ids) => {
  console.log(heading);
  for (const t of NAME_LANGS) {
    const c = ids.filter((q) => LANG_SRC[t].some((s) => byId[q]?.names?.[s]?.length)).length;
    console.log(`  ${t.padEnd(8)} ${String(c).padStart(3)} of ${ids.length}`);
  }
};

async function main() {
  // --- Landmasses ------------------------------------------------------------
  const landIds = Object.values(LANDMASSES);
  const landTerms = await termsFor(landIds);
  const landAreas = await areasFor(landIds);
  const landNames = Object.fromEntries(
    landIds.map((q) => [q, itemObj(landTerms[q] ?? {}, landAreas[q])]),
  );
  await writeNames(join(OUT, "continents", "continent-names.json"), landNames);
  logCoverage(`continents — ${landIds.length}`, landNames, landIds);

  // --- Plates ----------------------------------------------------------------
  const en = bands(await wikitext("en.wikipedia.org", "List of tectonic plates"));
  const bird = birdTable(await wikitext("de.wikipedia.org", "Liste der tektonischen Platten"));

  const parentOf = new Map(en.micro.map((m) => [m.title, m.parent]));
  const titles = [...new Set([...en.major, ...en.minor, ...en.micro.map((m) => m.title)])];
  const items = await itemsFor("en.wikipedia.org", titles);
  const deItems = await itemsFor("de.wikipedia.org", bird.map((r) => r.title));

  const byItem = new Map();
  const byName = new Map(bird.map((r) => [r.de, r]));
  for (const r of bird) if (deItems[r.title]) byItem.set(deItems[r.title], r);
  const areaOf = (t) => byItem.get(items[t]) ?? byName.get(REDLINKS[t]) ?? null;

  const band = (t) =>
    en.major.includes(t) ? "major" : en.minor.includes(t) ? "minor" : "micro";
  // By area where there is one, and by the page's own order where there isn't —
  // which is the grouping by parent plate, so the unmeasured tail keeps the only
  // structure anybody has given it.
  const seen = new Map(titles.map((t, i) => [t, i]));
  const ranked = titles
    .slice()
    .sort((a, b) => (areaOf(b)?.sr ?? -1) - (areaOf(a)?.sr ?? -1) || seen.get(a) - seen.get(b));

  await mkdir(join(OUT, "plates"), { recursive: true });

  // The Wikidata catch-all: every P31 tectonic plate the English bands miss, minus the
  // ones already resolved from the article list (same Q-id = same plate, not two). They
  // carry no band and no area, so they are written under band "unknown", keyed by their
  // English label. The build tiers them into the "unknown classification" floor and does
  // the name-level dedup (a redlink and its item, differing only in case) and the junk
  // filtering a bare P31 query can't do. A catch-all whose key already names a banded
  // plate keeps the banded row here; a case-only difference is left for the build.
  const known = new Set(Object.values(items).filter(Boolean));
  const extra = (await tectonicPlateItems()).filter((q) => !known.has(q));
  const plateIds = [...new Set([...known, ...extra])];
  const plateTerms = await termsFor(plateIds);
  const enLabel = (q) => (plateTerms[q]?.en ?? []).find((t) => t.pref)?.name ?? q;
  const rankedSet = new Set(ranked);
  const extraByKey = new Map();
  for (const q of extra) {
    const k = enLabel(q);
    if (!rankedSet.has(k) && !extraByKey.has(k)) extraByKey.set(k, q);
  }
  const extraKeys = [...extraByKey.keys()];

  // Structure and names apart, as everywhere else: a corrected area should not arrive as
  // a diff across the name map. structure.tsv is the identity — name ↔ Q-id, band, area —
  // and the source of a redlink's English name (the row key) and German (the Bird column).
  const rows = [
    ...ranked.map((t) => {
      const a = areaOf(t);
      return [t, band(t), parentOf.get(t) ?? "", items[t] ?? "", a ? a.sr.toFixed(5) : "", a ? a.de : ""];
    }),
    ...extraKeys.map((k) => [k, "unknown", "", extraByKey.get(k), "", ""]),
  ];
  await writeFile(
    join(OUT, "plates", "structure.tsv"),
    "# name\tband\tparent\twikidata\tsteradian (Bird 2003)\tde (Bird table)\n" +
      rows.map((r) => r.join("\t")).join("\n") +
      "\n",
    "utf8",
  );

  // Names keyed by Q-id, like the country and language dumps: every plate Wikidata has an
  // item for — the banded ones and the deduped catch-all. A redlink has no item, so no
  // entry here; the build takes its English name from structure.tsv and its German from
  // the Bird column. The leading `area` is Bird's share in km² where there is one, else
  // Wikidata's P2046 (which only a single plate carries).
  const nameIds = [...new Set([...known, ...extraByKey.values()])];
  const plateP2046 = await areasFor(nameIds);
  const birdKm2 = {};
  for (const t of ranked) {
    const a = areaOf(t);
    if (a && items[t]) birdKm2[items[t]] = Math.round(a.sr * STERAD_TO_KM2);
  }
  const plateNames = Object.fromEntries(
    nameIds.map((q) => [q, itemObj(plateTerms[q] ?? {}, birdKm2[q] ?? plateP2046[q])]),
  );
  await writeNames(join(OUT, "plates", "plate-names.json"), plateNames);
  console.log(
    `plates — ${ranked.length} banded (${bird.length} with a Bird area) + ${extraKeys.length} Wikidata catch-all`,
  );
  logCoverage("plate name coverage:", plateNames, nameIds);

  const unmatched = bird.filter((r) => ![...byItem.values(), ...byName.values()].includes(r));
  if (unmatched.length) console.log("Bird rows unmatched:", unmatched.map((r) => r.de).join(", "));
}

main().catch((err) => {
  console.error("dump-plate-data failed:", err.message);
  process.exit(1);
});
