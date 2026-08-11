// Writes data-raw/gaming/pokemon/items/<lang>.txt from PokéAPI's own source data:
// one file per language, `<item-id> ⇥ <name>` per line, sorted by id.
//
// Generated rather than pasted. The generation dumps were assembled by hand, and
// that is how gen-9 ended up with Crocalor at dex 901 instead of 910 — a
// transposition that would have mis-tiered every Pokémon after it. A generated
// dump can't do that, and re-running this reproduces the files exactly.
//
// The source is two CSVs rather than the REST API: `item_names.csv` carries every
// item in every language in one file, where /api/v2/item/{id} would be 2000-odd
// requests for the same thing.
//
//   node scripts/dump-item-names.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "data-raw", "gaming", "pokemon", "items");
const BASE = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv";

async function csv(name) {
  const res = await fetch(`${BASE}/${name}`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return (await res.text()).trim().split(/\r?\n/).slice(1);
}

async function main() {
  // `id,iso639,iso3166,identifier,official,order` — the identifier is what the
  // dump files are named after, and what the enrichment maps to a BCP-47 tag.
  const langs = new Map(
    (await csv("languages.csv")).map((l) => {
      const [id, , , identifier] = l.split(",");
      return [id, identifier];
    }),
  );

  // `item_id,local_language_id,name` — verified to carry no commas, quotes or
  // tabs in the name column, so the split below is safe.
  const byLang = new Map();
  for (const row of await csv("item_names.csv")) {
    const i = row.indexOf(",");
    const j = row.indexOf(",", i + 1);
    const [id, langId, name] = [row.slice(0, i), row.slice(i + 1, j), row.slice(j + 1)];
    const lang = langs.get(langId);
    if (!lang) continue;
    if (!byLang.has(lang)) byLang.set(lang, []);
    byLang.get(lang).push([Number(id), name]);
  }

  await mkdir(OUT, { recursive: true });
  for (const [lang, rows] of [...byLang].sort()) {
    rows.sort((a, b) => a[0] - b[0]);
    const text = rows.map(([id, name]) => `${id}\t${name}`).join("\n") + "\n";
    await writeFile(join(OUT, `${lang}.txt`), text, "utf8");
    console.log(`${lang.padEnd(9)} ${String(rows.length).padStart(5)} items`);
  }
}

main().catch((err) => {
  console.error("dump-item-names failed:", err.message);
  process.exit(1);
});
