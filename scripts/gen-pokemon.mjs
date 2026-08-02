// One-off data generator (NOT part of build/CI — needs network). Pulls the
// official de/en names from PokéAPI and writes the Pokémon topics:
//   data/topics/gaming/pokemon/pokemon/generation-<n>/{de,en}.json
//   data/topics/gaming/pokemon/moves/{de,en}.json
//   data/topics/gaming/pokemon/items/{de,en}.json
// Plus an all-languages reference archive (not app data) under docs/pokemon/.
// Run: node scripts/gen-pokemon.mjs [species|moves|items|archive|all]  (default: all)
//
// Each topic is a flat `words` list (no fame data to tier by); de/en are built
// from the same ordered id list with a symmetric de-dup, so their structure
// (word count) always matches — validate-data's parity check stays happy.
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const POKE = join(ROOT, "data", "topics", "gaming", "pokemon");
// Reference archive of ALL languages' species names, kept for when the site
// gains more languages later. Not app data; plain text, one `<dex-id>\t<name>`
// per line, in National-Dex order.
const ARCHIVE = join(ROOT, "docs", "pokemon");
const API = "https://pokeapi.co/api/v2";
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, tries = 4) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt >= tries) throw new Error(`${url} — ${err.message}`);
      await sleep(300 * attempt);
    }
  }
}

/** Run `fn` over `items` with bounded concurrency, preserving order. */
async function mapPool(items, concurrency, fn) {
  const out = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return out;
}

const nameFor = (names, lang) => names.find((n) => n.language.name === lang)?.name ?? null;
const idFromUrl = (url) => Number(url.replace(/\/$/, "").split("/").pop());

/** Build de/en `words` from ordered {en,de} pairs, skipping dups in either language. */
function symmetricWords(pairs) {
  const en = [];
  const de = [];
  const seenEn = new Set();
  const seenDe = new Set();
  for (const p of pairs) {
    if (!p.en || !p.de || seenEn.has(p.en) || seenDe.has(p.de)) continue;
    seenEn.add(p.en);
    seenDe.add(p.de);
    en.push(p.en);
    de.push(p.de);
  }
  return { en, de };
}

function topic(id, lang, title, icon, description, groupId, groupTitle, words) {
  return {
    id,
    lang,
    title,
    icon,
    description,
    groups: [{ id: groupId, title: groupTitle, words }],
    presets: [{ id: "all", title: lang === "de" ? "Alle" : "All", groups: [groupId] }],
  };
}

async function writeTopic(dir, meta, pairs) {
  const { en, de } = symmetricWords(pairs);
  await mkdir(dir, { recursive: true });
  const enTopic = topic(meta.id, "en", meta.title.en, meta.icon, meta.desc.en, meta.groupId, meta.groupTitle.en, en);
  const deTopic = topic(meta.id, "de", meta.title.de, meta.icon, meta.desc.de, meta.groupId, meta.groupTitle.de, de);
  await writeFile(join(dir, "en.json"), JSON.stringify(enTopic, null, 2) + "\n", "utf8");
  await writeFile(join(dir, "de.json"), JSON.stringify(deTopic, null, 2) + "\n", "utf8");
  console.log(`  wrote ${meta.id}: ${en.length} words`);
}

async function genSpecies() {
  console.log("species (by generation)…");
  for (let gen = 1; gen <= 9; gen++) {
    const g = await fetchJson(`${API}/generation/${gen}`);
    const refs = g.pokemon_species.sort((a, b) => idFromUrl(a.url) - idFromUrl(b.url));
    const detailed = await mapPool(refs, 16, (r) => fetchJson(r.url));
    const pairs = detailed.map((s) => ({ en: nameFor(s.names, "en"), de: nameFor(s.names, "de") }));
    await writeTopic(join(POKE, "pokemon", `generation-${gen}`), {
      id: `generation-${gen}`,
      icon: "🔴",
      title: { en: `Generation ${ROMAN[gen - 1]}`, de: `Generation ${ROMAN[gen - 1]}` },
      desc: {
        en: `Generation ${ROMAN[gen - 1]} Pokémon (English names, National Dex order).`,
        de: `Pokémon der Generation ${ROMAN[gen - 1]} (deutsche Namen, Reihenfolge nach National-Dex).`,
      },
      groupId: "pokemon",
      groupTitle: { en: "Pokémon", de: "Pokémon" },
    }, pairs);
  }
}

/** Dump every available language's species names for a generation (reference). */
async function writeArchive(gen, detailed) {
  const byLang = new Map(); // lang -> ["<id>\t<name>", …] in dex order
  for (const s of detailed) {
    for (const n of s.names) {
      if (!byLang.has(n.language.name)) byLang.set(n.language.name, []);
      byLang.get(n.language.name).push(`${s.id}\t${n.name}`);
    }
  }
  const dir = join(ARCHIVE, `gen-${gen}`);
  await mkdir(dir, { recursive: true });
  for (const [lang, lines] of byLang) {
    await writeFile(join(dir, `${lang}.txt`), lines.join("\n") + "\n", "utf8");
  }
  console.log(`  archived gen-${gen}: ${byLang.size} languages`);
}

async function genArchive() {
  console.log("archive (all languages)…");
  for (let gen = 1; gen <= 9; gen++) {
    const g = await fetchJson(`${API}/generation/${gen}`);
    const refs = g.pokemon_species.sort((a, b) => idFromUrl(a.url) - idFromUrl(b.url));
    const detailed = await mapPool(refs, 16, (r) => fetchJson(r.url));
    await writeArchive(gen, detailed);
  }
}

async function genList(kind, { id, icon, title, desc, groupId, groupTitle, keep }) {
  console.log(`${kind}…`);
  const list = await fetchJson(`${API}/${kind}?limit=100000`);
  const detailed = await mapPool(list.results, 16, (r) => fetchJson(r.url));
  const pairs = detailed
    .filter((d) => (keep ? keep(d) : true))
    .map((d) => ({ en: nameFor(d.names, "en"), de: nameFor(d.names, "de") }));
  await writeTopic(join(POKE, id), { id, icon, title, desc, groupId, groupTitle }, pairs);
}

async function main() {
  const target = process.argv[2] ?? "all";
  if (target === "species" || target === "all") await genSpecies();
  if (target === "archive" || target === "all") await genArchive();
  if (target === "moves" || target === "all") {
    await genList("move", {
      id: "moves",
      icon: "💥",
      title: { en: "Pokémon Moves", de: "Pokémon-Attacken" },
      desc: { en: "Pokémon moves (English names).", de: "Pokémon-Attacken (deutsche Namen)." },
      groupId: "moves",
      groupTitle: { en: "Moves", de: "Attacken" },
    });
  }
  if (target === "items" || target === "all") {
    await genList("item", {
      id: "items",
      icon: "🎒",
      title: { en: "Pokémon Items", de: "Pokémon-Items" },
      desc: { en: "Pokémon items (English names).", de: "Pokémon-Items (deutsche Namen)." },
      groupId: "items",
      groupTitle: { en: "Items", de: "Items" },
      // Skip TM/HM/TR machines — their names are just codes ("TM01"), not words.
      keep: (d) => d.category?.name !== "all-machines" && !/^(tm|hm|tr)\d/i.test(nameFor(d.names, "en") ?? ""),
    });
  }
  console.log("done.");
}

main().catch((err) => {
  console.error("gen-pokemon failed:", err.message);
  process.exit(1);
});
