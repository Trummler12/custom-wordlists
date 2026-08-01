// Scans data/topics/**/<topic>/<file>.json and emits data/index.json — a light
// manifest the frontend loads first so it can render the topic tree without
// downloading every topic. A "topic" is any directory that directly holds JSON
// files; the folders above it form an arbitrarily deep category path (e.g.
// "gaming" or "gaming/pokemon"). Generated file; never hand-edited. See PLANNING §4.1.
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

/**
 * Recursively find topics under data/topics. A directory that directly holds
 * JSON files is a topic (a leaf — we don't recurse into it); anything above is
 * a category segment. Returns `{ segments }` per topic (path from topics/ down
 * to and including the topic folder), sorted for determinism.
 */
async function collectTopics(segments) {
  const dir = join(TOPICS_DIR, ...segments);
  const entries = await readdir(dir, { withFileTypes: true });
  const jsonFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".json"));
  if (segments.length > 0 && jsonFiles.length > 0) {
    return [{ segments, files: jsonFiles.map((e) => e.name).sort() }];
  }
  const subDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  const out = [];
  for (const sub of subDirs) out.push(...(await collectTopics([...segments, sub])));
  return out;
}

async function readVariants(topicDir, files, relPath) {
  const variants = [];
  for (const file of files) {
    const stem = basename(file, ".json");
    let data;
    try {
      data = JSON.parse(await readFile(join(topicDir, file), "utf8"));
    } catch (err) {
      throw new Error(`data/topics/${relPath}/${file}: could not read/parse — ${err.message}`);
    }
    variants.push({ lang: LANG_RE.test(stem) ? stem : null, file, data });
  }
  return variants;
}

async function buildIndex() {
  let found;
  try {
    found = await collectTopics([]);
  } catch {
    throw new Error(`No topics directory at ${TOPICS_DIR}`);
  }

  const topics = [];
  for (const { segments, files } of found) {
    const id = segments[segments.length - 1];
    const category = segments.slice(0, -1).join("/"); // "" = uncategorized
    const relPath = segments.join("/");
    const variants = await readVariants(join(TOPICS_DIR, ...segments), files, relPath);
    if (variants.length === 0) continue;
    const rep = pickRepresentative(variants);
    const langs = variants.map((v) => v.lang).filter((l) => l !== null).sort();
    topics.push({
      id,
      category,
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
