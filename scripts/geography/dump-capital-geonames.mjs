// Fetches the geonames alternate names of every capital, so the Capitals topic can
// carry the same pref/short/long/others variants the Countries topic got from V3a —
// Wikidata's one label per language is the pref, geonames adds the rest (Kyiv/Kiev,
// Washington vs Washington, D.C.).
//
// The link is Wikidata → geonames, not geonames' country-level `capital` field: that
// field is a single string, so it can neither name a second capital nor be resolved
// to a city entity. Instead each capital's Wikidata item (structure.tsv keys them by
// Q-id) carries P1566, its GeoNames id, which getJSON turns into alternate names.
// Output capital-geonames-names.json keeps the same per-language flag shape as the
// country dump (via dump-geonames' `namesFor`), keyed by the capital's Q-id so the
// builder joins it to structure.tsv the same way it joins the labels.
//
//   GEONAMES_USER=<username> node scripts/geography/dump-capital-geonames.mjs
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
const WD_ENDPOINT = "https://query.wikidata.org/sparql";
const UA = { "User-Agent": "custom-wordlists/1.0 (https://github.com/Trummler12/custom-wordlists)" };
const GEO_API = "http://api.geonames.org";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** `Q…` from a Wikidata entity URI. */
const qid = (uri) => uri.replace(/^.*\/entity\//, "");

async function wikidata(sparql) {
  const url = `${WD_ENDPOINT}?format=json&query=${encodeURIComponent(sparql)}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`Wikidata HTTP ${res.status} ${res.statusText}`);
  return (await res.json()).results.bindings;
}

async function geonames(path) {
  const url = `${GEO_API}/${path}${path.includes("?") ? "&" : "?"}username=${encodeURIComponent(USER)}`;
  const data = await (await fetch(url)).json();
  if (data.status) throw new Error(`${data.status.message} (value ${data.status.value})`);
  return data;
}

// The capital Q-ids, in structure order (each country's capitals adjacent), deduped.
const tsv = (await readFile(join(DIR, "structure.tsv"), "utf8")).split(/\r?\n/).filter((l) => l && !l.startsWith("#"));
const capQids = [...new Set(tsv.flatMap((l) => (l.split("\t")[4] ?? "").split("|").filter(Boolean)))];
console.log(`capitals — ${capQids.length}`);

// One Wikidata call maps every capital to its GeoNames id (P1566), where it has one.
const rows = await wikidata(
  `SELECT ?capital ?g WHERE { VALUES ?capital { ${capQids.map((q) => `wd:${q}`).join(" ")} } ?capital wdt:P1566 ?g. }`,
);
const geoIdByQid = new Map(rows.map((r) => [qid(r.capital.value), r.g.value]));

const out = {};
const missing = [];
for (const q of capQids) {
  const gid = geoIdByQid.get(q);
  if (!gid) {
    missing.push(q);
    continue;
  }
  try {
    const full = await geonames(`getJSON?geonameId=${gid}&style=full`);
    out[q] = { geonameId: Number(gid), names: namesFor(full.alternateNames) };
  } catch (e) {
    missing.push(`${q} (geonameId ${gid}): ${e.message}`);
  }
  await sleep(150); // stay well under the free tier's hourly burst limit
}

await writeFile(join(DIR, "capital-geonames-names.json"), `${JSON.stringify(out, null, 2)}\n`, "utf8");
console.log(`wrote ${Object.keys(out).length} capitals → capital-geonames-names.json`);
if (missing.length) console.warn(`no GeoNames id / failed (${missing.length}):\n  ${missing.join("\n  ")}`);
