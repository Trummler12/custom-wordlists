// Writes data-raw/sports/olympia/sport-names.json from Wikidata: every sport ever held at
// the Olympic Games, with the editions it was held at, the other listed sports it is a
// discipline of, its sitelink count and its labels in every language the lists carry.
//
//   node scripts/sports/dump-olympic-sports.mjs
//
// WHICH SPORTS. The sport (P641) of every item that is part of (P361) the Summer or Winter
// Games series, whatever that item is an instance of: basketball's series item is typed
// differently from the rest, so a class condition would lose it. That includes sports
// held once a century ago and a few things that are no sport at all (art competitions);
// build-olympic-sports.mjs sorts them into rules and the visible exclusion list.
//
// WHICH EDITIONS. Every Summer and Winter Games edition with a start date, and per edition
// the sports of the events that are part of it or of an event that is. The build reads
// "current" and "upcoming" off the dates, so nothing here names a year.
//
// It also writes games-names.json, the labels the Summer and Winter categories are titled
// with: the series' own (the long title) and the season's (the short one).
//
// The analysis behind this: _untracked/docs/Queries/sports/Olympics.md (PR #38).
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { labelFor, qid, sparql, terms } from "../lib/wikidata.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "data-raw", "sports", "olympia", "sport-names.json");
const GAMES_OUT = join(ROOT, "data-raw", "sports", "olympia", "games-names.json");

/** The Games series, and the class of their editions. */
const SERIES = { summer: "Q159821", winter: "Q82414" };
/** The seasons themselves, whose labels are the categories' short titles. */
const SEASON = { summer: "Q1313", winter: "Q1311" };
const EDITION_CLASS = { summer: "Q135976384", winter: "Q137592217" };

async function main() {
  const base = await sparql(`SELECT DISTINCT ?sport ?games WHERE {
    VALUES ?games { wd:${SERIES.summer} wd:${SERIES.winter} }
    ?ev wdt:P361 ?games ; wdt:P641 ?sport .
  }`);
  const sports = new Map();
  for (const r of base) {
    const q = qid(r.sport.value);
    if (!sports.has(q)) sports.set(q, { games: new Set(), editions: new Set() });
    sports.get(q).games.add(qid(r.games.value) === SERIES.summer ? "summer" : "winter");
  }

  const editions = await sparql(`SELECT ?ed ?kind ?start WHERE {
    VALUES ?kind { wd:${EDITION_CLASS.summer} wd:${EDITION_CLASS.winter} }
    ?ed wdt:P31 ?kind ; wdt:P580 ?start .
  }`);
  const editionOf = new Map(
    editions.map((r) => [
      qid(r.ed.value),
      `${r.start.value.slice(0, 10)} ${qid(r.kind.value) === EDITION_CLASS.summer ? "summer" : "winter"}`,
    ]),
  );
  const held = await sparql(`SELECT DISTINCT ?ed ?sport WHERE {
    VALUES ?kind { wd:${EDITION_CLASS.summer} wd:${EDITION_CLASS.winter} }
    ?ed wdt:P31 ?kind .
    { ?ev wdt:P361 ?ed } UNION { ?ev wdt:P361/wdt:P361 ?ed }
    ?ev wdt:P641 ?sport .
  }`);
  // An edition's events also name the disciplines the series level leaves out (ski jumping,
  // BMX, ice dance), so the current and upcoming editions add their sports to the list. Older
  // ones only date it: their single events name finer things (high jump, 1500 metres) that
  // are events, not sports. "Current" = the latest Summer and the latest Winter edition begun.
  const today = new Date().toISOString().slice(0, 10);
  const latest = {};
  for (const ed of editionOf.values()) {
    const [date, kind] = ed.split(" ");
    if (date <= today && (!latest[kind] || date > latest[kind])) latest[kind] = date;
  }
  const since = Object.values(latest).sort()[0];
  for (const r of held) {
    const ed = editionOf.get(qid(r.ed.value));
    if (!ed) continue;
    const q = qid(r.sport.value);
    if (!sports.has(q) && ed >= since) sports.set(q, { games: new Set(), editions: new Set() });
    sports.get(q)?.editions.add(ed);
  }

  // The listed sports another one is a discipline of, by subclass or part-of.
  const ids = [...sports.keys()];
  const values = ids.map((q) => `wd:${q}`).join(" ");
  const links = await sparql(`SELECT DISTINCT ?s ?parent WHERE {
    VALUES ?s { ${values} } VALUES ?parent { ${values} }
    ?s wdt:P279|wdt:P361 ?parent . FILTER(?s != ?parent)
  }`);
  const parents = new Map();
  for (const r of links) {
    const s = qid(r.s.value);
    (parents.get(s) ?? parents.set(s, []).get(s)).push(qid(r.parent.value));
  }

  const byId = await terms(ids);
  const out = {};
  // Most widely known first, so the file reads like the list it becomes.
  for (const q of ids.sort((a, b) => byId[b].wikipedias - byId[a].wikipedias || a.localeCompare(b))) {
    const s = sports.get(q);
    out[q] = {
      name: labelFor(byId[q].names, "en") ?? q,
      wikipedias: byId[q].wikipedias,
      games: [...s.games].sort(),
      editions: [...s.editions].sort(),
      ...(parents.has(q) ? { parents: parents.get(q).sort() } : {}),
      names: byId[q].names,
    };
  }

  const games = await terms([...Object.values(SERIES), ...Object.values(SEASON)]);
  const gamesOut = Object.fromEntries(
    Object.entries(SERIES).map(([kind, q]) => [
      kind,
      { qid: q, names: games[q].names, season: games[SEASON[kind]].names },
    ]),
  );

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  await writeFile(GAMES_OUT, JSON.stringify(gamesOut, null, 2) + "\n", "utf8");
  console.log(`dump-olympic-sports: ${ids.length} sports, ${editionOf.size} editions`);
}

main().catch((err) => {
  console.error("dump-olympic-sports failed:", err.message);
  process.exit(1);
});
