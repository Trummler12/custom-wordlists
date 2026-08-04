// Validates every data/topics/**/<file>.json against schema/topic.schema.json
// (and each `_category.json` sidecar against schema/category.schema.json) plus
// cross-checks the schema can't express:
//   1. preset.groups reference real group ids (referential integrity)
//   2. no duplicate words within a topic file
//   3. every language used in an entry's language map is listed in `languages`
//   4. category folder names are kebab-case (like ids)
// Every JSON file (except `_category.json`) is one topic; a folder is a category
// when it has a subfolder, a `_category.json`, or ≥2 topic files, else a folder
// with one topic file is a leaf topic. Exits non-zero on any problem. See PLANNING §4.1.
import { readFile, readdir } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import AjvModule from "ajv/dist/2020.js";

const Ajv = AjvModule.default ?? AjvModule;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS_DIR = join(ROOT, "data", "topics");
const SCHEMA_FILE = join(ROOT, "schema", "topic.schema.json");
const CATEGORY_SCHEMA_FILE = join(ROOT, "schema", "category.schema.json");

const LANG_RE = /^[a-z]{2}(-[A-Z]{2})?$/;
const KEBAB_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// Sidecar filename holding a category node's display metadata (never a topic).
const CATEGORY_META = "_category.json";

/**
 * Recursively find topics and category-metadata files under data/topics. A folder
 * is a category when it has a subfolder, a `_category.json`, or ≥2 topic files:
 * each loose JSON file is a topic (id = file stem) and its subfolders recurse. A
 * folder with one topic file and none of those markers is a leaf topic (id =
 * folder name). Returns `{ topics: [{ id, category, fileSegments }], categories:
 * [{ path }] }`.
 */
async function collectTopics(segments) {
  const dir = join(TOPICS_DIR, ...segments);
  const entries = await readdir(dir, { withFileTypes: true });
  const allJson = entries.filter((e) => e.isFile() && e.name.endsWith(".json")).map((e) => e.name).sort();
  const jsonFiles = allJson.filter((f) => f !== CATEGORY_META);
  const subDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  const hasCategoryMeta = allJson.includes(CATEGORY_META);
  const isCategory = subDirs.length > 0 || hasCategoryMeta || jsonFiles.length >= 2;

  if (segments.length > 0 && !isCategory && jsonFiles.length === 1) {
    const id = segments[segments.length - 1];
    const category = segments.slice(0, -1).join("/");
    return { topics: [{ id, category, fileSegments: [...segments, jsonFiles[0]] }], categories: [] };
  }

  const topics = [];
  const categories = [];
  if (segments.length > 0 && hasCategoryMeta) categories.push({ path: segments.join("/") });
  for (const file of jsonFiles) {
    topics.push({ id: basename(file, ".json"), category: segments.join("/"), fileSegments: [...segments, file] });
  }
  for (const sub of subDirs) {
    const child = await collectTopics([...segments, sub]);
    topics.push(...child.topics);
    categories.push(...child.categories);
  }
  return { topics, categories };
}

/** Base (en) form of a leaf string: the string itself, or its "en" value. */
function baseStr(s) {
  return typeof s === "string" ? s : s.en;
}
/** Canonical key for dedup, keyed by each leaf's base (en) form so a localized
 *  entry collides with an equal plain one. Handles both accepted shapes: the leaf
 *  name pair `{short, long}` and an entry-level language map `{en, de, …}`. */
function entryKey(word) {
  if (typeof word === "string") return word;
  if ("short" in word && "long" in word) return `${baseStr(word.short)} ${baseStr(word.long)}`;
  return entryKey(word.en); // entry-level language map: key by the en value
}

/** Every language code referenced anywhere in a topic's entries (leaf field maps
 *  and entry-level maps alike). */
function usedLangs(topic) {
  const out = new Set();
  const scan = (w) => {
    if (w == null || typeof w !== "object") return;
    if ("short" in w && "long" in w) {
      scan(w.short);
      scan(w.long);
      return;
    }
    for (const k of Object.keys(w)) out.add(k); // language-code keys
    for (const v of Object.values(w)) scan(v); // recurse (values may be name pairs)
  };
  for (const group of topic.groups) {
    if (group.words) for (const w of group.words) scan(w);
    if (group.tiers) for (const tier of group.tiers) for (const w of tier) scan(w);
  }
  return out;
}

function allWords(topic) {
  const out = [];
  for (const group of topic.groups) {
    if (group.words) for (const w of group.words) out.push(entryKey(w));
    if (group.tiers) for (const tier of group.tiers) for (const w of tier) out.push(entryKey(w));
  }
  return out;
}

async function main() {
  const schema = JSON.parse(await readFile(SCHEMA_FILE, "utf8"));
  const categorySchema = JSON.parse(await readFile(CATEGORY_SCHEMA_FILE, "utf8"));
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  const validateCategory = ajv.compile(categorySchema);

  const errors = [];
  let found = { topics: [], categories: [] };
  try {
    found = await collectTopics([]);
  } catch {
    errors.push(`No topics directory at ${TOPICS_DIR}`);
  }

  // Category `_category.json` sidecars: schema-check each one.
  for (const { path } of found.categories) {
    const rel = `data/topics/${path}/${CATEGORY_META}`;
    let meta;
    try {
      meta = JSON.parse(await readFile(join(TOPICS_DIR, ...path.split("/"), CATEGORY_META), "utf8"));
    } catch (err) {
      errors.push(`${rel}: could not read/parse — ${err.message}`);
      continue;
    }
    if (!validateCategory(meta)) {
      for (const e of validateCategory.errors) errors.push(`${rel}: ${e.instancePath || "/"} ${e.message}`);
    }
  }

  // Topic ids must be globally unique — the frontend keys its state by id.
  const idDirs = new Map();
  for (const { id, fileSegments } of found.topics) {
    (idDirs.get(id) ?? idDirs.set(id, []).get(id)).push(fileSegments.join("/"));
  }
  for (const [id, paths] of idDirs) {
    if (paths.length > 1) {
      errors.push(`duplicate topic id "${id}" across categories: ${paths.join(", ")}`);
    }
  }

  let fileCount = 0;
  for (const { id, category, fileSegments } of found.topics) {
    const rel = `data/topics/${fileSegments.join("/")}`;
    fileCount++;

    // category folder names must be kebab-case, like ids
    for (const seg of category.split("/").filter(Boolean)) {
      if (!KEBAB_RE.test(seg)) {
        errors.push(`${rel}: category folder "${seg}" is not kebab-case`);
      }
    }

    let topic;
    try {
      topic = JSON.parse(await readFile(join(TOPICS_DIR, ...fileSegments), "utf8"));
    } catch (err) {
      errors.push(`${rel}: could not read/parse — ${err.message}`);
      continue;
    }

    // 0. schema
    if (!validate(topic)) {
      for (const e of validate.errors) {
        errors.push(`${rel}: ${e.instancePath || "/"} ${e.message}`);
      }
      continue; // shape unreliable; skip semantic checks for this file
    }

    // id agreement: the folder name (leaf) or the file stem (flat) — both equal `id`
    if (topic.id !== id) {
      errors.push(`${rel}: id "${topic.id}" does not match location "${id}"`);
    }

    // 1. referential integrity of preset.groups
    const groupIds = new Set(topic.groups.map((g) => g.id));
    for (const preset of topic.presets ?? []) {
      for (const ref of preset.groups) {
        if (!groupIds.has(ref)) {
          errors.push(`${rel}: preset "${preset.id}" references unknown group "${ref}"`);
        }
      }
    }

    // 2. duplicate words
    const seen = new Set();
    for (const w of allWords(topic)) {
      if (seen.has(w)) errors.push(`${rel}: duplicate entry "${w}"`);
      seen.add(w);
    }

    // 3. every language used in an entry map must be declared in `languages`
    const declared = new Set(topic.languages ?? []);
    if (topic.languages && !declared.has("en")) {
      errors.push(`${rel}: languages must include the base "en"`);
    }
    for (const l of usedLangs(topic)) {
      if (topic.languages && !declared.has(l)) {
        errors.push(`${rel}: entry uses language "${l}" not listed in languages [${[...declared].join(", ")}]`);
      }
    }
  }

  if (errors.length > 0) {
    console.error(`validate-data: ${errors.length} problem(s) found:`);
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  }
  console.log(
    `validate-data: ${fileCount} file(s) across ${found.topics.length} topic(s), ` +
      `${found.categories.length} category label(s) — all valid`,
  );
}

main().catch((err) => {
  console.error("validate-data failed:", err.message);
  process.exit(1);
});
