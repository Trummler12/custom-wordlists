// Scans data/topics and emits data/index.json — a light manifest the frontend
// loads first so it can render the topic tree without downloading every topic.
// A topic is either a folder that holds JSON files and no subfolders (id = folder
// name; neutral <content>.json or <lang>.json variants), or a single JSON file
// sitting loose in a category folder that also has subfolders (id = file stem,
// `flat`). Folders above a topic form an arbitrarily deep category path (e.g.
// "gaming" or "sports/olympia"). Generated file; never hand-edited. See PLANNING §4.1.
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
 * Recursively find topics under data/topics. A folder with JSON files and no
 * subfolders is a topic leaf (id = folder name). A folder that also has
 * subfolders is a category: each loose JSON file in it is a single-file topic
 * (id = file stem, `flat`), and its subfolders are walked. Folders above a
 * topic are category segments. Returns `{ segments, files, flat }` per topic,
 * sorted for determinism.
 */
async function collectTopics(segments) {
  const dir = join(TOPICS_DIR, ...segments);
  const entries = await readdir(dir, { withFileTypes: true });
  const jsonFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".json")).map((e) => e.name).sort();
  const subDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();

  // Leaf: JSON files and no subfolders → one topic named after the folder.
  if (segments.length > 0 && jsonFiles.length > 0 && subDirs.length === 0) {
    return [{ segments, files: jsonFiles, flat: false }];
  }

  // Category: each loose JSON file is a single-file topic (id = stem); recurse.
  const out = [];
  for (const file of jsonFiles) {
    const stem = basename(file, ".json");
    // A loose <lang>.json in a category would become a bogus flat topic (id "en"/
    // "de"). Fail fast instead — localized variants must live in their own folder.
    if (LANG_RE.test(stem)) {
      throw new Error(`data/topics/${[...segments, file].join("/")}: a language file must live in its own topic folder, not loose in a category`);
    }
    out.push({ segments: [...segments, stem], files: [file], flat: true });
  }
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
  for (const { segments, files, flat } of found) {
    const id = segments[segments.length - 1];
    const category = segments.slice(0, -1).join("/"); // "" = uncategorized
    // Flat topics live loose in the category folder; foldered ones in a folder
    // named after their id.
    const fileSegments = flat ? segments.slice(0, -1) : segments;
    const relPath = fileSegments.join("/");
    const variants = await readVariants(join(TOPICS_DIR, ...fileSegments), files, relPath);
    if (variants.length === 0) continue;
    const rep = pickRepresentative(variants);
    const langs = variants.map((v) => v.lang).filter((l) => l !== null).sort();
    topics.push({
      id,
      category,
      ...(flat ? { flat: true } : {}),
      title: rep.data.title,
      icon: rep.data.icon ?? null,
      langs, // empty array = language-neutral
      files: variants.map((v) => v.file), // JSON filenames the frontend can fetch
      groupCount: rep.data.groups.length,
      wordCount: countWords(rep.data),
    });
  }

  // Topic ids must be unique across categories — the frontend keys state by id,
  // so a collision would silently merge two topics. Fail rather than emit it.
  const seenIds = new Set();
  for (const t of topics) {
    if (seenIds.has(t.id)) {
      throw new Error(`duplicate topic id "${t.id}" — topic folder names must be unique across categories`);
    }
    seenIds.add(t.id);
  }

  const manifest = { generatedAt: new Date().toISOString(), topics };
  await writeFile(OUT_FILE, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`build-index: wrote ${topics.length} topic(s) → data/index.json`);
}

buildIndex().catch((err) => {
  console.error("build-index failed:", err.message);
  process.exit(1);
});
