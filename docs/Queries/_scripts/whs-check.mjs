// World Heritage Sites against UNESCO's own list (whc.unesco.org/en/list/xml, one row per site): which site IDs Wikidata lacks,
// which site-level P757 values UNESCO doesn't list (delisted, merged or wrong), and IDs that sit on several items
import fs from "node:fs"; import { sparql } from "./wd.mjs";
const x = fs.readFileSync(process.argv[2], "utf8"), U = {};
for (const r of x.split("<row>").slice(1)) { const g = t => (r.match(new RegExp(`<${t}>([^<]*(?:<(?!\/${t}>)[^<]*)*)</${t}>`)) || [])[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "";
  U[g("id_number")] = { name: g("site"), cat: g("category"), year: g("date_inscribed"), danger: g("danger"), iso: g("iso_code") }; }
const rows = await sparql(`SELECT ?i ?id WHERE { ?i wdt:P757 ?id FILTER(!CONTAINS(?id, "-")) }`), W = {};
// UNESCO numbers an extension "bis", "ter" …, a renomination "rev": the same site
const base = id => id.replace(/(bis|ter|quater|quinquies|sexies|rev)$/, "");
for (const r of rows) (W[base(r.id)] ||= new Set()).add(r.i.split("/").pop());
for (const k in W) W[k] = [...W[k]];
const missing = Object.keys(U).filter(id => !W[id]), extra = Object.keys(W).filter(id => !U[id]), multi = Object.entries(W).filter(([id, q]) => U[id] && q.length > 1);
console.log("UNESCO sites", Object.keys(U).length, "| Wikidata site IDs", Object.keys(W).length, "| missing on Wikidata", missing.length, "| not on UNESCO's list", extra.length, "| on several items", multi.length);
console.log("missing:", missing.slice(0, 30).map(id => `${id} ${U[id].name} (${U[id].year}, ${U[id].iso})`).join(" | "));
console.log("extra:", extra.slice(0, 40).map(id => `${id} ${W[id].join("/")}`).join(" | "));
fs.writeFileSync(new URL("../_data/whs-check.json", import.meta.url), JSON.stringify({ missing: missing.map(id => ({ id, ...U[id] })), extra: extra.map(id => ({ id, items: W[id] })), multi: multi.map(([id, q]) => ({ id, name: U[id].name, items: q })) }, null, 1));
