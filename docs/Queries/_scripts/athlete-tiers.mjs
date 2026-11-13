// How many Olympic athletes each fame tier would hold, per season, and how large their
// raw dump would grow with the floor: the numbers the athletes' tier bounds are set from.
//
//   node athlete-tiers.mjs            (counts; the cached per-edition queries make reruns free)
//   node athlete-tiers.mjs --size     (also samples terms to estimate the dump size)
//
// Base as in Olympics.md: an Olympedia ID (P8286) and a participation (P1344) in a dated
// edition, at any of its three levels (edition, sport at the edition, event). Fame = the
// number of language Wikipedias with an article (wikiGroup "wikipedia": sister projects
// and Commons don't count), the measure #35's terms() takes.
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sparql } from "./wd.mjs";

const SEASON = { Q135976384: "summer", Q137592217: "winter" };
const DATA = join(dirname(fileURLToPath(import.meta.url)), "..", "_data");

const editions = await sparql(`SELECT ?ed ?k (MIN(?d) AS ?date) WHERE {
  VALUES ?k { wd:Q135976384 wd:Q137592217 } ?ed wdt:P31 ?k ; wdt:P580|wdt:P585 ?d .
} GROUP BY ?ed ?k`);

// person => { w, seasons:Set, years:Set }
const people = new Map();
for (const e of editions) {
  const rows = await sparql(`SELECT ?h (COUNT(DISTINCT ?a) AS ?w) WHERE {
    { SELECT DISTINCT ?h WHERE {
      ?h wdt:P8286 [] .
      { ?h wdt:P1344 wd:${e.ed} } UNION { ?h wdt:P1344/wdt:P361 wd:${e.ed} } UNION { ?h wdt:P1344/wdt:P361/wdt:P361 wd:${e.ed} }
    } }
    OPTIONAL { ?a schema:about ?h ; schema:isPartOf/wikibase:wikiGroup "wikipedia" . }
  } GROUP BY ?h`);
  for (const r of rows) {
    const p = people.get(r.h) ?? people.set(r.h, { w: Number(r.w), seasons: new Set(), years: new Set() }).get(r.h);
    p.seasons.add(SEASON[e.k]);
    p.years.add(e.date.slice(0, 10));
  }
  process.stderr.write(`${e.date.slice(0, 4)} ${SEASON[e.k]}: ${rows.length}\n`);
}

const bySeason = { summer: [], winter: [] };
for (const [h, p] of people) for (const s of p.seasons) bySeason[s].push({ h, ...p });
console.log(`people ${people.size}; summer ${bySeason.summer.length}, winter ${bySeason.winter.length}, both ${[...people.values()].filter((p) => p.seasons.size === 2).length}`);

// One table per step: the tier's lower bound, its size, and how many stand at or above it.
for (const step of [20, 10, 5, 2]) {
  console.log(`\n== step ${step} (open top tier 200+) ==`);
  console.log("from     summer     ≥     winter     ≥");
  const bounds = [];
  for (let b = 200; b > 0; b -= step) bounds.push(b);
  bounds.push(0);
  const cum = { summer: 0, winter: 0 };
  for (let i = 0; i < bounds.length; i++) {
    const lo = bounds[i], hi = i ? bounds[i - 1] : Infinity;
    const cells = ["summer", "winter"].map((s) => {
      const n = bySeason[s].filter((p) => p.w >= lo && p.w < hi).length;
      cum[s] += n;
      return `${String(n).padStart(7)} ${String(cum[s]).padStart(7)}`;
    });
    console.log(`${String(lo).padStart(4)}  ${cells.join("  ")}`);
  }
}

// The top names, as a sanity check of the measure.
for (const s of ["summer", "winter"]) {
  const top = bySeason[s].sort((a, b) => b.w - a.w).slice(0, 15);
  console.log(`\ntop ${s}: ${top.map((p) => `${p.h} ${p.w}`).join(", ")}`);
}

await writeFile(
  join(DATA, "athlete-tiers.json"),
  JSON.stringify(Object.fromEntries([...people].map(([h, p]) => [h, { w: p.w, seasons: [...p.seasons], years: [...p.years].sort() }]))),
  "utf8",
);
