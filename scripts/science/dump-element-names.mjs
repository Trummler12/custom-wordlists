// Writes data-raw/science/elements/element-names.json from Wikidata: every chemical
// element with its atomic number and its labels (and aliases) in every language the lists
// carry, keyed by Q-id and sorted by atomic number.
//
//   node scripts/science/dump-element-names.mjs
//
// WHICH ITEMS. Instances of chemical element (`P31 Q11344`), minus anything that is an
// instance of a hypothetical element's class (Q1299291 and its subclasses): the class
// itself also holds the predicted elements past oganesson. 118 items, one per atomic
// number. Unlike a bound on the atomic number, this takes a newly made element in as
// soon as Wikidata calls it one.
//
// WHY A DUMP AND NOT A DIRECT BUILD. A file on disk is what makes a later re-import
// reviewable as a diff, and the app never reads any of data-raw/ anyway. See
// data-raw/README.md.
//
// CASE IS THE SOURCE'S. Wikidata writes labels in lower case as a house rule
// ("hydrogen"), which is a labelling convention rather than orthography; the dump is a
// snapshot, so it keeps what it was given and the build decides.
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { NAME_LANGS, labelFor, qid, sparql, terms } from "../lib/wikidata.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "data-raw", "science", "elements", "element-names.json");

const QUERY = `SELECT DISTINCT ?item ?z WHERE {
  ?item p:P31/ps:P31 wd:Q11344 .
  MINUS { ?item p:P31/ps:P31/wdt:P279* wd:Q1299291 . }
  OPTIONAL { ?item wdt:P1086 ?z . }
}`;

async function main() {
  const rows = await sparql(QUERY);
  const zOf = new Map(rows.map((r) => [qid(r.item.value), r.z ? Number(r.z.value) : null]));
  const missingZ = [...zOf].filter(([, z]) => z === null).map(([q]) => q);
  if (missingZ.length) throw new Error(`no atomic number on ${missingZ.join(", ")}`);

  const byId = await terms([...zOf.keys()]);
  const ids = [...zOf.keys()].sort((a, b) => zOf.get(a) - zOf.get(b));
  const out = {};
  for (const q of ids) {
    // The atomic number beside the English name, so the file reads as a table of elements;
    // the build joins on the number.
    out[q] = { name: labelFor(byId[q].names, "en") ?? q, atomicNumber: zOf.get(q), names: byId[q].names };
  }

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`dump-element-names: ${ids.length} elements`);
  for (const tag of NAME_LANGS) {
    const named = ids.filter((q) => labelFor(out[q].names, tag)).length;
    console.log(`  ${tag.padEnd(8)} ${String(named).padStart(3)} of ${ids.length}`);
  }
}

main().catch((err) => {
  console.error("dump-element-names failed:", err.message);
  process.exit(1);
});
