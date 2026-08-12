// Writes data-raw/gaming/pokemon/<list>/<lang>.txt from PokéAPI's own source data:
// one file per language, `<id> ⇥ <name>` per line, sorted by id.
//
// Generated rather than pasted. The generation dumps were assembled by hand, and
// that is how gen-9 ended up with Crocalor at dex 901 instead of 910 — a
// transposition that would have mis-tiered every Pokémon after it. A generated
// dump can't do that, and re-running this reproduces the files exactly.
//
// The source is the CSVs rather than the REST API: one file carries every entry in
// every language, where /api/v2/item/{id} would be 2000-odd requests for the same
// thing.
//
//   node scripts/pokemon/dump-names.mjs items
//   node scripts/pokemon/dump-names.mjs moves
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const BASE = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv";

/** What can be dumped: the folder under data-raw → the CSV holding its names.
 *
 *  Listed rather than derived, because the shape has to be checked before a table
 *  is added. These two are `<id>,<language>,<name>` with nothing after the name, so
 *  everything past the second comma is the name — `pokemon_species_names.csv`
 *  carries a `genus` column after it and would need its own handling. */
const LISTS = {
  items: "item_names.csv",
  moves: "move_names.csv",
};

async function csv(name) {
  const res = await fetch(`${BASE}/${name}`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return (await res.text()).trim().split(/\r?\n/).slice(1);
}

async function main() {
  const list = process.argv[2];
  if (!LISTS[list]) {
    throw new Error(`say which list to dump: ${Object.keys(LISTS).join(" | ")}`);
  }

  // `id,iso639,iso3166,identifier,official,order` — the identifier is what the
  // dump files are named after, and what the enrichment maps to a BCP-47 tag.
  const langs = new Map(
    (await csv("languages.csv")).map((l) => {
      const [id, , , identifier] = l.split(",");
      return [id, identifier];
    }),
  );

  // `<id>,local_language_id,name` — verified to carry no commas, quotes or tabs in
  // the name column, so the split below is safe.
  const byLang = new Map();
  for (const row of await csv(LISTS[list])) {
    const i = row.indexOf(",");
    const j = row.indexOf(",", i + 1);
    const [id, langId, name] = [row.slice(0, i), row.slice(i + 1, j), row.slice(j + 1)];
    const lang = langs.get(langId);
    if (!lang) continue;
    if (!byLang.has(lang)) byLang.set(lang, []);
    byLang.get(lang).push([Number(id), name]);
  }

  const out = join(ROOT, "data-raw", "gaming", "pokemon", list);
  await mkdir(out, { recursive: true });
  for (const [lang, rows] of [...byLang].sort()) {
    rows.sort((a, b) => a[0] - b[0]);
    const text = rows.map(([id, name]) => `${id}\t${name}`).join("\n") + "\n";
    await writeFile(join(out, `${lang}.txt`), text, "utf8");
    console.log(`${lang.padEnd(9)} ${String(rows.length).padStart(5)} ${list}`);
  }
}

main().catch((err) => {
  console.error("dump-names failed:", err.message);
  process.exit(1);
});
