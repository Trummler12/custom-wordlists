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

/** Our spelling → Wikidata's, which lower-cases script subtags. */
const LANGS = {
  en: "en",
  de: "de",
  es: "es",
  fr: "fr",
  it: "it",
  ja: "ja",
  ko: "ko",
  "zh-Hans": "zh-hans",
  "zh-Hant": "zh-hant",
};

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

async function labelsFor(ids) {
  const out = {};
  for (let i = 0; i < ids.length; i += 45) {
    const r = await api("www.wikidata.org", {
      action: "wbgetentities",
      props: "labels",
      languages: Object.values(LANGS).join("|"),
      ids: ids.slice(i, i + 45).join("|"),
    });
    for (const [q, e] of Object.entries(r.entities)) out[q] = e.labels ?? {};
  }
  return out;
}

/** `<key> ⇥ <name>` per line, the shape the other dumps use. */
async function writeColumns(dir, keys, nameOf, total) {
  await mkdir(dir, { recursive: true });
  for (const [tag, wd] of Object.entries(LANGS)) {
    const lines = keys.map((k) => [k, nameOf(k, wd)]).filter(([, n]) => n);
    await writeFile(join(dir, `${tag}.txt`), lines.map((l) => l.join("\t")).join("\n") + "\n", "utf8");
    console.log(`  ${tag.padEnd(8)} ${String(lines.length).padStart(3)} of ${total}`);
  }
}

async function main() {
  // --- Landmasses ------------------------------------------------------------
  const landLabels = await labelsFor(Object.values(LANDMASSES));
  const landKeys = Object.keys(LANDMASSES);
  console.log(`continents — ${landKeys.length}`);
  await writeColumns(
    join(OUT, "continents"),
    landKeys,
    (k, wd) => landLabels[LANDMASSES[k]]?.[wd]?.value,
    landKeys.length,
  );

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

  // Structure and names apart, as everywhere else: a corrected area should not
  // arrive as a diff across nine name columns.
  const structure = ranked.map((t) => {
    const a = areaOf(t);
    return [
      t,
      band(t),
      parentOf.get(t) ?? "",
      items[t] ?? "",
      a ? a.sr.toFixed(5) : "",
      a ? a.de : "",
    ].join("\t");
  });
  await writeFile(
    join(OUT, "plates", "structure.tsv"),
    "# name\tband\tparent\twikidata\tsteradian (Bird 2003)\tde (Bird table)\n" +
      structure.join("\n") +
      "\n",
    "utf8",
  );

  const labels = await labelsFor([...new Set(Object.values(items).filter(Boolean))]);
  console.log(`plates — ${ranked.length} (${bird.length} of them with a Bird area)`);
  await writeColumns(
    join(OUT, "plates"),
    ranked,
    // Two fallbacks, both for plates Wikidata has no item for: English is the
    // key itself — the article title is the name — and German comes from the
    // Bird table, which prints twenty plates the German Wikipedia never wrote.
    (k, wd) =>
      labels[items[k]]?.[wd]?.value ?? (wd === "en" ? k : wd === "de" ? areaOf(k)?.de : undefined),
    ranked.length,
  );

  const unmatched = bird.filter((r) => ![...byItem.values(), ...byName.values()].includes(r));
  if (unmatched.length) console.log("Bird rows unmatched:", unmatched.map((r) => r.de).join(", "));
}

main().catch((err) => {
  console.error("dump-plate-data failed:", err.message);
  process.exit(1);
});
