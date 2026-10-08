// Writes the Olympic sports topics (data/topics/sports/olympia/<season>/sports.json), their
// categories' titles, and the sports' language coverage page data (data/coverage/sports.json),
// all from what scripts/sports/dump-olympic-sports.mjs writes.
//
//   node scripts/sports/build-olympic-sports.mjs [--write]
//
// THE WHOLE FILE IS GENERATED: membership, rules, names and tiers. Two visible tables in
// data-raw/sports/olympia/ are the only hand input: excluded.json (what the dump finds that
// is no sport) and parents.json (where the Games split sports otherwise than Wikidata).
//
// A SPORT BELONGS TO ONE SEASON: the kind of the latest edition it was held at, else of the
// series it is part of. Figure skating was held at two Summer Games before the Winter Games
// existed, and is a winter sport.
//
// CLASSES, read off the editions' dates, never off a year written here ("current" is the
// latest Summer and the latest Winter edition that has begun):
//   - `discontinued` (omitted): not held at the current edition of its season or later;
//   - `future-disciplines` (omittable): held only at an edition still to come;
//   - `child-discipline` (omittable): held now, and a discipline of another listed sport;
//   - the rest is the base list.
//
// TIERS by how many Wikipedias have an article on the sport, in fixed steps of 20, so the
// Summer and Winter lists cut at the same counts and their merge above them stays ranked.
//
// The analysis behind this: _untracked/docs/Queries/sports/Olympics.md (PR #38).
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCoverage } from "../geography/coverage.mjs";
import { serializeCategory, serializeTopic } from "../lib/serialize.mjs";
import { LANG_SRC, NAME_LANGS, labelFor } from "../lib/wikidata.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RAW = join(ROOT, "data-raw", "sports", "olympia");
const OUT = join(ROOT, "data", "topics", "sports", "olympia");

/** The seasons built so far. Winter follows once its analysis is in. */
const SEASONS = ["summer"];

/** Lowest article count per tier; the last tier takes every sport with any article. */
const BANDS = [100, 80, 60, 40, 20];

/** Rule order as the panel lists them, with whether each is hidden by default. */
const RULES = [
  { id: "discontinued", omitted: true, reason: "olympics.discontinued" },
  { id: "future-disciplines", omitted: false, reason: "olympics.futureDisciplines" },
  { id: "child-discipline", omitted: false, reason: "olympics.childDiscipline" },
];

const ICON = { summer: "☀️", winter: "❄️" };

const sameWord = (a, b) => a.toLowerCase() === b.toLowerCase();

/** A name as the list shows it: Wikidata lower-cases its labels by house rule, and an
 *  entry is a whole card. See build-elements.mjs. */
function capitalize(name) {
  const [first, ...rest] = Array.from(name);
  return first === undefined ? name : first.toUpperCase() + rest.join("");
}

/** A sport's names as a list entry: English, plus every language that differs from it. */
function entryOf(sport) {
  const en = capitalize(labelFor(sport.names, "en"));
  const out = { en };
  const unknown = [];
  for (const tag of NAME_LANGS.slice(1)) {
    const value = labelFor(sport.names, tag)?.replace(/\p{Cf}/gu, "").trim();
    if (!value) unknown.push(tag);
    else if (!sameWord(value, en)) out[tag] = capitalize(value);
  }
  if (unknown.length) out["?"] = unknown;
  return Object.keys(out).length === 1 ? en : out;
}

/** A category title per language: the season on the row, the Games' name in the hover.
 *  The Games' name alone made the row far too wide. */
function titleOf({ names, season }) {
  const out = {};
  for (const tag of NAME_LANGS) {
    const long = labelFor(names, tag);
    const short = labelFor(season, tag);
    if (long && short) out[tag] = { short: capitalize(short), long: capitalize(long) };
    else if (long ?? short) out[tag] = capitalize(long ?? short);
  }
  return out;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function main() {
  const write = process.argv.includes("--write");
  const dump = await readJson(join(RAW, "sport-names.json"));
  const games = await readJson(join(RAW, "games-names.json"));
  const excluded = await readJson(join(RAW, "excluded.json"));
  const fixedParents = await readJson(join(RAW, "parents.json"));

  const listed = Object.keys(dump).filter((q) => /^Q\d+$/.test(q) && !excluded[q]);
  const isListed = new Set(listed);
  const seasonOf = (s) => s.editions.at(-1)?.split(" ")[1] ?? s.games.at(-1);

  // "Current" per season: the latest edition that has begun, from every date the dump holds.
  const today = new Date().toISOString().slice(0, 10);
  const current = {};
  for (const ed of listed.flatMap((q) => dump[q].editions)) {
    const [date, kind] = ed.split(" ");
    if (date <= today && (!current[kind] || date > current[kind])) current[kind] = date;
  }

  const heldSince = (q, from, to = "9999") => {
    const season = seasonOf(dump[q]);
    return dump[q].editions.some((e) => e.endsWith(season) && e >= from[season] && e <= to);
  };
  const classOf = (q) => {
    if (!heldSince(q, current)) return "discontinued";
    if (!heldSince(q, current, `${today}~`)) return "future-disciplines";
    // Only a parent still held counts: rugby sevens is the Games' rugby now that rugby
    // union is gone, so it stands on its own.
    const parents = q in fixedParents ? [fixedParents[q].parent].filter(Boolean) : (dump[q].parents ?? []);
    if (parents.some((p) => isListed.has(p) && heldSince(p, current, `${today}~`))) return "child-discipline";
    return "base";
  };

  const coverage = {};
  for (const season of SEASONS) {
    const ids = listed.filter((q) => seasonOf(dump[q]) === season);
    const path = join(OUT, season, "sports.json");
    const old = await readJson(path).catch(() => null);

    const tiers = [...BANDS, 0].map(() => []);
    const rules = Object.fromEntries(RULES.map((r) => [r.id, []]));
    // The dump is sorted by article count, so each tier comes out ranked within.
    for (const q of ids) {
      const s = dump[q];
      if (s.wikipedias === 0) continue;
      const entry = entryOf(s);
      const band = BANDS.findIndex((b) => s.wikipedias >= b);
      tiers[band === -1 ? BANDS.length : band].push(entry);
      const cls = classOf(q);
      if (cls !== "base") rules[cls].push(typeof entry === "string" ? entry : entry.en);
      coverage[q] = { ...s, name: typeof entry === "string" ? entry : entry.en };
    }

    const ruleOf = (r) => ({ id: r.id, match: rules[r.id].sort(), count: true, reason: r.reason });
    const kept = RULES.filter((r) => rules[r.id].length);
    const topic = {
      // A stem held by one file is its id; once two seasons share it, each takes its prefix.
      id: SEASONS.length > 1 ? `${season}-sports` : "sports",
      title: old?.title ?? { en: "Sports", de: "Sportarten" },
      icon: old?.icon ?? "🏟️",
      description: `Every sport held at the ${labelFor(games[season].names, "en")}: current, past and announced. Fame tiers by how many Wikipedias have an article on the sport (tier 0 = most widely covered).`,
      generated: "fully",
      dataOrigin: "Wikidata",
      filePaths: {
        "scripts/sports/": ["dump-olympic-sports.mjs", "build-olympic-sports.mjs"],
        "data-raw/sports/": "olympia/",
      },
      languages: NAME_LANGS,
      incompleteTopic: true,
      sources: [
        `Sports & names: Wikidata, the sport (P641) of every event that is part of the ${labelFor(games[season].names, "en")} — https://www.wikidata.org/wiki/${games[season].qid} (see scripts/sports/dump-olympic-sports.mjs)`,
        "Tiers: how many language editions of Wikipedia have an article on the sport, from its Wikidata sitelinks — https://www.wikidata.org/wiki/Help:Sitelinks",
      ],
      lastUpdated: old?.lastUpdated ?? today,
      lastChecked: old?.lastChecked ?? today,
      ...(kept.some((r) => r.omitted) ? { omitted: kept.filter((r) => r.omitted).map(ruleOf) } : {}),
      ...(kept.some((r) => !r.omitted) ? { omittable: kept.filter((r) => !r.omitted).map(ruleOf) } : {}),
      // Every band, empty or not: the seasons merge tier by tier, so they must cut alike.
      tiers,
      tierConditions: [...BANDS.map(String), ">0"],
      rulerTooltip: { text: "ruler.sports.text", empty: "ruler.sports.empty" },
      inheritsUpwards: 1,
    };
    // A rebuild that changes nothing keeps its dates.
    const text = serializeTopic(topic);
    if (old && serializeTopic({ ...old, lastUpdated: topic.lastUpdated, lastChecked: topic.lastChecked }) !== text) {
      topic.lastUpdated = topic.lastChecked = today;
    }

    const counts = Object.entries(rules).map(([id, m]) => `${id} ${m.length}`).join(", ");
    console.log(`build-olympic-sports: ${season} ${ids.length} sports, tiers ${tiers.map((t) => t.length).join("/")}; ${counts}`);
    const gaps = tiers.flat().filter((e) => typeof e !== "string" && e["?"]);
    if (gaps.length) console.log(`  no name (${gaps.length}): ${gaps.map((e) => `${e.en} [${e["?"].join(" ")}]`).join(", ")}`);

    if (write) {
      await writeFile(path, serializeTopic(topic), "utf8");
      const catPath = join(OUT, season, "_category.json");
      const cat = await readJson(catPath).catch(() => ({}));
      await writeFile(catPath, serializeCategory({ ...cat, title: titleOf(games[season]), icon: ICON[season] }), "utf8");
    }
  }

  await writeCoverage(ROOT, "sports", coverage, NAME_LANGS, LANG_SRC, "wikipedias", write);
  console.log(write ? `  written => ${OUT}` : "  dry run - pass --write to save");
}

main().catch((err) => {
  console.error("build-olympic-sports failed:", err.message);
  process.exit(1);
});
