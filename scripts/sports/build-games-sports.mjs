// Writes every Games rubric's sports topic (data/topics/sports/games/<series>[/<season>]/
// sports.json), their categories' titles, and the sports' language coverage page data
// (data/coverage/sports.json), all from what scripts/sports/dump-games-sports.mjs writes.
//
//   node scripts/sports/build-games-sports.mjs [--write]
//
// THE WHOLE FILE IS GENERATED: membership, rules, names and tiers. Two visible tables in
// data-raw/sports/games/ are the only hand input: excluded.json (what the dump finds that
// is no sport) and parents.json (where the Games split sports otherwise than Wikidata).
//
// A SPORT BELONGS TO ONE SEASON of a series: the kind of the latest edition it was held
// at. Figure skating was held at two Summer Olympics before the Winter Games existed, and
// is a winter sport.
//
// CLASSES, the same for every list, read off its editions' dates, never off a year written
// here. "Recent" is the last two editions that have begun and the next one:
//   - `discontinued` (omitted): held at none of the recent editions, itself or through
//     one of its disciplines on the list. Two editions back, so
//     one cut programme (Glasgow 2026) drops nothing; one ahead, so a sport returning is
//     continued (Trummler, 2026-10-09);
//   - `demonstration-sports` (omitted): the same, and every edition it was at showed it
//     only as a demonstration, never for medals;
//   - `future-disciplines` (omittable): of the recent editions, held only at the next;
//   - `child-discipline` (omittable): held now, and a discipline of another sport of the
//     list that is held now;
//   - the rest is the base list.
//
// TIERS by how many Wikipedias have an article on the sport, in fixed steps of 20, so every
// list cuts at the same counts and their merge under games/ stays ranked.
//
// The analysis behind this: _untracked/docs/Queries/sports/Olympics.md (PR #38).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCoverage } from "../geography/coverage.mjs";
import { serializeCategory, serializeTopic } from "../lib/serialize.mjs";
import { LANG_SRC, NAME_LANGS, labelFor } from "../lib/wikidata.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RAW = join(ROOT, "data-raw", "sports", "games");
const OUT = join(ROOT, "data", "topics", "sports", "games");

/** Lowest article count per tier; the last tier takes every sport with any article. */
const BANDS = [100, 80, 60, 40, 20];

/** Rule order as the panel lists them, with whether each is hidden by default. All of them
 *  sit in the sports' inclusion panel (☑️), not the 🚫 one. */
const RULES = [
  { id: "discontinued", omitted: true, reason: "games.discontinued" },
  { id: "demonstration-sports", omitted: true, reason: "games.demonstrationSports" },
  { id: "future-disciplines", omitted: false, reason: "games.futureDisciplines" },
  { id: "child-discipline", omitted: false, reason: "games.childDiscipline" },
];
const PANEL_ICON = "sport-type";

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

/** A category title per language: the season on the row, the Games' name in the hover
 *  (the Games' name alone made the row far too wide); an unsplit series' name as it is. */
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
  const today = new Date().toISOString().slice(0, 10);

  const listed = Object.keys(dump).filter((q) => /^Q\d+$/.test(q) && !excluded[q]);
  const listOf = (edition) => edition.slice(11);
  const seriesOf = (list) => list.split("/")[0];

  // Each sport's lists, one season per series: the season of its latest edition there.
  const listsOf = new Map();
  for (const q of listed) {
    const bySeries = new Map();
    for (const list of dump[q].lists) {
      const prev = bySeries.get(seriesOf(list));
      const latest = (l) => dump[q].editions.filter((e) => listOf(e) === l).at(-1) ?? "";
      if (!prev || latest(list) > latest(prev) || (latest(list) === latest(prev) && list > prev)) {
        bySeries.set(seriesOf(list), list);
      }
    }
    listsOf.set(q, [...bySeries.values()]);
  }

  // Per list, its recent editions: the last two begun and the next, from every date the
  // dump holds for it.
  const recent = {};
  for (const list of Object.keys(games)) {
    const dates = [...new Set(listed.flatMap((q) => dump[q].editions.filter((e) => listOf(e) === list)))]
      .map((e) => e.slice(0, 10))
      .sort();
    const begun = dates.filter((d) => d <= today);
    recent[list] = { past: begun.slice(-2), next: dates.find((d) => d > today) };
  }
  // A sport counts as held where one of its disciplines on the same list was: cycle sport
  // at the Commonwealth Games, athletics as Para athletics at the Paralympics.
  const parentsOf = (q) => (q in fixedParents ? [fixedParents[q].parent].filter(Boolean) : (dump[q].parents ?? []));
  const childrenOf = new Map();
  for (const q of listed) for (const p of parentsOf(q)) (childrenOf.get(p) ?? childrenOf.set(p, []).get(p)).push(q);
  const ownHeldAt = (q, list, dates) => dates.some((d) => dump[q].editions.includes(`${d} ${list}`));
  const heldAt = (q, list, dates) =>
    ownHeldAt(q, list, dates) ||
    (childrenOf.get(q) ?? []).some((c) => listsOf.get(c).includes(list) && ownHeldAt(c, list, dates));
  const heldNow = (q, list) => heldAt(q, list, recent[list].past);

  const classOf = (q, list) => {
    const { past, next } = recent[list];
    if (!heldAt(q, list, next ? [...past, next] : past)) {
      const eds = dump[q].editions.filter((e) => listOf(e) === list);
      const demos = new Set(dump[q].demonstrations ?? []);
      return eds.length && eds.every((e) => demos.has(e)) ? "demonstration-sports" : "discontinued";
    }
    if (!heldNow(q, list)) return "future-disciplines";
    // Only a parent held now counts: rugby sevens is the Games' rugby now that rugby
    // union is gone, so it stands on its own.
    if (parentsOf(q).some((p) => listsOf.get(p)?.includes(list) && heldNow(p, list))) return "child-discipline";
    return "base";
  };

  const coverage = {};
  let first; // the first list's topic, whose title a new list starts from
  for (const [list, series] of Object.entries(games)) {
    const season = list.split("/")[1];
    const ids = listed.filter((q) => listsOf.get(q).includes(list));
    const path = join(OUT, list, "sports.json");
    const old = await readJson(path).catch(() => null);
    const name = labelFor(series.names, "en");

    const tiers = [...BANDS, 0].map(() => []);
    const rules = Object.fromEntries(RULES.map((r) => [r.id, []]));
    // The dump is sorted by article count, so each tier comes out ranked within.
    for (const q of ids) {
      const s = dump[q];
      if (s.wikipedias === 0) continue;
      const entry = entryOf(s);
      const band = BANDS.findIndex((b) => s.wikipedias >= b);
      tiers[band === -1 ? BANDS.length : band].push(entry);
      const cls = classOf(q, list);
      if (cls !== "base") rules[cls].push(typeof entry === "string" ? entry : entry.en);
      const { lists, ...rest } = s;
      coverage[q] = { ...rest, name: typeof entry === "string" ? entry : entry.en };
    }

    const ruleOf = (r) => ({ id: r.id, match: rules[r.id].sort(), count: true, reason: r.reason, icon: PANEL_ICON });
    const kept = RULES.filter((r) => rules[r.id].length);
    const topic = {
      // Ids are global, and every Games rubric holds a sports.json.
      id: `${list.replace("/", "-")}-sports`,
      title: old?.title ?? first?.title ?? { en: "Sports", de: "Sportarten" },
      icon: old?.icon ?? first?.icon ?? "🏟️",
      description: `Every sport held at the ${name}: current, past and announced. Fame tiers by how many Wikipedias have an article on the sport (tier 0 = most widely covered).`,
      generated: "fully",
      dataOrigin: "Wikidata",
      filePaths: {
        "scripts/sports/": ["dump-games-sports.mjs", "build-games-sports.mjs"],
        "data-raw/sports/": "games/",
      },
      languages: NAME_LANGS,
      incompleteTopic: true,
      sources: [
        `Sports & names: Wikidata, the sport (P641) of every event that is part of an edition of the ${name} — https://www.wikidata.org/wiki/${series.qid} (see scripts/sports/dump-games-sports.mjs)`,
        "Tiers: how many language editions of Wikipedia have an article on the sport, from its Wikidata sitelinks — https://www.wikidata.org/wiki/Help:Sitelinks",
      ],
      lastUpdated: old?.lastUpdated ?? today,
      lastChecked: old?.lastChecked ?? today,
      ...(kept.some((r) => r.omitted) ? { omitted: kept.filter((r) => r.omitted).map(ruleOf) } : {}),
      ...(kept.some((r) => !r.omitted) ? { omittable: kept.filter((r) => !r.omitted).map(ruleOf) } : {}),
      // Every band, empty or not: the lists merge tier by tier, so they must cut alike.
      tiers,
      tierConditions: [...BANDS.map(String), ">0"],
      rulerTooltip: { text: "ruler.sports.text", empty: "ruler.sports.empty" },
      // All meet at games/; a season split skips its series' level.
      inheritsUpwards: season ? 2 : 1,
      ...(season ? { skipInherit: 1 } : {}),
    };
    first ??= topic;
    // A rebuild that changes nothing keeps its dates.
    const text = serializeTopic(topic);
    if (old && serializeTopic({ ...old, lastUpdated: topic.lastUpdated, lastChecked: topic.lastChecked }) !== text) {
      topic.lastUpdated = topic.lastChecked = today;
    }

    const counts = Object.entries(rules).map(([id, m]) => `${id} ${m.length}`).join(", ");
    console.log(`build-games-sports: ${list} ${ids.length} sports, tiers ${tiers.map((t) => t.length).join("/")}; ${counts}`);
    const gaps = tiers.flat().filter((e) => typeof e !== "string" && e["?"]);
    if (gaps.length) console.log(`  no name (${gaps.length}): ${gaps.map((e) => `${e.en} [${e["?"].join(" ")}]`).join(", ")}`);

    if (write) {
      await mkdir(join(OUT, list), { recursive: true });
      await writeFile(path, serializeTopic(topic), "utf8");
      const catPath = join(OUT, list, "_category.json");
      const cat = await readJson(catPath).catch(() => ({}));
      await writeFile(catPath, serializeCategory({ ...cat, title: titleOf(series), ...(season ? { icon: ICON[season] } : {}) }), "utf8");
    }
  }

  await writeCoverage(ROOT, "sports", coverage, NAME_LANGS, LANG_SRC, "wikipedias", write);
  console.log(write ? `  written => ${OUT}` : "  dry run - pass --write to save");
}

main().catch((err) => {
  console.error("build-games-sports failed:", err.message);
  process.exit(1);
});
