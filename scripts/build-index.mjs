// Scans data/topics and emits data/index.json — a light manifest the frontend
// loads first so it can render the topic tree without downloading every topic.
// Every JSON file (except `_category.json`) is one topic. A folder is a CATEGORY
// when it has a subfolder, a `_category.json`, or ≥2 topic files; otherwise a
// folder holding a single topic file is a LEAF topic (id = folder name, the file
// stem is free) and is marked `foldered`, since owning a folder is how a topic
// says it expects to be split up later. Folders above a topic form a category path
// (e.g. "gaming" or "gaming/pokemon"); a `_category.json` carries optional
// display metadata (title / icon) for that category node.
// Generated file; never hand-edited. See docs/archive/PLANNING.md §4.1.
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { entryForms, globToRegExp } from "./lib/omissions.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS_DIR = join(ROOT, "data", "topics");
const OUT_FILE = join(ROOT, "data", "index.json");

// Sidecar filename holding a category node's display metadata (never a topic).
const CATEGORY_META = "_category.json";

/** Words a topic contributes as the app shows it: omitted families out, each
 *  rule's stand-in in. The manifest count is what a topic row advertises before
 *  its file loads, so counting the raw list would make the number jump on load. */
function countWords(topic) {
  let n = 0;
  for (const group of topic.groups) {
    const rules = (group.omitted ?? []).map((o) => ({
      res: [o.match].flat().map(globToRegExp),
      except: o.except ?? [],
      as: o.as,
    }));
    const covered = (e) => {
      const forms = entryForms(e);
      return rules.some(
        (r) => !r.except.some((x) => forms.includes(x)) && forms.some((f) => r.res.some((p) => p.test(f))),
      );
    };
    const kept = (list) => list.filter((e) => !covered(e)).length;
    if (group.words) n += kept(group.words);
    if (group.tiers) for (const tier of group.tiers) n += kept(tier);
    n += rules.filter((r) => r.as !== undefined).length;
  }
  return n;
}

/** Names sorted by the `order` in the file each one names, lowest first, with the
 *  undeclared keeping their alphabetical order behind them.
 *
 *  Ordering a few siblings should cost nothing on the rest, and a folder that has
 *  no opinion shouldn't need a `_category.json` to say so. Loose topics still come
 *  before subfolders — `order` sorts within each, not across them. */
async function byOrder(names, fileOf) {
  const keyed = await Promise.all(
    names.map(async (name) => {
      try {
        const { order } = JSON.parse(await readFile(fileOf(name), "utf8"));
        return { name, order: Number.isInteger(order) ? order : Infinity };
      } catch {
        // No file, or none of our business — it simply has no opinion.
        return { name, order: Infinity };
      }
    }),
  );
  return keyed.sort((a, b) => a.order - b.order).map((k) => k.name);
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
  const jsonFiles = await byOrder(
    allJson.filter((f) => f !== CATEGORY_META),
    (f) => join(dir, f),
  );
  const subDirs = await byOrder(
    entries.filter((e) => e.isDirectory()).map((e) => e.name).sort(),
    (d) => join(dir, d, CATEGORY_META),
  );
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
  if (data.title) meta.title = data.title;
  if (data.icon) meta.icon = data.icon;
  // Emit either boolean, not just a truthy one: a `false` declaration is a real
  // ruler-visibility boundary (shown by default, decoupled from ancestors), so
  // its presence must survive into the manifest.
  if (typeof data.hideRulersByDefault === "boolean") meta.hideRulersByDefault = data.hideRulersByDefault;
  if (data.sharedEnglishToggle) meta.sharedEnglishToggle = true;
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
      title: data.title,
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
