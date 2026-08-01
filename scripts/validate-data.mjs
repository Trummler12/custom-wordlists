// Validates every data/topics/**/<topic>/<file>.json against schema/topic.schema.json
// and adds cross-checks the schema can't express:
//   1. preset.groups reference real group ids (referential integrity)
//   2. no duplicate words within a topic file
//   3. a topic's language variants share the same group/tier structure (no drift)
//   4. category folder names are kebab-case (like ids)
// A topic is any directory that directly holds JSON files; folders above it are
// an arbitrarily deep category path. Exits non-zero on any problem. See PLANNING §4.1.
import { readFile, readdir } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import AjvModule from "ajv/dist/2020.js";

const Ajv = AjvModule.default ?? AjvModule;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS_DIR = join(ROOT, "data", "topics");
const SCHEMA_FILE = join(ROOT, "schema", "topic.schema.json");

const LANG_RE = /^[a-z]{2}(-[A-Z]{2})?$/;
const KEBAB_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Recursively find topics under data/topics. A directory that directly holds
 * JSON files is a topic (leaf); folders above it are category segments. Returns
 * `{ segments }` per topic (path from topics/ to the topic folder), sorted.
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

/** All words of a topic file (flat + tiered), in document order. */
function allWords(topic) {
  const out = [];
  for (const group of topic.groups) {
    if (group.words) out.push(...group.words);
    if (group.tiers) for (const tier of group.tiers) out.push(...tier);
  }
  return out;
}

/** A comparable fingerprint of a topic's structure (ids + shape), ignoring words. */
function structure(topic) {
  return topic.groups.map((g) => ({
    id: g.id,
    kind: g.words ? "words" : "tiers",
    tierSizes: g.tiers ? g.tiers.map((t) => t.length) : null,
    wordCount: g.words ? g.words.length : null,
  }));
}

async function main() {
  const schema = JSON.parse(await readFile(SCHEMA_FILE, "utf8"));
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);

  const errors = [];
  let found = [];
  try {
    found = await collectTopics([]);
  } catch {
    errors.push(`No topics directory at ${TOPICS_DIR}`);
  }

  // Topic ids must be globally unique — the frontend keys its state by id.
  const idDirs = new Map();
  for (const { segments } of found) {
    const id = segments[segments.length - 1];
    (idDirs.get(id) ?? idDirs.set(id, []).get(id)).push(segments.join("/"));
  }
  for (const [id, dirs] of idDirs) {
    if (dirs.length > 1) {
      errors.push(`duplicate topic id "${id}" across categories: ${dirs.join(", ")}`);
    }
  }

  let fileCount = 0;
  for (const { segments, files } of found) {
    const id = segments[segments.length - 1];
    const relDir = segments.join("/");
    const dir = join(TOPICS_DIR, ...segments);

    // 4. category folder names must be kebab-case, like ids
    for (const seg of segments.slice(0, -1)) {
      if (!KEBAB_RE.test(seg)) {
        errors.push(`data/topics/${relDir}: category folder "${seg}" is not kebab-case`);
      }
    }

    const variants = [];
    for (const file of files) {
      const rel = `data/topics/${relDir}/${file}`;
      fileCount++;
      let topic;
      try {
        topic = JSON.parse(await readFile(join(dir, file), "utf8"));
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

      // folder/id agreement (id = the topic folder name, deepest segment)
      if (topic.id !== id) {
        errors.push(`${rel}: id "${topic.id}" does not match folder "${id}"`);
      }

      // filename ↔ lang agreement
      const stem = basename(file, ".json");
      const stemIsLang = LANG_RE.test(stem);
      if (stemIsLang && topic.lang !== stem) {
        errors.push(`${rel}: lang "${topic.lang ?? "(none)"}" does not match filename "${stem}"`);
      }
      if (!stemIsLang && topic.lang) {
        errors.push(`${rel}: language-neutral file must not declare lang "${topic.lang}"`);
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
        if (seen.has(w)) errors.push(`${rel}: duplicate word "${w}"`);
        seen.add(w);
      }

      variants.push({ file: rel, lang: LANG_RE.test(stem) ? stem : null, topic });
    }

    // 3. structural parity across language variants of the same topic
    const langVariants = variants.filter((v) => v.lang !== null);
    if (langVariants.length > 1) {
      const ref = langVariants[0];
      const refStruct = JSON.stringify(structure(ref.topic));
      for (const v of langVariants.slice(1)) {
        if (JSON.stringify(structure(v.topic)) !== refStruct) {
          errors.push(`${v.file}: structure differs from ${ref.file} (group ids / tier sizes must match across languages)`);
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error(`validate-data: ${errors.length} problem(s) found:`);
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  }
  console.log(`validate-data: ${fileCount} file(s) across ${found.length} topic(s) — all valid`);
}

main().catch((err) => {
  console.error("validate-data failed:", err.message);
  process.exit(1);
});
