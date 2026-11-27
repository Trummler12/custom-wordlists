// Writes data/topics/science/<folder>/<topic>.json, the folder's _category.json (once), and
// the topic's language coverage page data (data/coverage/<topic>.json), all from what
// dump-class-topic.mjs wrote.
//
//   node scripts/science/build-class-topic.mjs <topic> [--write]
//
// THE WHOLE FILE IS GENERATED: membership, tiers, rules and names, per the topic's entry in
// class-topics.mjs. The one hand input beside the dump is the visible exclusion list
// data-raw/science/<folder>/<topic>-excluded.json ({ Q…: why }), for what the members hold
// that is no entry of the topic. The title and icon are only seeded from the config: once
// the file exists they are kept, so translations added by hand survive a rebuild. The same
// for the folder's _category.json: written from the config's `category` (its own title, or
// the labels of its `qid`) only while there is none.
//
// AN ITEM WITH NO ENGLISH LABEL IS LEFT OUT and reported: English is an entry's identity.
//
// A RULE MATCHES ANY LANGUAGE FORM of an entry (src/lib/omitted.ts), so a member's English
// name that another entry carries in some language would hide that entry too (Chinese *Net*
// is Reticulum in Dutch). The build lists such an entry in the rule's `except`. An English
// name twice over stops the build.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCoverage } from "../geography/coverage.mjs";
import { capitalize, entryOf, formsOf } from "../lib/entries.mjs";
import { serializeCategory, serializeTopic } from "../lib/serialize.mjs";
import { LANG_SRC, NAME_LANGS, labelFor } from "../lib/wikidata.mjs";
import { CLASS_TOPICS } from "./class-topics.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const link = (qs) => Object.values(qs).map((q) => `https://www.wikidata.org/wiki/${q}`).join(", ");

async function main() {
  const id = process.argv[2];
  const write = process.argv.includes("--write");
  const cfg = CLASS_TOPICS[id];
  if (!cfg) throw new Error(`unknown topic "${id}"; known: ${Object.keys(CLASS_TOPICS).join(", ")}`);
  const rules = cfg.rules ?? [];

  const raw = join(ROOT, "data-raw", "science", cfg.folder);
  const dump = await readJson(join(raw, `${id}.json`));
  const excluded = await readJson(join(raw, `${id}-excluded.json`)).catch(() => ({}));
  const dir = join(ROOT, "data", "topics", "science", cfg.folder);
  const path = join(dir, `${id}.json`);
  const old = await readJson(path).catch(() => null);
  const today = new Date().toISOString().slice(0, 10);

  const unnamed = [];
  const items = Object.entries(dump)
    .filter(([q]) => /^Q\d+$/.test(q) && !(q in excluded))
    .map(([q, it]) => ({ qid: q, ...it }))
    .filter((it) => labelFor(it.names, "en") || !unnamed.push(it.qid))
    .sort((a, b) => b.wikipedias - a.wikipedias || Number(a.qid.slice(1)) - Number(b.qid.slice(1)));

  const tiers = cfg.tiers.map(() => []);
  const members = Object.fromEntries(rules.map((r) => [r.id, []]));
  const coverage = {};
  for (const it of items) {
    const entry = entryOf(it.names);
    const en = typeof entry === "string" ? entry : entry.en;
    tiers[cfg.tiers.findIndex((t) => t.test(it))].push(entry);
    for (const r of rules) if (r.test(it)) members[r.id].push(en);
    coverage[it.qid] = { name: en, wikipedias: it.wikipedias, names: it.names };
  }

  const entries = tiers.flat();
  const except = Object.fromEntries(rules.map((r) => [r.id, []]));
  for (const r of rules) {
    const own = new Set(members[r.id]);
    for (const e of entries) {
      const en = typeof e === "string" ? e : e.en;
      if (!own.has(en) && formsOf(e).some((f) => own.has(f))) except[r.id].push(en);
    }
  }
  const clashes = [];
  const seen = new Set();
  for (const e of entries) {
    const en = typeof e === "string" ? e : e.en;
    if (seen.has(en)) clashes.push(`"${en}" twice`);
    seen.add(en);
  }

  const ruleOf = (r) => ({
    id: r.id,
    match: members[r.id].sort(),
    ...(except[r.id].length ? { except: except[r.id].sort() } : {}),
    count: true,
    ...(r.icon ? { icon: r.icon } : {}),
    reason: r.reason,
    ...(r.wd ? { wd: r.wd } : {}),
  });
  const kept = rules.filter((r) => members[r.id].length);
  const ofKind = (kind) => kept.filter((r) => r.kind === kind).map(ruleOf);
  const floor = cfg.minSitelinks ? ` with at least ${cfg.minSitelinks} sitelinks` : "";
  const memberText = cfg.classes
    ? `the instances of ${link(cfg.classes)}${floor}`
    : `the parts (P527) of ${link(cfg.partsOf)}${floor}`;
  const topic = {
    id,
    title: old?.title ?? cfg.title,
    icon: old?.icon ?? cfg.icon,
    ...(cfg.order ? { order: cfg.order } : {}),
    description: cfg.description,
    generated: "fully",
    dataOrigin: "Wikidata",
    filePaths: {
      "scripts/science/": ["class-topics.mjs", "dump-class-topic.mjs", "build-class-topic.mjs"],
      "data-raw/science/": `${cfg.folder}/`,
    },
    languages: NAME_LANGS,
    sources: `Entries & names: Wikidata, ${memberText} (see scripts/science/class-topics.mjs)${cfg.sources ? `; ${cfg.sources}` : ""}`,
    lastUpdated: old?.lastUpdated ?? today,
    lastChecked: old?.lastChecked ?? today,
    ...(ofKind("omitted").length ? { omitted: ofKind("omitted") } : {}),
    ...(ofKind("omittable").length ? { omittable: ofKind("omittable") } : {}),
    tiers,
    tierConditions: cfg.tiers.map((t) => t.condition),
    ...(cfg.rulerTooltip ? { rulerTooltip: cfg.rulerTooltip } : {}),
  };
  // A rebuild that changes nothing keeps its dates.
  if (old && serializeTopic({ ...old, lastUpdated: topic.lastUpdated, lastChecked: topic.lastChecked }) !== serializeTopic(topic)) {
    topic.lastUpdated = topic.lastChecked = today;
  }

  const counts = rules.map((r) => `${r.id} ${members[r.id].length}`).join(", ");
  console.log(`build-class-topic: ${id} ${entries.length} entries, tiers ${tiers.map((t) => t.length).join("/")}${counts ? `; ${counts}` : ""}`);
  for (const r of rules) if (except[r.id].length) console.log(`  ${r.id} except (a member's name in another language): ${except[r.id].join(", ")}`);
  if (Object.keys(excluded).length) console.log(`  excluded (${Object.keys(excluded).length}): ${Object.entries(excluded).map(([q, why]) => `${q} ${why}`).join("; ")}`);
  // A fix on Wikidata can take an excluded item out of the members; its line is then dead.
  const stale = Object.keys(excluded).filter((q) => !(q in dump));
  if (stale.length) console.log(`  excluded but no longer dumped, drop from ${id}-excluded.json: ${stale.join(", ")}`);
  for (const w of cfg.check?.(items) ?? []) console.log(`  CHECK: ${w}`);
  if (unnamed.length) console.log(`  no English label, left out (${unnamed.length}): ${unnamed.join(", ")}`);
  const gaps = entries.filter((e) => typeof e !== "string" && e["?"]);
  if (gaps.length) console.log(`  missing names (${gaps.length}): ${gaps.map((e) => `${e.en} [${e["?"].join(" ")}]`).join(", ")}`);
  if (clashes.length) {
    console.error(`  ENGLISH NAMES TWICE (${clashes.length}), nothing written:\n    ${clashes.join("\n    ")}`);
    process.exitCode = 1;
    return;
  }

  if (write) {
    await mkdir(dir, { recursive: true });
    await writeFile(path, serializeTopic(topic), "utf8");
    const catPath = join(dir, "_category.json");
    const cat = await readJson(catPath).catch(() => null);
    if (!cat && cfg.category) {
      const title =
        cfg.category.title ??
        Object.fromEntries(
          NAME_LANGS.map((tag) => [tag, labelFor(dump.category?.names, tag)]).filter(([, v]) => v).map(([t, v]) => [t, capitalize(v)]),
        );
      await writeFile(catPath, serializeCategory({ title, ...(cfg.category.icon ? { icon: cfg.category.icon } : {}) }), "utf8");
    }
  }
  await writeCoverage(ROOT, id, coverage, NAME_LANGS, LANG_SRC, "wikipedias", write);
  console.log(write ? `  written => ${path}` : "  dry run - pass --write to save");
}

main().catch((err) => {
  console.error("build-class-topic failed:", err.message);
  process.exit(1);
});
