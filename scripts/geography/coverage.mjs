// The slim per-topic dataset the "Language Coverage" contribution page (strand W1)
// reads: for every source entity, which content languages Wikidata already carries a
// LABEL for, so a reader can spot and fill the gaps. Written to data/coverage/ — outside
// data/topics/, so validate-data ignores it, and shipped to dist by the existing data/
// copy in vite.config. Carries no date: the payload is then byte-deterministic from the
// dump alone (a no-op build:data leaves it untouched), and the page sources its "as of"
// date elsewhere.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

// A content tag is "covered" only when its LANG_SRC chain resolves to an rdfs:label — a
// `pref` term. An alias or a bare code is not a label, so an alias-only entry reads as a
// gap the reader is invited to fill, matching the page's "has a label" wording.
const hasLabel = (names, chain) => chain.some((src) => names?.[src]?.some((t) => t.pref));

// Column-1 display name: an English short form (P1813) where the dump carries one, else
// the leading English pref label the dump already put first.
const displayName = (entry) => entry.names?.en?.find((t) => t.short)?.name ?? entry.name;

/**
 * The coverage structure for one topic. `dump` is a `{ qid: { name, <numeric>, names } }`
 * map (merge several dumps for a combined topic, e.g. continents + plates); iteration
 * follows its key order, which the dumps already sort deterministically.
 * @param {string} topic topic id, e.g. "countries"
 * @param {Record<string, {name: string, names?: object}>} dump
 * @param {string[]} nameLangs the content languages (table columns), in order
 * @param {Record<string, string[]>} langSrc content tag => Wikidata tag fallback chain
 * @param {string|null} numericKey the leading numeric field ("population"/"area"/"users") or null
 */
export function coverageData(topic, dump, nameLangs, langSrc, numericKey) {
  const items = Object.entries(dump).map(([qid, entry]) => {
    const item = { qid, name: displayName(entry) };
    if (numericKey && entry[numericKey] != null) item.num = entry[numericKey];
    const miss = nameLangs.filter((l) => !hasLabel(entry.names, langSrc[l]));
    if (miss.length) item.miss = miss; // store the gaps, not the (98–99%) hits — far smaller
    return item;
  });
  return { meta: { topic, numeric: numericKey ?? null, langs: nameLangs }, items };
}

// One item per line keeps the file diffable and browsable without a term-per-line blow-up.
const serialize = ({ meta, items }) =>
  `{\n  "meta": ${JSON.stringify(meta)},\n  "items": [\n` +
  items.map((it) => `    ${JSON.stringify(it)}`).join(",\n") +
  `\n  ]\n}\n`;

/** Build the coverage for `topic` and, when `write`, save it to data/coverage/<topic>.json. */
export async function writeCoverage(root, topic, dump, nameLangs, langSrc, numericKey, write) {
  const data = coverageData(topic, dump, nameLangs, langSrc, numericKey);
  const path = join(root, "data", "coverage", `${topic}.json`);
  if (write) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, serialize(data), "utf8");
  }
  return data;
}
