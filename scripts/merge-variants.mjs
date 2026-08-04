// One-shot codemod: merges each localized topic's `de.json` + `en.json` into a
// single file for the new inline-i18n model. Identical entries collapse to a
// plain string / name pair; entries that differ become a language map
// { "en": …, "de": … } (en = base). Group/topic titles that differ become a
// per-language `titles` map. The result is relocated per PLAN (flat single file
// vs. a `characters.json` inside a folder that may grow), and the old
// `de.json`/`en.json` (and now-empty folders) are removed.
//
// Run once: `node scripts/merge-variants.mjs`. Safe to re-run (skips folders that
// no longer hold a de/en pair). See _untracked/PR/18-inline-i18n-entries.md.
import { readFile, writeFile, readdir, rm, rmdir } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS_DIR = join(ROOT, "data", "topics");

// Placement decisions (see PR #18). "flat" → move up to <parent>/<folder>.json;
// "folder" → keep the folder, write the merged list as <folder>/<file>.
const GENERATIONS = Array.from({ length: 9 }, (_, i) => [
  `gaming/pokemon/pokemon/generation-${i + 1}`,
  { mode: "flat" },
]);
const PLAN = new Map([
  ["animation/south-park", { mode: "flat" }],
  ["animation/spongebob", { mode: "folder", file: "characters.json" }],
  ["anime/dragon-ball-z", { mode: "folder", file: "characters.json" }],
  ["film-tv/disney", { mode: "folder", file: "characters.json" }],
  ["film-tv/harry-potter", { mode: "folder", file: "characters.json" }],
  ["film-tv/lord-of-the-rings", { mode: "folder", file: "characters.json" }],
  ["gaming/pokemon/items", { mode: "flat" }],
  ["gaming/pokemon/moves", { mode: "flat" }],
  ...GENERATIONS,
  ["science/chemistry/elements", { mode: "flat" }],
  ["sports/olympia/sports", { mode: "flat" }],
]);

// ─── merge helpers ────────────────────────────────────────────────────────────

/** True when two word entries render identically across languages. */
function entryEqual(a, b) {
  if (typeof a === "string" || typeof b === "string") return a === b;
  return a.short === b.short && a.long === b.long;
}
/** Merge one positional entry: shared → the entry itself; else a language map. */
function mergeEntry(en, de) {
  return entryEqual(en, de) ? en : { en, de };
}
function mergeList(en, de, label) {
  if (en.length !== de.length) throw new Error(`${label}: entry count differs (en ${en.length} / de ${de.length})`);
  return en.map((e, i) => mergeEntry(e, de[i]));
}
function mergeGroup(gEn, gDe, label) {
  if (gEn.id !== gDe.id) throw new Error(`${label}: group id mismatch (${gEn.id} / ${gDe.id})`);
  const out = { id: gEn.id, title: gEn.title };
  if (gEn.title !== gDe.title) out.titles = { en: gEn.title, de: gDe.title };
  if (gEn.tiers) {
    if (gEn.tiers.length !== gDe.tiers.length) throw new Error(`${label}/${gEn.id}: tier count differs`);
    out.tiers = gEn.tiers.map((tier, i) => mergeList(tier, gDe.tiers[i], `${label}/${gEn.id} tier ${i}`));
  }
  if (gEn.words) out.words = mergeList(gEn.words, gDe.words, `${label}/${gEn.id} words`);
  return out;
}
function mergeTopic(en, de, label) {
  if (en.groups.length !== de.groups.length) throw new Error(`${label}: group count differs`);
  return {
    id: en.id,
    title: en.title,
    ...(en.title !== de.title ? { titles: { en: en.title, de: de.title } } : {}),
    ...(en.icon ? { icon: en.icon } : {}),
    ...(en.description ? { description: en.description } : {}),
    languages: ["de", "en"],
    ...(en.lastUpdated ? { lastUpdated: en.lastUpdated } : {}),
    ...(en.lastChecked ? { lastChecked: en.lastChecked } : {}),
    groups: en.groups.map((g, i) => mergeGroup(g, de.groups[i], label)),
    ...(en.presets ? { presets: en.presets } : {}),
  };
}

// ─── serializer (house style: one tier per line, blank line between tiers) ─────

/** An array with one entry per line: entries at `indent`, closing bracket at `close`. */
function entryBlock(arr, indent, close) {
  return "[\n" + arr.map((e) => indent + JSON.stringify(e)).join(",\n") + "\n" + close + "]";
}
function serializeTiers(tiers) {
  // Each tier is a multi-line array (one entry per line); a blank line separates tiers.
  return "[\n" + tiers.map((t) => "        " + entryBlock(t, "          ", "        ")).join(",\n\n") + "\n      ]";
}
function serializeGroup(g) {
  const p = [`      "id": ${JSON.stringify(g.id)}`, `      "title": ${JSON.stringify(g.title)}`];
  if (g.titles) p.push(`      "titles": ${JSON.stringify(g.titles)}`);
  if (g.tiers) p.push(`      "tiers": ${serializeTiers(g.tiers)}`);
  if (g.words) p.push(`      "words": ${entryBlock(g.words, "        ", "      ")}`);
  return "    {\n" + p.join(",\n") + "\n    }";
}
function serializeTopic(t) {
  const kv = [`  "id": ${JSON.stringify(t.id)}`, `  "title": ${JSON.stringify(t.title)}`];
  if (t.titles) kv.push(`  "titles": ${JSON.stringify(t.titles)}`);
  if (t.icon) kv.push(`  "icon": ${JSON.stringify(t.icon)}`);
  if (t.description) kv.push(`  "description": ${JSON.stringify(t.description)}`);
  kv.push(`  "languages": ${JSON.stringify(t.languages)}`);
  if (t.lastUpdated) kv.push(`  "lastUpdated": ${JSON.stringify(t.lastUpdated)}`);
  if (t.lastChecked) kv.push(`  "lastChecked": ${JSON.stringify(t.lastChecked)}`);
  kv.push(`  "groups": [\n` + t.groups.map(serializeGroup).join(",\n") + `\n  ]`);
  if (t.presets) kv.push(`  "presets": [\n` + t.presets.map((pr) => "    " + JSON.stringify(pr)).join(",\n") + `\n  ]`);
  return "{\n" + kv.join(",\n") + "\n}\n";
}

// ─── driver ───────────────────────────────────────────────────────────────────

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
async function processOne(rel, cfg) {
  const dir = join(TOPICS_DIR, ...rel.split("/"));
  let names;
  try {
    names = await readdir(dir);
  } catch {
    console.log(`skip ${rel}: folder missing`);
    return false;
  }
  if (!names.includes("en.json") || !names.includes("de.json")) {
    console.log(`skip ${rel}: no de/en pair`);
    return false;
  }
  const en = await readJson(join(dir, "en.json"));
  const de = await readJson(join(dir, "de.json"));
  const merged = mergeTopic(en, de, rel);
  delete merged.lang; // legacy field never survives the merge
  const text = serializeTopic(merged);
  // Sanity: the serialized text must round-trip to the same object.
  if (JSON.stringify(JSON.parse(text)) !== JSON.stringify(merged)) {
    throw new Error(`${rel}: serializer produced non-equivalent JSON`);
  }

  if (cfg.mode === "flat") {
    const id = basename(rel);
    const target = join(dirname(dir), `${id}.json`);
    await writeFile(target, text, "utf8");
    await rm(join(dir, "en.json"));
    await rm(join(dir, "de.json"));
    await rmdir(dir); // now empty
    console.log(`flat   ${rel} → ${dirname(rel)}/${id}.json`);
  } else {
    const target = join(dir, cfg.file);
    await writeFile(target, text, "utf8");
    await rm(join(dir, "en.json"));
    await rm(join(dir, "de.json"));
    console.log(`folder ${rel} → ${rel}/${cfg.file}`);
  }
  return true;
}

async function main() {
  let done = 0;
  for (const [rel, cfg] of PLAN) if (await processOne(rel, cfg)) done++;
  console.log(`merge-variants: merged ${done}/${PLAN.size} topic(s)`);
}

main().catch((err) => {
  console.error("merge-variants failed:", err.message);
  process.exit(1);
});
