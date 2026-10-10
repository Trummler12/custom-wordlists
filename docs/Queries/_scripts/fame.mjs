// Two fame proxies side by side for a set of items: sitelinks (how many Wikipedias have
// an article) and the English Wikipedia article's pageviews over the last 12 full months,
// plus how far the two rankings agree (Spearman's rho).
//
//   node fame.mjs <QID>... [--from <file with QIDs>]
import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { labels, sparql } from "./wd.mjs";

const args = process.argv.slice(2);
const fromFile = args.includes("--from") ? readFileSync(args[args.indexOf("--from") + 1], "utf8") : "";
const ids = [...new Set([...args, ...fromFile.split(/\s+/)].filter((a) => /^Q\d+$/.test(a)))];
const CACHE = join(dirname(fileURLToPath(import.meta.url)), "..", "_data", "cache");
const UA = "custom-wordlists-analysis/1.0 (https://github.com/Trummler12/custom-wordlists)";

const rows = await sparql(`SELECT ?i ?links ?title WHERE {
  VALUES ?i { ${ids.map((i) => `wd:${i}`).join(" ")} }
  OPTIONAL { ?i wikibase:sitelinks ?links }
  OPTIONAL { ?a schema:about ?i ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?title }
}`);

const now = new Date();
const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
const start = new Date(Date.UTC(end.getUTCFullYear() - 1, end.getUTCMonth(), 1));
const fmt = (d) => d.toISOString().slice(0, 10).replace(/-/g, "") + "00";

async function views(title) {
  const file = join(CACHE, `pv-${fmt(start)}-${encodeURIComponent(title).slice(0, 80)}.json`);
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    /* fetch */
  }
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${encodeURIComponent(title.replace(/ /g, "_"))}/monthly/${fmt(start)}/${fmt(end)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const n = res.ok ? (await res.json()).items.reduce((s, it) => s + it.views, 0) : 0;
  await mkdir(CACHE, { recursive: true });
  await writeFile(file, JSON.stringify(n));
  return n;
}

const L = await labels(ids);
const data = [];
for (const r of rows) data.push({ q: r.i, name: L[r.i] ?? r.i, links: Number(r.links ?? 0), title: r.title, views: r.title ? await views(r.title) : 0 });

const rank = (key) => {
  const sorted = [...data].sort((a, b) => b[key] - a[key]);
  return new Map(sorted.map((d, i) => [d.q, i + 1]));
};
const rl = rank("links");
const rv = rank("views");
const n = data.length;
const rho = 1 - (6 * data.reduce((s, d) => s + (rl.get(d.q) - rv.get(d.q)) ** 2, 0)) / (n * (n * n - 1));

for (const d of [...data].sort((a, b) => b.views - a.views)) {
  console.log(`${String(rv.get(d.q)).padStart(3)} ${String(rl.get(d.q)).padStart(3)}  ${String(d.views).padStart(9)} ${String(d.links).padStart(4)}  ${d.name}`);
}
console.log(`\n${n} items; rank by views | rank by sitelinks; Spearman rho = ${rho.toFixed(2)}`);
