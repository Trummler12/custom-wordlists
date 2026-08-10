// Scans data/topics and emits data/index.json — a light manifest the frontend
// loads first so it can render the topic tree without downloading every topic.
// Every JSON file (except `_category.json`) is one topic. A folder is a CATEGORY
// when it has a subfolder, a `_category.json`, or ≥2 topic files; otherwise a
// folder holding a single topic file is a LEAF topic (id = folder name, the file
// stem is free) and is marked `foldered`, since owning a folder is how a topic
// says it expects to be split up later. Folders above a topic form a category path
// (e.g. "gaming" or "gaming/pokemon"); a `_category.json` carries optional
// display metadata (title / titles / icon) for that category node.
// Generated file; never hand-edited. See docs/archive/PLANNING.md §4.1.
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS_DIR = join(ROOT, "data", "topics");
const OUT_FILE = join(ROOT, "data", "index.json");

// Sidecar filename holding a category node's display metadata (never a topic).
const CATEGORY_META = "_category.json";

/** Total words in a topic file (flat `words` + flattened `tiers`). */
function countWords(topic) {
  let n = 0;
  for (const group of topic.groups) {
    if (group.words) n += group.words.length;
    if (group.tiers) for (const tier of group.tiers) n += tier.length;
  }
  return n;
}

/**
 * Recursively find topics and category metadata under data/topics. A folder is a
 * category when it has a subfolder, a `_category.json`, or ≥2 topic files: each
 * loose JSON file in it is a topic (id = file stem) and its subfolders recurse.
 * A folder holding exactly one topic file and none of those markers is a leaf
 * topic (id = folder name). Returns `{ topics: [{ id, category, fileSegments }],
 * categories: [{ path }] }`, sorted for determinism.
 */
async function collectTopics(segments) {
  const dir = join(TOPICS_DIR, ...segments);
  const entries = await readdir(dir, { withFileTypes: true });
  const allJson = entries.filter((e) => e.isFile() && e.name.endsWith(".json")).map((e) => e.name).sort();
  const jsonFiles = allJson.filter((f) => f !== CATEGORY_META);
  const subDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  const hasCategoryMeta = allJson.includes(CATEGORY_META);
  const isCategory = subDirs.length > 0 || hasCategoryMeta || jsonFiles.length >= 2;

  // Leaf-topic folder: one topic file, no category markers → id = folder name.
  if (segments.length > 0 && !isCategory && jsonFiles.length === 1) {
    const id = segments[segments.length - 1];
    const category = segments.slice(0, -1).join("/");
    return {
      topics: [{ id, category, foldered: true, fileSegments: [...segments, jsonFiles[0]] }],
      categories: [],
    };
  }

  // Category: each loose JSON file is a topic (id = file stem); recurse subfolders.
  const topics = [];
  const categories = [];
  if (segments.length > 0 && hasCategoryMeta) categories.push({ path: segments.join("/") });
  for (const file of jsonFiles) {
    topics.push({
      id: basename(file, ".json"),
      category: segments.join("/"),
      foldered: false,
      fileSegments: [...segments, file],
    });
  }
  for (const sub of subDirs) {
    const child = await collectTopics([...segments, sub]);
    topics.push(...child.topics);
    categories.push(...child.categories);
  }
  return { topics, categories };
}

/** Read and shape one category's metadata for the manifest (drops empty keys). */
async function readCategoryMeta(path) {
  const file = join(TOPICS_DIR, ...path.split("/"), CATEGORY_META);
  let data;
  try {
    data = JSON.parse(await readFile(file, "utf8"));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`data/topics/${path}/${CATEGORY_META}: could not read/parse — ${msg}`);
  }
  const meta = {};
  const title = data.titles ?? data.title; // see the topic loop for the `??`
  if (title) meta.title = title;
  if (data.icon) meta.icon = data.icon;
  // Emit either boolean, not just a truthy one: a `false` declaration is a real
  // ruler-visibility boundary (shown by default, decoupled from ancestors), so
  // its presence must survive into the manifest.
  if (typeof data.hideRulersByDefault === "boolean") meta.hideRulersByDefault = data.hideRulersByDefault;
  return meta;
}

async function buildIndex() {
  let found;
  try {
    found = await collectTopics([]);
  } catch {
    throw new Error(`No topics directory at ${TOPICS_DIR}`);
  }

  const topics = [];
  for (const { id, category, foldered, fileSegments } of found.topics) {
    const path = fileSegments.join("/");
    let data;
    try {
      data = JSON.parse(await readFile(join(TOPICS_DIR, ...fileSegments), "utf8"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`data/topics/${path}: could not read/parse — ${msg}`);
    }
    topics.push({
      id,
      category, // "" = uncategorized
      path,
      // A legacy `titles` map is exactly what `title` now holds directly, so the
      // merge is the whole migration path. Drop the `??` once no file has one.
      title: data.titles ?? data.title,
      icon: data.icon ?? null,
      ...(foldered ? { foldered: true } : {}),
      // Either boolean is meaningful — a `false` marks a boundary too (see readCategoryMeta).
      ...(typeof data.hideRulersByDefault === "boolean" ? { hideRulersByDefault: data.hideRulersByDefault } : {}),
      ...(data.languages ? { languages: data.languages } : {}),
      ...(data.usesEnglishFor ? { usesEnglishFor: data.usesEnglishFor } : {}),
      groupCount: data.groups.length,
      wordCount: countWords(data),
    });
  }

  // Topic ids must be unique across categories — the frontend keys state by id,
  // so a collision would silently merge two topics. Fail rather than emit it.
  const seenIds = new Set();
  for (const t of topics) {
    if (seenIds.has(t.id)) {
      throw new Error(`duplicate topic id "${t.id}" — topic file/folder names must be unique across categories`);
    }
    seenIds.add(t.id);
  }

  // Category display metadata, keyed by path; only folders with a `_category.json`
  // appear — the frontend falls back to the title-cased folder name otherwise.
  const categories = {};
  for (const { path } of found.categories) {
    categories[path] = await readCategoryMeta(path);
  }

  const manifest = { generatedAt: new Date().toISOString(), topics, categories };
  await writeFile(OUT_FILE, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(
    `build-index: wrote ${topics.length} topic(s), ${Object.keys(categories).length} category label(s) → data/index.json`,
  );
}

buildIndex().catch((err) => {
  console.error("build-index failed:", err.message);
  process.exit(1);
});
