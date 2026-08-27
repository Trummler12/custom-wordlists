// One-off codemod: flatten single-group, non-foldered topics to the flat form the
// F batch introduced — the group's list fields lift onto the topic, `groups` goes.
//
//   node scripts/build-index.mjs        # the manifest this reads must be current
//   node scripts/flatten-topics.mjs [--write]
//
// LEFT ALONE, on purpose:
// - multi-group topics (heroes/villains) — they are genuinely several lists;
// - foldered topics (a lone file in a folder named after it) — their group row
//   carries a distinct label ("Characters") and their expander anticipates a split
//   into a category, so the group there is meaningful, not redundant.
//
// The manifest's `foldered` and `groupCount` are the source of truth for which is
// which, so run build-index first.
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serializeTopic } from "./lib/serialize.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS = join(ROOT, "data", "topics");

// The group's list-carrying fields, in the order a flat topic wants them.
const LIFT = ["defaultNames", "tierNotes", "omitted", "omittable", "words", "tiers", "tierConditions"];

/** Move the single group's fields onto the topic; drop `groups`. The group's `id`
 *  and `title` are discarded — a flat topic is its own group, keyed by the topic's
 *  id and shown under the topic's title, and for a solo topic the group title was
 *  never displayed. */
function flatten(topic) {
  const [group] = topic.groups;
  for (const key of LIFT) if (group[key] !== undefined) topic[key] = group[key];
  delete topic.groups;
  // The one group is now the topic itself (id = topic.id), so any preset that
  // bundled the old group id has to point at the topic id instead.
  for (const preset of topic.presets ?? []) preset.groups = [topic.id];
  return topic;
}

async function main() {
  const manifest = JSON.parse(await readFile(join(ROOT, "data", "index.json"), "utf8"));
  const targets = manifest.topics.filter((t) => !t.foldered && t.groupCount === 1);

  let changed = 0;
  for (const t of targets) {
    const file = join(TOPICS, ...t.path.split("/"));
    const topic = JSON.parse(await readFile(file, "utf8"));
    if (!topic.groups) continue; // already flat
    const text = serializeTopic(flatten(topic));
    if (process.argv.includes("--write")) await writeFile(file, text, "utf8");
    console.log(`${process.argv.includes("--write") ? "flattened" : "would flatten"} ${t.path}`);
    changed++;
  }
  console.log(`\n${changed} topic(s)${process.argv.includes("--write") ? " flattened" : " to flatten (dry run — pass --write)"}`);
}

main().catch((err) => {
  console.error("flatten-topics failed:", err.message);
  process.exit(1);
});
