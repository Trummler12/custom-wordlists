// Pokémon forms: what PokéAPI names, what the official Japanese Pokédex lists as entries of
// their own, and which of those Wikidata holds. The official list is the boundary between the
// forms a rule names one by one and the cosmetic forms it only lists as a set.
//
//   node pokemon-forms.mjs        (writes ../_data/pokemon-forms/*.json)
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sparql } from "./wd.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "_data", "pokemon-forms");
const UA = { "User-Agent": "custom-wordlists-analysis/1.0 (https://github.com/Trummler12/custom-wordlists)" };

// PokéAPI: every form with its names in the build's languages (9 en, 6 de, 5 fr, 7 es, 8 it,
// 1 / 11 ja, 3 ko, 4 zh-Hant, 12 zh-Hans) and the generation it came with.
const gql = `query { pokemon_v2_pokemonform(order_by: {id: asc}) { name form_name is_default is_battle_only is_mega
  pokemon_v2_versiongroup { generation_id }
  pokemon_v2_pokemon { name is_default pokemon_species_id pokemon_v2_pokemonspecy { name } }
  pokemon_v2_pokemonformnames(where: {language_id: {_in: [9, 6, 5, 7, 8, 1, 3, 4, 12, 11]}}) { name pokemon_name language_id } } }`;
const F = (await (await fetch("https://beta.pokeapi.co/graphql/v1beta", { method: "POST", headers: { ...UA, "Content-Type": "application/json" }, body: JSON.stringify({ query: gql }) })).json()).data.pokemon_v2_pokemonform;
// The official Pokédex: one search call returns every entry, forms as `sub` > 0.
const Z = (await (await fetch("https://zukan.pokemon.co.jp/zukan-api/api/search/?limit=2000&page=1", { headers: { ...UA, Referer: "https://zukan.pokemon.co.jp/" } })).json()).results.filter((r) => r.sub > 0);
console.log(`PokéAPI forms: ${F.length} (named ${F.filter((f) => f.form_name).length}); official Pokédex form entries: ${Z.length}`);

const nm = (f, l) => f.pokemon_v2_pokemonformnames.find((n) => n.language_id === l);
const ja = (f) => (nm(f, 11) ?? nm(f, 1))?.name;
const nk = (s) => (s ?? "").normalize("NFKC").replace(/[\s・（）()]/g, "");
const group = (f) => {
  const n = f.form_name;
  if (f.is_mega || /^mega/.test(n)) return "mega";
  if (/gmax/.test(n)) return "gigantamax";
  if (/^primal/.test(n)) return "primal";
  if (/(^|-)(alola|galar|hisui|paldea)(-|$)/.test(n)) return "regional";
  if (/totem/.test(n)) return "totem";
  return "other";
};

// Official entry => PokéAPI form, by species and the Japanese form name; Gigantamax and Mega by kind.
const zform = (z) => {
  const c = F.filter((f) => f.pokemon_v2_pokemon.pokemon_species_id === Number(z.no) && f.form_name);
  if (z.kyodai_flg) return c.find((f) => /gmax/.test(f.form_name) && (/ローなすがた/.test(z.sub_name) ? /low-key/.test(f.form_name) : /れんげき/.test(z.sub_name) ? /rapid/.test(f.form_name) : true));
  if (!z.sub_name) { const xy = z.name.normalize("NFKC").match(/([XYZ])$/)?.[1]; return c.find((f) => (f.is_mega || /primal/.test(f.form_name)) && (!xy || f.form_name.endsWith("-" + xy.toLowerCase()))); }
  return c.find((f) => nk(ja(f)) === nk(z.sub_name));
};

// Wikidata: the form-like items, by Japanese and English label.
const CLS = ["Q56707539", "Q56707595", "Q72918110", "Q108152260", "Q113403839", "Q16577590", "Q107639880"];
const wd = await sparql(`SELECT ?i ?ja ?en WHERE { VALUES ?c { ${CLS.map((q) => "wd:" + q).join(" ")} } ?i wdt:P31 ?c .
  OPTIONAL { ?i rdfs:label ?ja FILTER(LANG(?ja)="ja") } OPTIONAL { ?i rdfs:label ?en FILTER(LANG(?en)="en") } }`, { fresh: true });
const byJa = new Map(), byEn = new Map();
for (const r of wd) { if (r.ja) byJa.set(nk(r.ja), r.i); if (r.en) byEn.set(nk(r.en).toLowerCase(), r.i); }
const official = Z.map((z) => {
  const f = zform(z), en = f && nm(f, 9), sp = f?.pokemon_v2_pokemon.pokemon_v2_pokemonspecy.name;
  const jaFull = nk(z.sub_name ? `${z.name}${z.sub_name}` : z.name);
  const q = byJa.get(jaFull) ?? [...byJa].find(([k]) => z.sub_name && k.includes(nk(z.name)) && k.includes(nk(z.sub_name)))?.[1]
    ?? (en && [en.pokemon_name, `${sp} ${en.name}`].map((s) => byEn.get(nk(s).toLowerCase())).find(Boolean));
  return { zukan: `${z.no}-${z.sub}`, ja: z.sub_name ? `${z.name}（${z.sub_name}）` : z.name, form: f?.name ?? null, group: f ? group(f) : z.kyodai_flg ? "gigantamax" : "mega", en: en?.pokemon_name ?? null, wikidata: q ?? null };
});
const sum = {};
for (const o of official) { const s = (sum[o.group] ??= [0, 0]); s[0]++; if (o.wikidata) s[1]++; }
console.log("official form entries by group, on Wikidata / all:", Object.entries(sum).map(([k, [n, w]]) => `${k} ${w}/${n}`).join(", "));
console.log(`official entries without an item: ${official.filter((o) => !o.wikidata).length}`);

// Cosmetic forms: named, not a species' default, not in the official Pokédex, not Mega / Gigantamax / regional / totem.
const inOfficial = new Set(official.map((o) => o.form).filter(Boolean));
const cosmetic = F.filter((f) => f.form_name && group(f) === "other" && !inOfficial.has(f.name) && !(f.is_default && f.pokemon_v2_pokemon.is_default))
  .map((f) => ({ form: f.name, species: f.pokemon_v2_pokemon.pokemon_v2_pokemonspecy.name, en: nm(f, 9)?.pokemon_name || null, generation: f.pokemon_v2_versiongroup?.generation_id }))
  // Forms without an English name (Scatterbug's and Spewpa's patterns, Mothim's cloaks) exist only in the data, not in the games.
  .filter((m) => m.en);
const per = {}; for (const m of cosmetic) per[m.species] = (per[m.species] ?? 0) + 1;
console.log(`cosmetic forms: ${cosmetic.length} on ${Object.keys(per).length} species: ${Object.entries(per).sort((a, b) => b[1] - a[1]).map(([s, n]) => `${s} ${n}`).join(", ")}`);

await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, "official.json"), JSON.stringify(official, null, 1));
await writeFile(join(OUT, "cosmetic.json"), JSON.stringify(cosmetic, null, 1));
