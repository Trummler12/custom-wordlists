// A Wikidata item's labels as a list entry, the same way in every generated list.
//
// EVERY NAME IS CAPITALIZED: Wikidata lower-cases its labels by house rule, and an entry
// is a whole card, not a noun in a sentence (see build-elements.mjs for the long story).
// A LANGUAGE EQUAL TO ENGLISH IS DROPPED, compared without case: an absent key already
// means "same as en" (the schema's langMapEntry).
import { NAME_LANGS, labelFor } from "./wikidata.mjs";

export const sameWord = (a, b) => a.toLowerCase() === b.toLowerCase();

/** `Array.from` rather than `[0]`, so a first character outside the basic plane stays whole. */
export function capitalize(name) {
  const [first, ...rest] = Array.from(name);
  return first === undefined ? name : first.toUpperCase() + rest.join("");
}

/** An item's names as an entry: English, plus every language that differs from it, and
 *  `?` for the languages with no label. A plain string when only English is left. */
export function entryOf(names) {
  const en = capitalize(labelFor(names, "en"));
  const out = { en };
  const unknown = [];
  for (const tag of NAME_LANGS.slice(1)) {
    // Invisible format characters (a stray left-to-right mark) are typed by no one.
    const value = labelFor(names, tag)?.replace(/\p{Cf}/gu, "").trim();
    if (!value) unknown.push(tag);
    else if (!sameWord(value, en)) out[tag] = capitalize(value);
  }
  if (unknown.length) out["?"] = unknown;
  return Object.keys(out).length === 1 ? en : out;
}

/** Every name an entry carries, across its languages. */
export const formsOf = (entry) =>
  typeof entry === "string" ? [entry] : Object.entries(entry).filter(([k]) => k !== "?").map(([, v]) => v);
