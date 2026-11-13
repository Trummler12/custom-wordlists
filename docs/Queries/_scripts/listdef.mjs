// What a Wikidata list item's definition yields: its `is a list of` (P360) statements
// with their qualifiers, and for each the number of items matching it.
//
//   node listdef.mjs <list-QID>... [--json]
//
// Counts per definition:
//   exact    instance of the class itself, every qualifier as a direct statement
//   subclass the same, but instances of any subclass of the class count too
//   anyClass every qualifier holds, whatever the item is an instance of
// "anyClass" far above "subclass" usually means members are typed with a class the
// definition doesn't name; both far below the real count means the members are missing.
import { labels, sparql } from "./wd.mjs";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const lists = args.filter((a) => /^Q\d+$/.test(a));

async function definitionsOf(list) {
  const rows = await sparql(`SELECT ?st ?cls ?pq ?v WHERE {
    wd:${list} p:P360 ?st . ?st ps:P360 ?cls .
    OPTIONAL { ?st ?pqv ?v . ?pq wikibase:qualifier ?pqv . }
  }`);
  const byStatement = new Map();
  for (const r of rows) {
    const d = byStatement.get(r.st) ?? { cls: r.cls, quals: [] };
    if (r.pq && /^Q\d+$/.test(r.v)) d.quals.push([r.pq, r.v]);
    byStatement.set(r.st, d);
  }
  return [...byStatement.values()];
}

async function count(body) {
  const [row] = await sparql(`SELECT (COUNT(DISTINCT ?item) AS ?n) WHERE { ${body} }`);
  return Number(row.n);
}

const out = [];
for (const list of lists) {
  const defs = await definitionsOf(list);
  const result = { list, defs: [] };
  for (const d of defs) {
    const q = d.quals.map(([p, v]) => `?item wdt:${p} wd:${v} .`).join(" ");
    result.defs.push({
      ...d,
      exact: await count(`?item wdt:P31 wd:${d.cls} . ${q}`),
      subclass: await count(`?item wdt:P31/wdt:P279* wd:${d.cls} . ${q}`),
      anyClass: q ? await count(q) : null,
    });
  }
  out.push(result);
}

if (asJson) {
  console.log(JSON.stringify(out, null, 2));
} else {
  const ids = new Set();
  for (const r of out) {
    ids.add(r.list);
    for (const d of r.defs) {
      ids.add(d.cls);
      for (const [p, v] of d.quals) ids.add(p).add(v);
    }
  }
  const L = await labels([...ids]);
  for (const r of out) {
    console.log(`${r.list} ${L[r.list] ?? ""}`);
    if (!r.defs.length) console.log("  (no P360 definition)");
    for (const d of r.defs) {
      const quals = d.quals.map(([p, v]) => `${L[p] ?? p}=${L[v] ?? v} (${v})`).join(", ");
      console.log(`  ${L[d.cls] ?? d.cls} (${d.cls})${quals ? ` | ${quals}` : ""}`);
      console.log(`    exact ${d.exact}, subclass ${d.subclass}${d.anyClass !== null ? `, anyClass ${d.anyClass}` : ""}`);
    }
  }
}
