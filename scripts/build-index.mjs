// Scans data/topics/<topic>/<file>.json and emits data/index.json — a light
// manifest the frontend loads first so it can render the topic tree without
// downloading every topic. Generated file; never hand-edited. See PLANNING §4.1.
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS_DIR = join(ROOT, "data", "topics");
const OUT_FILE = join(ROOT, "data", "index.json");

const LANG_RE = /^[a-z]{2}(-[A-Z]{2})?$/;

/** Total words in a topic file (flat `words` + flattened `tiers`). */
function countWords(topic) {
  let n = 0;
  for (const group of topic.groups) {
    if (group.words) n += group.words.length;
    if (group.tiers) for (const tier of group.tiers) n += tier.length;
  }
  return n;
}

/** Pick the file that represents a topic's display metadata (prefer en, then de). */
function pickRepresentative(variants) {
  const byLang = (l) => variants.find((v) => v.lang === l);
  return byLang("en") ?? byLang("de") ?? variants[0];
}

async function readTopicDir(id) {
  const dir = join(TOPICS_DIR, id);
  // Sort so variant selection and langs ordering are deterministic across filesystems.
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();
  const variants = [];
  for (const file of files) {
    const stem = basename(file, ".json");
    let data;
    try {
      data = JSON.parse(await readFile(join(dir, file), "utf8"));
    } catch (err) {
      throw new Error(`data/topics/${id}/${file}: could not read/parse — ${err.message}`);
    }
    variants.push({ lang: LANG_RE.test(stem) ? stem : null, file, data });
  }
  return variants;
}

async function buildIndex() {
  let topicIds;
  try {
    topicIds = (await readdir(TOPICS_DIR, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  } catch {
    throw new Error(`No topics directory at ${TOPICS_DIR}`);
  }

  const topics = [];
  for (const id of topicIds) {
    const variants = await readTopicDir(id);
    if (variants.length === 0) continue;
    const rep = pickRepresentative(variants);
    const langs = variants.map((v) => v.lang).filter((l) => l !== null).sort();
    topics.push({
      id,
      title: rep.data.title,
      icon: rep.data.icon ?? null,
      langs, // empty array = language-neutral
      files: variants.map((v) => v.file), // JSON filenames the frontend can fetch
      groupCount: rep.data.groups.length,
      wordCount: countWords(rep.data),
    });
  }

  const manifest = { generatedAt: new Date().toISOString(), topics };
  await writeFile(OUT_FILE, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`build-index: wrote ${topics.length} topic(s) → data/index.json`);
}

buildIndex().catch((err) => {
  console.error("build-index failed:", err.message);
  process.exit(1);
});
