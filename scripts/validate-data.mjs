// Validates every data/topics/**/<file>.json against schema/topic.schema.json
// (and each `_category.json` sidecar against schema/category.schema.json) plus
// cross-checks the schema can't express:
//   1. preset.groups reference real group ids (referential integrity)
//   2. no duplicate words within a topic file
//   3. every language used in an entry's language map is listed in `languages`
//   4. omission rules still describe the list (no stale rule, no self-matching `as`)
//   5. `usesEnglishFor` doesn't contradict what the entries actually carry
//   6. category folder names are kebab-case (like ids)
// Plus non-fatal warnings: a `sources` entry that carries no URL, and a
// `usesEnglishFor` language missing from `languages`.
// Every JSON file (except `_category.json`) is one topic; a folder is a category
// when it has a subfolder, a `_category.json`, or ≥2 topic files, else a folder
// with one topic file is a leaf topic. Exits non-zero on any problem. See docs/archive/PLANNING.md §4.1.
import { readFile, readdir } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import AjvModule from "ajv/dist/2020.js";
import { entryForms, globToRegExp, UNKNOWN, unknownLangs } from "./lib/omissions.mjs";

const Ajv = AjvModule.default ?? AjvModule;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS_DIR = join(ROOT, "data", "topics");
const SCHEMA_FILE = join(ROOT, "schema", "topic.schema.json");
const CATEGORY_SCHEMA_FILE = join(ROOT, "schema", "category.schema.json");

// A language tag: two-letter base, optionally a region (-CH) or script (-Hant) subtag.
// A region may be two letters (de-CH) or three digits (es-419, UN M.49) — the
// latter is how a language names a continent rather than a country.
const LANG_RE = /^[a-z]{2}(-[A-Z]{2}|-[0-9]{3}|-[A-Z][a-z]{3})?$/;
const KEBAB_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// `sources` items are free-form so they can carry a label ("German: https://…"),
// hence a loose "is there a link in here at all" check rather than a URL pattern.
const URL_RE = /https?:\/\/\S/;
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
    for (const [k, v] of Object.entries(w)) {
      // `?` is not a language but a list of them — the ones this entry has no
      // name in. They still have to be declared, so they count as used.
      if (k === UNKNOWN) for (const l of v) out.add(l);
      else {
        out.add(k); // language-code key
        scan(v); // recurse (values may be name pairs)
      }
    }
  };
  for (const group of topic.groups) {
    if (group.words) for (const w of group.words) scan(w);
    if (group.tiers) for (const tier of group.tiers) for (const w of tier) scan(w);
  }
  return out;
}

/** Every entry of a topic, tiers flattened — the entries themselves, where
 *  `allWords` hands back their dedup keys. */
function allEntries(topic) {
  const out = [];
  for (const group of topic.groups) {
    if (group.words) out.push(...group.words);
    if (group.tiers) for (const tier of group.tiers) out.push(...tier);
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
  const warnings = [];
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

    // 4. omission rules must still describe the list they belong to. The entries
    //    stay in the file and are filtered on load, so both of these are knowable:
    //    a rule that matches nothing is stale (renamed upstream, or a typo), and a
    //    replacement caught by a rule would be filtered straight back out.
    for (const group of topic.groups) {
      const entries = [...(group.words ?? []), ...(group.tiers ?? []).flat()];
      for (const om of [...(group.omitted ?? []), ...(group.omittable ?? [])]) {
        const res = [om.match].flat().map(globToRegExp);
        const covers = (e) => {
          const forms = entryForms(e);
          return !om.except?.some((x) => forms.includes(x)) && forms.some((f) => res.some((r) => r.test(f)));
        };
        const label = [om.match].flat().join(" / ");
        if (!entries.some(covers)) {
          warnings.push(`${rel}: omission "${label}" (${group.id}) matches no entry`);
        }
        if (om.as && covers(om.as)) {
          errors.push(`${rel}: omission "${label}" (${group.id}) also matches its own \`as\``);
        }
      }
    }

    // 4a. tier conditions, where declared, name one boundary per tier: same length
    //     as `tiers`, and only on a tiered group. The family-wide check (every file
    //     in an inheritsUpwards family cuts tier k the same) rides with that feature.
    for (const group of topic.groups) {
      if (group.tierConditions === undefined) continue;
      if (!group.tiers) {
        errors.push(`${rel}: group "${group.id}" has tierConditions but no tiers`);
      } else if (group.tierConditions.length !== group.tiers.length) {
        errors.push(
          `${rel}: group "${group.id}" has ${group.tierConditions.length} tierConditions for ${group.tiers.length} tiers`,
        );
      }
    }

    // 4b. an entry that says it has no name in a language it does have one in.
    //     Harmless to render — an own key wins — but it means a name was filled in
    //     and the `?` beside it was left behind, and only a warning can say so.
    for (const group of topic.groups) {
      for (const e of [...(group.words ?? []), ...(group.tiers ?? []).flat()]) {
        for (const l of unknownLangs(e)) {
          if (e[l] !== undefined) {
            warnings.push(`${rel}: "${entryKey(e)}" lists "${l}" as unknown but has a name for it`);
          }
        }
      }
    }

    // 4c. corrections are instructions to the import, and the only way to tell
    //     whether one still holds is to look at the entry it names. A stale one is
    //     worse than none: it reads as a promise the file no longer keeps.
    const correctable = topic.corrections?.length ? allEntries(topic) : [];
    for (const c of topic.corrections ?? []) {
      const entry = correctable.find((e) => baseStr(typeof e === "string" ? e : e.en) === c.entry);
      if (!entry) {
        warnings.push(`${rel}: correction for "${c.entry}" matches no entry`);
        continue;
      }
      for (const [l, fix] of Object.entries(c)) {
        if (l === "entry" || l === "why") continue;
        if (topic.languages && !topic.languages.includes(l)) {
          errors.push(`${rel}: correction for "${c.entry}" names language "${l}", not in languages`);
        }
        const have = typeof entry === "string" ? entry : entry[l];
        if (have !== fix.new) {
          warnings.push(
            `${rel}: correction for "${c.entry}" (${l}) is not applied — entry has "${have}", correction says "${fix.new}"`,
          );
        }
      }
    }

    // 5. `usesEnglishFor` only claims that a language's names *are* the English ones.
    //    It cannot be English itself, it needs `languages` to say what is supported at
    //    all, and it must not name a language the entries actually translate.
    const usesEnglish = topic.usesEnglishFor ?? [];
    if (usesEnglish.length > 0) {
      if (usesEnglish.includes("en")) {
        errors.push(`${rel}: usesEnglishFor cannot contain "en"`);
      }
      if (!topic.languages) {
        errors.push(`${rel}: usesEnglishFor needs languages — without it nothing is supported`);
      }
      for (const l of usedLangs(topic)) {
        if (l !== "en" && usesEnglish.includes(l)) {
          errors.push(`${rel}: usesEnglishFor lists "${l}", but entries carry ${l} names`);
        }
      }
      // Convention rather than logic: `languages` stays the complete list of supported
      // languages, so every code here should also stand there. `"*"` means "the rest",
      // so it is the one that can't.
      for (const l of usesEnglish) {
        if (l !== "*" && l !== "en" && topic.languages && !declared.has(l)) {
          warnings.push(`${rel}: usesEnglishFor lists "${l}", which is not in languages`);
        }
      }
    }

    // 6. sources should point somewhere — a warning, since a source can legitimately
    //    be an offline one (a printed guide, an in-game list).
    const sources = topic.sources == null ? [] : [topic.sources].flat();
    for (const s of sources) {
      if (!URL_RE.test(s)) warnings.push(`${rel}: source has no URL — "${s}"`);
    }
  }

  if (warnings.length > 0) {
    console.warn(`validate-data: ${warnings.length} warning(s):`);
    for (const w of warnings) console.warn("  - " + w);
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
