// One-off codemod: dissolve the `groups` level entirely. Every grouped topic
// becomes a category (its own folder, via a new `_category.json`) holding one flat
// topic per group.
//
//   node scripts/dissolve-groups.mjs [--write]
//
// - The topic's franchise title and icon become the category's.
// - Each group becomes a flat topic file named after the group id, titled after
//   the group, with a fitting icon; the topic's list-describing metadata
//   (languages, sources, …) rides along.
// - `presets` are dropped: they bundled group ids, and with no groups the topic's
//   own checkbox is "all" and a split gives "heroes only" its own topic.
// - Ids are disambiguated over the whole tree exactly as build-index does, so a
//   repeated stem (nine `characters`) gets its folder as a prefix.
import { readFile, writeFile, rm, readdir } from "node:fs/promises";
import { join, dirname, basename, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { serializeTopic } from "./lib/serialize.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS = join(ROOT, "data", "topics");
const WRITE = process.argv.includes("--write");

/** A cast list's icon by group id; the theatre masks are the default. */
const ICON = { heroes: "🦸", villains: "🦹", classics: "🐭", "animated-films": "🎬" };
const DEFAULT_ICON = "🎭";

/** Topic-level metadata that describes the LIST, so it moves onto each flat topic
 *  rather than the category. `id`/`title`/`icon`/`groups`/`presets` do not. */
const MOVE = ["description", "languages", "usesEnglishFor", "generatedRomaji", "sources", "credits", "corrections", "lastUpdated", "lastChecked"];
const LIST = ["defaultNames", "tierNotes", "omitted", "omittable", "words", "tiers", "tierConditions"];

async function allTopicFiles(dir = TOPICS) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...(await allTopicFiles(join(dir, e.name))));
    else if (e.name.endsWith(".json") && e.name !== "_category.json") out.push(join(dir, e.name));
  }
  return out;
}

const catPath = (fileDir) => relative(TOPICS, fileDir).split(/[\\/]/).join("/");

async function main() {
  const files = await allTopicFiles();
  const grouped = [];
  const finalStems = []; // { cat, stem } for the whole post-conversion tree

  for (const f of files) {
    const d = JSON.parse(await readFile(f, "utf8"));
    const cat = catPath(dirname(f));
    if (d.groups) {
      grouped.push({ file: f, dir: dirname(f), cat, topic: d });
      for (const g of d.groups) finalStems.push({ cat, stem: g.id });
    } else {
      finalStems.push({ cat, stem: basename(f, ".json") });
    }
  }

  // Disambiguate stems the way build-index does: prefix the folder where repeated.
  const count = {};
  for (const { stem } of finalStems) count[stem] = (count[stem] ?? 0) + 1;
  const idFor = (cat, stem) => (count[stem] > 1 ? `${cat.split("/").pop()}-${stem}` : stem);

  for (const { file, dir, cat, topic } of grouped) {
    // The category takes the franchise identity.
    const category = {};
    if (topic.title !== undefined) category.title = topic.title;
    if (topic.icon !== undefined) category.icon = topic.icon;
    await write(join(dir, "_category.json"), JSON.stringify(category, null, 2) + "\n");

    const newNames = new Set();
    for (const g of topic.groups) {
      const flat = { id: idFor(cat, g.id), title: g.title, icon: ICON[g.id] ?? DEFAULT_ICON };
      for (const k of MOVE) if (topic[k] !== undefined) flat[k] = topic[k];
      for (const k of LIST) if (g[k] !== undefined) flat[k] = g[k];
      const name = `${g.id}.json`;
      newNames.add(name);
      await write(join(dir, name), serializeTopic(flat));
    }
    // Drop the original if a split renamed it away (dc/characters.json → heroes+villains).
    if (!newNames.has(basename(file))) await del(file);
    console.log(`${cat}: ${topic.groups.map((g) => idFor(cat, g.id)).join(", ")}`);
  }
  console.log(`\n${grouped.length} topic(s) dissolved${WRITE ? "" : " (dry run — pass --write)"}`);
}

async function write(path, text) {
  if (WRITE) await writeFile(path, text, "utf8");
}
async function del(path) {
  if (WRITE) await rm(path);
}

main().catch((err) => {
  console.error("dissolve-groups failed:", err.message);
  process.exit(1);
});
