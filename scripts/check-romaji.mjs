// Which Japanese names the romaji dictionary can't yet read.
//
//   node scripts/check-romaji.mjs                 # every generatedRomaji topic
//   node scripts/check-romaji.mjs <path/to.json>  # just one
//
// A generatedRomaji list has no stored romaji: the app derives it from the ja name
// at render (see src/lib/kana.mjs), and any name holding a kanji the dictionary
// doesn't know falls back to the raw Japanese instead. This lists those names — and
// the offending characters — so the WORDS table can be extended to cover them.
// A report, not a gate: it exits 0 and is read, like report-name-quality.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isTransliterable, toRomaji, unreadable } from "../src/lib/kana.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOPICS = join(ROOT, "data", "topics");

/** Every entry a topic carries, across its own list and any groups. */
function entriesOf(topic) {
  const out = [];
  const pushList = (o) => {
    if (Array.isArray(o.tiers)) for (const t of o.tiers) out.push(...t);
    if (Array.isArray(o.words)) out.push(...o.words);
  };
  pushList(topic);
  if (Array.isArray(topic.groups)) for (const g of topic.groups) pushList(g);
  return out;
}

/** Every Japanese form of an entry — a plain string, or the fields of a name pair. */
function jaForms(e) {
  const ja = e?.ja;
  if (ja === undefined) return [];
  if (typeof ja === "string") return [ja];
  const out = [];
  for (const k of ["pref", "short", "long"]) if (typeof ja[k] === "string") out.push(ja[k]);
  if (Array.isArray(ja.others)) out.push(...ja.others.filter((x) => typeof x === "string"));
  return out;
}

const arg = process.argv[2];
const files = arg
  ? [arg]
  : readdirSync(TOPICS, { recursive: true })
      .filter((f) => typeof f === "string" && f.endsWith(".json"))
      .map((f) => join(TOPICS, f));

let totalForms = 0;
let totalBad = 0;
const tally = new Map();
const perTopic = [];

for (const file of files) {
  let topic;
  try {
    topic = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    continue; // not a topic file
  }
  if (!topic?.generatedRomaji) continue;

  const forms = [...new Set(entriesOf(topic).flatMap(jaForms))];
  const bad = forms.filter((s) => !isTransliterable(s));
  totalForms += forms.length;
  totalBad += bad.length;
  if (bad.length === 0) continue;

  for (const s of bad) for (const c of unreadable(s)) tally.set(c, (tally.get(c) ?? 0) + 1);
  perTopic.push({ id: topic.id ?? file, forms: forms.length, bad });
}

for (const t of perTopic) {
  console.log(`\n${t.id} — ${t.bad.length} of ${t.forms} untranslatable:`);
  for (const s of t.bad) console.log(`  ${s}   =>   ${toRomaji(s) ?? "(dropped)"}`);
}

const chars = [...tally.entries()].sort((a, b) => b[1] - a[1]);
console.log(`\n${"─".repeat(60)}`);
console.log(`unknown characters (${chars.length}): ${chars.map(([c, n]) => `${c}×${n}`).join("  ")}`);
console.log(`total: ${totalBad} of ${totalForms} unique ja forms untranslatable`);
