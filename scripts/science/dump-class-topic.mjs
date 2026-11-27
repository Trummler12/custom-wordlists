// Writes data-raw/science/<folder>/<topic>.json from Wikidata: every member of the topic
// (scripts/science/class-topics.mjs) that reaches its sitelink floor, with the member keys
// that brought it in, its sitelink and Wikipedia counts, and its labels in every language
// the lists carry. Keyed by Q-id, so a re-dump diffs by item.
//
//   node scripts/science/dump-class-topic.mjs <topic>
//
// DIRECT INSTANCES OR PARTS ONLY: the classes (or the groups) are listed one by one in the
// config, and the build tells them apart. A class is read at every rank but deprecated, as a
// second P31 often sits at normal rank beside a preferred one. The config's `statements`
// (P575, P31 …) come along under their keys, for the tiers and checks to read; a `year` one
// keeps only its years.
//
// It also keeps, under `category`, the labels of the topic folder's subject (`category.qid`),
// which title the folder's _category.json when the build first writes it.
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { NAME_LANGS, labelFor, qid, sparql, terms } from "../lib/wikidata.mjs";
import { CLASS_TOPICS } from "./class-topics.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Distinct and in order: numbers by value, Q-ids by number. */
const sorted = (vs) =>
  [...new Set(vs)].sort((a, b) => (typeof a === "number" ? a - b : Number(a.slice(1)) - Number(b.slice(1))));

async function main() {
  const id = process.argv[2];
  const cfg = CLASS_TOPICS[id];
  if (!cfg) throw new Error(`unknown topic "${id}"; known: ${Object.keys(CLASS_TOPICS).join(", ")}`);
  const sources = cfg.classes ?? cfg.partsOf;
  const keyOf = Object.fromEntries(Object.entries(sources).map(([k, q]) => [q, k]));

  const member = cfg.classes
    ? "?item p:P31 ?st . ?st ps:P31 ?src . MINUS { ?st wikibase:rank wikibase:DeprecatedRank }"
    : "?src wdt:P527 ?item .";
  const rows = await sparql(`SELECT DISTINCT ?item ?src ?sl WHERE {
    VALUES ?src { ${Object.values(sources).map((q) => `wd:${q}`).join(" ")} }
    ${member}
    ?item wikibase:sitelinks ?sl .
    ${cfg.minSitelinks ? `FILTER(?sl >= ${cfg.minSitelinks})` : ""}
  }`);
  const items = new Map();
  for (const r of rows) {
    const q = qid(r.item.value);
    const it = items.get(q) ?? items.set(q, { sitelinks: Number(r.sl.value), in: new Set() }).get(q);
    it.in.add(keyOf[qid(r.src.value)]);
  }

  const ids = [...items.keys()].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  const byId = await terms(ids);

  // `inverse`: the link may sit on the other item instead (a group lists its parts by P527,
  // the parts carry no P361), so both directions count.
  const statements = Object.fromEntries(ids.map((q) => [q, {}]));
  for (const [key, { prop, inverse, year }] of Object.entries(cfg.statements ?? {})) {
    const values = ids.map((q) => `wd:${q}`).join(" ");
    const rows = await sparql(`SELECT DISTINCT ?item ?v WHERE {
      VALUES ?item { ${values} }
      { ?item wdt:${prop} ?v } ${inverse ? `UNION { ?v wdt:${inverse} ?item }` : ""}
    }`);
    for (const r of rows) {
      // "-0244-01-01T00:00:00Z": the year, BCE negative. Unknown values come as blank nodes.
      const v = year ? Number(/^(-?\d+)-/.exec(r.v.value)?.[1]) : r.v.type === "uri" ? qid(r.v.value) : undefined;
      if (v === undefined || Number.isNaN(v)) continue;
      (statements[qid(r.item.value)][key] ??= []).push(v);
    }
  }
  const out = {};
  for (const q of ids) {
    const it = items.get(q);
    out[q] = {
      name: labelFor(byId[q].names, "en") ?? q,
      sitelinks: it.sitelinks,
      wikipedias: byId[q].wikipedias,
      // In config order, so a re-dump never reorders them.
      in: Object.keys(sources).filter((k) => it.in.has(k)),
      ...(Object.keys(statements[q]).length
        ? { statements: Object.fromEntries(Object.entries(statements[q]).map(([k, v]) => [k, sorted(v)])) }
        : {}),
      names: byId[q].names,
    };
  }

  const cat = cfg.category?.qid;
  if (cat) out.category = { qid: cat, names: (await terms([cat]))[cat].names };

  const path = join(ROOT, "data-raw", "science", cfg.folder, `${id}.json`);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`dump-class-topic: ${id} ${ids.length} items => ${path}`);
  for (const k of Object.keys(sources)) {
    console.log(`  ${k.padEnd(16)} ${ids.filter((q) => out[q].in.includes(k)).length}`);
  }
  const named = NAME_LANGS.map((tag) => `${tag} ${ids.filter((q) => labelFor(out[q].names, tag)).length}`);
  console.log(`  labels: ${named.join(", ")}`);
}

main().catch((err) => {
  console.error("dump-class-topic failed:", err.message);
  process.exit(1);
});
