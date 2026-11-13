// How many items are instances of a class: of the class itself (truthy P31), of it or
// any subclass, and counting every P31 statement including deprecated and ended ones
// (what the Query Builder counts, and why its numbers run higher).
//
//   node count.mjs <class-QID>...
import { labels, sparql } from "./wd.mjs";

const classes = process.argv.slice(2).filter((a) => /^Q\d+$/.test(a));
const L = await labels(classes);
const n = async (body) => Number((await sparql(`SELECT (COUNT(DISTINCT ?i) AS ?n) WHERE { ${body} }`))[0].n);
for (const c of classes) {
  const exact = await n(`?i wdt:P31 wd:${c} .`);
  const sub = await n(`?i wdt:P31/wdt:P279* wd:${c} .`);
  const all = await n(`?i p:P31/ps:P31 wd:${c} .`);
  console.log(`${c.padEnd(11)} ${(L[c] ?? "").padEnd(32)} exact ${exact}, subclass ${sub}, all statements ${all}`);
}
