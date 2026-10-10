// Writes data-raw/sports/games/sport-names.json from Wikidata: every sport ever held at one
// of the multi-sport Games in LISTS, with the editions it was held at, the other listed
// sports it is a discipline of, its sitelink count and its labels in every language the
// lists carry.
//
//   node scripts/sports/dump-games-sports.mjs [--accept-losses]
//
// THE SAME RECIPE FOR EVERY SERIES (PR #38, sports/Olympics.md => "Games recipe"):
//   - Editions: the items linked to the series by instance of, part of the series or
//     edition of (P31 / P179 / P3450) that carry a date, P580 before P585 (often only a
//     year). Never by P361 alone, which also links the series' own events.
//   - Sports: the P641 of the events one P361 level below every edition, and of the
//     series' own events. Two levels below only for the last two editions begun and the
//     next one, which the build's classes read: at older ones that level names single
//     events (high jump), not sports.
//   - An edition whose event for a sport is an Olympic demonstration sport competition
//     (Q1123217) is also listed under `demonstrations`.
// Things that are no sport (events, delegations, art) reach the dump too; the build keeps
// them out through the visible exclusion list.
//
// A LAGGING SERVER answers short without an error (2026-10-09: ski jumping lost 21 of its
// editions, twice in a row). Editions that took place can't un-happen, so a sport losing
// any against the previous dump stops the write; pass --accept-losses once each loss is
// checked on Wikidata (a corrected item, like lacrosse's events moving to field lacrosse).
//
// It also writes games-names.json, the labels the categories are titled with: the series'
// own (the long title) and, for a season, the season's (the short one).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { labelFor, qid, sparql, terms } from "../lib/wikidata.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RAW = join(ROOT, "data-raw", "sports", "games");
const OUT = join(RAW, "sport-names.json");
const GAMES_OUT = join(RAW, "games-names.json");

/** Each list's folder under data/topics/sports/games/, and the series it lists. A series
 *  split by season gets one list per season, tagged with the season's item. */
const LISTS = {
  "olympia/summer": { series: "Q159821", season: "Q1313" },
  "olympia/winter": { series: "Q82414", season: "Q1311" },
  "paralympics/summer": { series: "Q3327913", season: "Q1313" },
  "paralympics/winter": { series: "Q3317976", season: "Q1311" },
  "asian-games/summer": { series: "Q483463", season: "Q1313" },
  "asian-games/winter": { series: "Q818463", season: "Q1311" },
  "commonwealth-games": { series: "Q178340" },
  "world-games": { series: "Q673097" },
};
/** Olympic demonstration sport competition: an event shown at the Games, not for medals. */
const DEMONSTRATION = "Q1123217";

const today = new Date().toISOString().slice(0, 10);

/** The dated editions of a series: `{ Q…: "YYYY-MM-DD" }`. */
async function editionsOf(series) {
  const rows = await sparql(`SELECT ?ed ?start ?point WHERE {
    ?ed wdt:P31|wdt:P179|wdt:P3450 wd:${series} .
    OPTIONAL { ?ed wdt:P580 ?start } OPTIONAL { ?ed wdt:P585 ?point }
    FILTER(BOUND(?start) || BOUND(?point))
  }`);
  const out = {};
  for (const r of rows) {
    const date = (r.start ?? r.point).value.slice(0, 10);
    const q = qid(r.ed.value);
    if (!out[q] || date < out[q]) out[q] = date;
  }
  return out;
}

/** The sports of the events `depth` P361 levels below `item`. One query per edition and
 *  depth: a UNION, or one query over all editions, times out on the large Summer ones. */
async function sportsBelow(item, depth) {
  const path = depth === 1 ? "wdt:P361" : "wdt:P361/wdt:P361";
  const rows = await sparql(`SELECT DISTINCT ?sport WHERE { ?ev ${path} wd:${item} ; wdt:P641 ?sport . }`);
  return rows.map((r) => qid(r.sport.value));
}

async function main() {
  const sports = new Map();
  const add = (q) => sports.get(q) ?? sports.set(q, { lists: new Set(), editions: new Set(), demonstrations: new Set() }).get(q);

  let editionCount = 0;
  for (const [list, { series }] of Object.entries(LISTS)) {
    const eds = await editionsOf(series);
    const sorted = Object.entries(eds).sort((a, b) => a[1].localeCompare(b[1]));
    const begun = sorted.filter(([, d]) => d <= today);
    const recent = new Set([...begun.slice(-2).map(([ed]) => ed), sorted.find(([, d]) => d > today)?.[0]]);
    editionCount += sorted.length;

    for (const q of await sportsBelow(series, 1)) add(q).lists.add(list);
    for (const [ed, date] of sorted) {
      const found = new Set(await sportsBelow(ed, 1));
      if (recent.has(ed)) for (const q of await sportsBelow(ed, 2)) found.add(q);
      for (const q of found) {
        add(q).lists.add(list);
        sports.get(q).editions.add(`${date} ${list}`);
      }
    }
    const demos = await sparql(`SELECT DISTINCT ?ed ?sport WHERE {
      VALUES ?ed { ${sorted.map(([ed]) => `wd:${ed}`).join(" ")} }
      ?ev wdt:P31 wd:${DEMONSTRATION} ; wdt:P641 ?sport ; wdt:P361 ?ed .
    }`);
    for (const r of demos) add(qid(r.sport.value)).demonstrations.add(`${eds[qid(r.ed.value)]} ${list}`);
    console.log(`  ${list}: ${sorted.length} editions`);
  }

  // The listed sports another one is a discipline of, by subclass or part-of.
  const ids = [...sports.keys()];
  const parents = new Map();
  for (let i = 0; i < ids.length; i += 150) {
    const chunk = ids.slice(i, i + 150).map((q) => `wd:${q}`).join(" ");
    const all = ids.map((q) => `wd:${q}`).join(" ");
    const links = await sparql(`SELECT DISTINCT ?s ?parent WHERE {
      VALUES ?s { ${chunk} } VALUES ?parent { ${all} }
      ?s wdt:P279|wdt:P361 ?parent . FILTER(?s != ?parent)
    }`);
    for (const r of links) {
      const s = qid(r.s.value);
      (parents.get(s) ?? parents.set(s, []).get(s)).push(qid(r.parent.value));
    }
  }

  const byId = await terms(ids);
  const out = {};
  // Most widely known first, so the file reads like the lists it becomes.
  for (const q of ids.sort((a, b) => byId[b].wikipedias - byId[a].wikipedias || a.localeCompare(b))) {
    const s = sports.get(q);
    const demonstrations = [...s.demonstrations].sort();
    out[q] = {
      name: labelFor(byId[q].names, "en") ?? q,
      wikipedias: byId[q].wikipedias,
      lists: [...s.lists].sort(),
      editions: [...s.editions].sort(),
      ...(demonstrations.length ? { demonstrations } : {}),
      ...(parents.has(q) ? { parents: [...new Set(parents.get(q))].sort() } : {}),
      names: byId[q].names,
    };
  }

  const losses = lostEditions(await readFile(OUT, "utf8").then(JSON.parse).catch(() => ({})), out);
  if (losses.length) {
    console.log(`  editions lost against the previous dump (${losses.length}):`);
    for (const l of losses) console.log(`    ${l}`);
    if (!process.argv.includes("--accept-losses")) {
      console.error("dump-games-sports: nothing written. Rerun later (a lagging server), or check each loss on Wikidata and pass --accept-losses.");
      process.exit(1);
    }
  }

  const named = await terms([...new Set(Object.values(LISTS).flatMap((l) => [l.series, l.season].filter(Boolean)))]);
  const gamesOut = Object.fromEntries(
    Object.entries(LISTS).map(([list, l]) => [
      list,
      { qid: l.series, names: named[l.series].names, ...(l.season ? { season: named[l.season].names } : {}) },
    ]),
  );

  await mkdir(RAW, { recursive: true });
  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  await writeFile(GAMES_OUT, JSON.stringify(gamesOut, null, 2) + "\n", "utf8");
  console.log(`dump-games-sports: ${ids.length} sports, ${editionCount} editions`);
}

/** Every begun edition a sport had in `before` and lacks in `after`. */
function lostEditions(before, after) {
  const out = [];
  for (const [q, s] of Object.entries(before)) {
    if (!/^Q\d+$/.test(q)) continue;
    const kept = new Set(after[q]?.editions ?? []);
    const lost = (s.editions ?? []).filter((e) => e.slice(0, 10) <= today && !kept.has(e));
    if (lost.length) out.push(`${s.name} (${q}): ${lost.join(", ")}`);
  }
  return out;
}

main().catch((err) => {
  console.error("dump-games-sports failed:", err.message);
  process.exit(1);
});
