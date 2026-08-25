// Fetches the geonames alternate names of the territories that sovereign-territories.json
// gives a `geonameId` rather than an ISO code — the six that are not ISO countries
// (Abkhazia, South Ossetia, Somaliland, Transnistria, Northern Cyprus, Iraqi Kurdistan)
// and so are absent from geonames-names.json. Output geonames-territories.json keeps the
// same per-language flag shape (via dump-geonames' `namesFor`), keyed by geonameId, so
// build-country-data buckets these the same way it buckets the ISO ones.
//
//   GEONAMES_USER=<username> node scripts/geography/dump-geonames-territories.mjs
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { namesFor } from "./dump-geonames.mjs";

const USER = process.env.GEONAMES_USER;
if (!USER) {
  console.error("Set GEONAMES_USER to a geonames username with the free web services enabled.");
  process.exit(1);
}

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "data-raw", "geography", "countries");
const API = "http://api.geonames.org";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path) {
  const url = `${API}/${path}${path.includes("?") ? "&" : "?"}username=${encodeURIComponent(USER)}`;
  const data = await (await fetch(url)).json();
  if (data.status) throw new Error(`${data.status.message} (value ${data.status.value})`);
  return data;
}

const territories = JSON.parse(await readFile(join(DIR, "sovereign-territories.json"), "utf8"));
const out = {};
for (const [name, m] of Object.entries(territories)) {
  if (name === "_comment" || !m.geonameId) continue;
  const full = await api(`getJSON?geonameId=${m.geonameId}&style=full`);
  out[m.geonameId] = { name, geonameId: m.geonameId, names: namesFor(full.alternateNames) };
  console.log(`${name} (${m.geonameId}): ${full.alternateNames?.length ?? 0} alternate names`);
  await sleep(150);
}

const sorted = Object.fromEntries(Object.keys(out).sort((a, b) => Number(a) - Number(b)).map((k) => [k, out[k]]));
await writeFile(join(DIR, "geonames-territories.json"), `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
console.log(`wrote ${Object.keys(out).length} territories → geonames-territories.json`);
