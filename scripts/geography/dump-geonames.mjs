// Dumps country-name variants in our nine content languages from the geonames API
// into data-raw/geography/countries/geonames-names.json — a sibling of C1's Wikidata
// dump, added because geonames carries the several common names per language that
// Wikidata does not (Taiwan alone has four in English). One `countryInfo` call lists
// the ~250 ISO countries with their geonameId and facts; one `getJSON?style=full`
// per country yields its `alternateNames`, which this reduces to our languages,
// preferred name first, historic names dropped, Chinese split into Hans/Hant.
//
//   GEONAMES_USER=<username> node scripts/geography/dump-geonames.mjs
//
// The username is a free geonames account with the web services enabled; it is read
// from the environment so it never lands in the repo. The output is a faithful
// capture — build-country-data (V3) buckets each language's list into short / long /
// others, so re-bucketing needs no second trip to the network.
import { writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const USER = process.env.GEONAMES_USER;
if (!USER) {
  console.error("Set GEONAMES_USER to a geonames username with the free web services enabled.");
  process.exit(1);
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "data-raw", "geography", "countries", "geonames-names.json");
const API = "http://api.geonames.org";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** A geonames JSON call, username appended, its error status turned into a throw. */
async function api(path) {
  const url = `${API}/${path}${path.includes("?") ? "&" : "?"}username=${encodeURIComponent(USER)}`;
  const data = await (await fetch(url)).json();
  if (data.status) throw new Error(`${data.status.message} (value ${data.status.value})`);
  return data;
}

/** One country's `alternateNames` reduced to our languages: per language the distinct
 *  names, each keeping the geonames flags (`pref`/`short`/`colloq`) that the bucketing
 *  in V3 needs — they are not reliable on their own (geonames' preferred name is the
 *  formal one for Germany yet the common one for the US), so the capture keeps every
 *  name and every flag and leaves the short/long/others call to the builder. Historic
 *  names are dropped. geonames tags Chinese as `zh` (mixed script), `zh-Hant` and
 *  `zh-TW`; the traditional tags are traditional, and the `zh` names they don't
 *  already hold are the simplified ones. */
function namesFor(alt) {
  const byTag = new Map();
  for (const a of alt ?? []) {
    if (!a.lang || a.isHistoric) continue;
    if (!byTag.has(a.lang)) byTag.set(a.lang, []);
    byTag.get(a.lang).push(a);
  }
  // Distinct names in geonames' own order, each with only the flags it carries.
  const compact = (list) => {
    if (!list?.length) return undefined;
    const seen = new Set();
    const out = [];
    for (const a of list) {
      if (seen.has(a.name)) continue;
      seen.add(a.name);
      const e = { name: a.name };
      if (a.isPreferredName) e.pref = true;
      if (a.isShortName) e.short = true;
      if (a.isColloquial) e.colloq = true;
      out.push(e);
    }
    return out;
  };

  const traditional = [...(byTag.get("zh-Hant") ?? []), ...(byTag.get("zh-TW") ?? [])];
  const tradNames = new Set(traditional.map((a) => a.name));
  const simplified = (byTag.get("zh") ?? []).filter((a) => !tradNames.has(a.name));

  const names = {};
  const put = (lang, list) => {
    const v = compact(list);
    if (v) names[lang] = v;
  };
  for (const lang of ["en", "de", "es", "fr", "it", "ja", "ko"]) put(lang, byTag.get(lang));
  put("zh-Hant", traditional);
  put("zh-Hans", simplified);
  return names;
}

async function main() {
  const { geonames: countries = [] } = await api("countryInfoJSON");
  console.log(`countryInfo: ${countries.length} countries`);

  const out = {};
  const failed = [];
  for (const c of countries) {
    if (!c.geonameId) continue;
    try {
      const full = await api(`getJSON?geonameId=${c.geonameId}&style=full`);
      out[c.countryCode] = {
        geonameId: c.geonameId,
        isoAlpha3: c.isoAlpha3,
        population: Number(c.population) || 0,
        capital: c.capital || undefined,
        continent: c.continentName,
        names: namesFor(full.alternateNames),
      };
    } catch (e) {
      failed.push(`${c.countryCode} (${c.countryName}): ${e.message}`);
    }
    await sleep(150); // stay well under the free tier's hourly burst limit
  }

  // Stable key order, so a re-run diffs only where the data actually moved.
  const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
  await writeFile(OUT, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
  console.log(`wrote ${Object.keys(out).length} countries → ${OUT}`);
  if (failed.length) console.warn(`failed (${failed.length}):\n  ${failed.join("\n  ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
