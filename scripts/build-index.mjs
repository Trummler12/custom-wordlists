// Scans data/topics and emits data/index.json — a light manifest the frontend
// loads first so it can render the topic tree without downloading every topic.
// A topic is either a folder that holds JSON files and no subfolders (id = folder
// name; neutral <content>.json or <lang>.json variants), or a single JSON file
// sitting loose in a category folder that also has subfolders (id = file stem,
// `flat`). Folders above a topic form an arbitrarily deep category path (e.g.
// "gaming" or "sports/olympia"); a `_category.json` in such a folder carries
// optional display metadata (title / titles / icon) for that category node.
// Generated file; never hand-edited. See PLANNING §4.1.
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS_DIR = join(ROOT, "data", "topics");
const OUT_FILE = join(ROOT, "data", "index.json");

const LANG_RE = /^[a-z]{2}(-[A-Z]{2})?$/;
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

/** Pick the file that represents a topic's display metadata (prefer en, then de). */
function pickRepresentative(variants) {
  const byLang = (l) => variants.find((v) => v.lang === l);
  return byLang("en") ?? byLang("de") ?? variants[0];
}

/**
 * Recursively find topics and category metadata under data/topics. A folder with
 * JSON files and no subfolders is a topic leaf (id = folder name). A folder that
 * also has subfolders is a category: each loose JSON file in it is a single-file
 * topic (id = file stem, `flat`), and its subfolders are walked. A `_category.json`
 * in a category folder is metadata, not a topic. Folders above a topic are
 * category segments. Returns `{ topics: [{ segments, files, flat }], categories:
 * [{ path }] }`, sorted for determinism.
 */
async function collectTopics(segments) {
  const dir = join(TOPICS_DIR, ...segments);
  const entries = await readdir(dir, { withFileTypes: true });
  const allJson = entries.filter((e) => e.isFile() && e.name.endsWith(".json")).map((e) => e.name).sort();
  // Keep the category sidecar out of the topic-file lists so it never becomes a
  // (flat or foldered) topic in its own right.
  const jsonFiles = allJson.filter((f) => f !== CATEGORY_META);
  const subDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();

  // Leaf: JSON files and no subfolders → one topic named after the folder.
  if (segments.length > 0 && jsonFiles.length > 0 && subDirs.length === 0) {
    return { topics: [{ segments, files: jsonFiles, flat: false }], categories: [] };
  }

  // Category: each loose JSON file is a single-file topic (id = stem); recurse.
  const topics = [];
  const categories = [];
  if (segments.length > 0 && allJson.includes(CATEGORY_META)) {
    categories.push({ path: segments.join("/") });
  }
  for (const file of jsonFiles) {
    topics.push({ segments: [...segments, basename(file, ".json")], files: [file], flat: true });
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
  if (data.title) meta.title = data.title;
  if (data.titles) meta.titles = data.titles;
  if (data.icon) meta.icon = data.icon;
  return meta;
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
  for (const { segments, files, flat } of found.topics) {
    const id = segments[segments.length - 1];
    const category = segments.slice(0, -1).join("/"); // "" = uncategorized
    // Flat topics live loose in the category folder; foldered ones in a folder
    // named after their id.
    const fileSegments = flat ? segments.slice(0, -1) : segments;
    const relPath = fileSegments.join("/");
    const variants = await readVariants(join(TOPICS_DIR, ...fileSegments), files, relPath);
    if (variants.length === 0) continue;
    // A flat topic is a single loose file. Reject it when it looks like a
    // localized variant — either a language-code filename (id would be "en"/"de")
    // or a declared `lang` field — matching validate-data. Fail fast.
    if (flat && (LANG_RE.test(id) || variants[0].data.lang)) {
      throw new Error(`data/topics/${relPath}/${variants[0].file}: a language variant must live in its own topic folder, not loose in a category`);
    }
    const rep = pickRepresentative(variants);
    const langs = variants.map((v) => v.lang).filter((l) => l !== null).sort();
    // Per-language titles, emitted only when the name genuinely translates.
    // Localized topics: derive from each variant's own title (a topic named the
    // same in every language, e.g. "South Park", keeps just the single title).
    // Language-neutral topics (one shared word list): honor an explicit `titles`
    // field so the title can translate without duplicating the words.
    const variantTitles = Object.fromEntries(
      variants.filter((v) => v.lang !== null).map((v) => [v.lang, v.data.title]),
    );
    const titles = Object.keys(variantTitles).length > 0 ? variantTitles : (rep.data.titles ?? {});
    const titlesDiffer = new Set(Object.values(titles)).size > 1;
    topics.push({
      id,
      category,
      ...(flat ? { flat: true } : {}),
      title: rep.data.title,
      ...(titlesDiffer ? { titles } : {}),
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
