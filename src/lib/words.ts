// Resolving word entries to a language and rendering them to strings. Every
// function here is a pure function of its arguments — the active language is
// passed in rather than read from state, so a component's derived counts
// recompute on a language switch without any of this knowing about runes.

import type { Group, LocalizedString, NamePair, NamesMode, Word, WordEntry } from "./types";
import { baseTag, matchTag } from "./languages";
import { toRomaji } from "./kana";

/** The tag an entry carrying `keys` answers `lang` with, or undefined for none.
 *
 *  Memoized because the answer depends only on the language and the set of keys,
 *  and a list of two thousand items has two thousand entries carrying the same
 *  nine — one match per shape rather than one per entry per render. */
const matched = new Map<string, string | undefined>();
function tagFor(obj: Record<string, unknown>, lang: string): string | undefined {
  const keys = Object.keys(obj).filter((k) => k !== UNKNOWN);
  const cacheKey = `${lang}|${keys.join(",")}`;
  let hit = matched.get(cacheKey);
  if (hit === undefined && !matched.has(cacheKey)) {
    hit = matchTag(lang, keys);
    matched.set(cacheKey, hit);
  }
  return hit;
}

/** Resolve a leaf string to `lang`: a language map picks `lang` (falling back to
 *  the closest tag it does carry, then to its "en" base); a plain string is
 *  already neutral.
 *
 *  The closest tag matters the moment the picker offers a tag the data spells
 *  differently — a reader asking for `zh` on a list carrying `zh-Hans` wants the
 *  Chinese name, not the English one it would otherwise fall through to.
 *
 *  `derived` lets a list whose romaji are transliterated rather than sourced say
 *  so; see `transliterate`. It is off by default, because for most lists an
 *  absent `ja-Latn` means "the romaji is the English name" and deriving one would
 *  overwrite an official spelling with a reading of it. */
export function resolveStr(s: LocalizedString, lang: string, derived = false): string {
  if (typeof s === "string") return s;
  const own = s[lang];
  if (own !== undefined) return own;
  const made = derived ? transliterate(s, lang) : undefined;
  if (made !== undefined) return made;
  const tag = tagFor(s, lang);
  return tag !== undefined ? s[tag] : s.en;
}

/** The romaji of an entry that carries none, read off its Japanese name.
 *
 *  After the entry's own key and before every fallback: a stored `ja-Latn` still
 *  wins, so a reading someone reports as wrong can be pinned in the data without
 *  turning the derivation off for the rest of the list. */
function transliterate(s: Record<string, string>, lang: string): string | undefined {
  if (!lang.toLowerCase().endsWith("-latn")) return undefined;
  const source = s[baseTag(lang)];
  return typeof source === "string" ? toRomaji(source) : undefined;
}

/** The key an entry uses to name the languages its source had no name for. Not a
 *  language of its own: `resolveWord` never looks it up and `entryForms` skips it.
 *
 *  It exists because an absent key already means something else. An entry omits a
 *  language it agrees with English on, so `"Protein"` says *Protein everywhere* —
 *  and a bulk source that simply stops at Legends: Arceus would be saying the same
 *  about a name nobody has ever written down. This is how a list says "we have
 *  nothing here" instead of asserting the English word. */
export const UNKNOWN = "?";

/** The languages an entry declares it has no name for — empty for every entry
 *  that declares none, which is every hand-written one. */
export function unknownLangs(e: WordEntry): readonly string[] {
  if (typeof e === "string") return [];
  const v = (e as Record<string, unknown>)[UNKNOWN];
  return Array.isArray(v) ? (v as string[]) : [];
}

/** Whether the list has no name for this entry in `lang`. An own key wins: a name
 *  filled in by hand outranks a gap the bulk source reported, so correcting one
 *  entry needs no edit to the `?` beside it. English never counts as unknown — it
 *  is the base every entry has.
 *
 *  The two halves ask about different things, which is why one takes the whole tag
 *  and the other only its language. Having a name is a property of the *language*:
 *  an entry with no Spanish name has none in Latin American Spanish either, and one
 *  with no Japanese name has no reading to derive romaji from — and `?` never holds
 *  a variant tag, since a missing row is not a missing name. Whether *this* spelling
 *  is present is a property of the whole tag: an entry carrying `es-419` has a Latin
 *  American name whatever `?` says about `es`. */
export function isUnknownIn(e: WordEntry, lang: string): boolean {
  if (typeof e === "string") return false;
  const base = baseTag(lang);
  if (base === "en") return false;
  return (e as Record<string, unknown>)[lang] === undefined && unknownLangs(e).includes(base);
}

/** Resolve an entry to `lang`. Two equivalent shapes are accepted: the preferred
 *  leaf form (a name pair whose fields each localize) and an entry-level language
 *  map { en, de, … } whose value is itself an entry — the latter is resolved by
 *  picking the language and recursing.
 *
 *  **The two shapes are not equivalent for a derived reading.** `transliterate`
 *  reads a leaf, so a map whose language holds a *name pair* has its Japanese one
 *  level further down than this can reach, and the entry falls through to English
 *  with its kana sitting inside it. Passing `derived` into the recursion does not
 *  help: the pair's halves are plain strings by then, and a plain string is neutral
 *  by definition — it would need a second traversal that romanizes an already
 *  resolved pair. No entry has that shape (all four romanized lists are flat maps
 *  of strings), so this is written down rather than built. */
export function resolveWord(e: WordEntry, lang: string, derived = false): Word {
  if (typeof e === "string") return e;
  const obj = e as Record<string, unknown>;
  if ("short" in obj && "long" in obj) {
    const p = e as NamePair;
    return {
      short: resolveStr(p.short, lang, derived),
      long: resolveStr(p.long, lang, derived),
    };
  }
  const map = e as Record<string, WordEntry>;
  // Same fallback chain as a leaf: the language, then a reading derived from it
  // where the list says its romaji are, then the closest tag, then English.
  if (map[lang] === undefined && derived) {
    const made = transliterate(map as Record<string, string>, lang);
    if (made !== undefined) return made;
  }
  const tag = map[lang] !== undefined ? lang : tagFor(map, lang);
  return resolveWord((tag !== undefined ? map[tag] : undefined) ?? map.en, lang);
}

/** The string(s) an entry contributes in a names mode. A pair whose two forms
 *  render identically collapses to one, so "both" can't produce a duplicate. */
export function renderEntry(
  e: WordEntry,
  mode: NamesMode,
  lang: string,
  derived = false,
): string[] {
  const w = resolveWord(e, lang, derived);
  if (typeof w === "string") return [w];
  if (mode === "short") return [w.short];
  if (mode === "long") return [w.long];
  return w.short === w.long ? [w.short] : [w.short, w.long];
}

/** The distinct strings a list contributes, first appearance first. */
export function renderedForms(
  entries: WordEntry[],
  mode: NamesMode,
  lang: string,
  derived = false,
): string[] {
  const seen = new Set<string>();
  for (const e of entries) for (const w of renderEntry(e, mode, lang, derived)) seen.add(w);
  return [...seen];
}

/** How many of them the counters show. `maxLen` drops the forms too long for the
 *  target game — see `TOO_LONG_RULE` in lib/omitted; leave it out to count all. */
export function renderCount(
  entries: WordEntry[],
  mode: NamesMode,
  lang: string,
  derived = false,
  maxLen?: number,
): number {
  const forms = renderedForms(entries, mode, lang, derived);
  return maxLen === undefined ? forms.length : forms.filter((w) => w.length <= maxLen).length;
}

/** The forms `maxLen` drops, for the panel that names them and offers them back.
 *
 *  Forms rather than entries, which is what sets this apart from every other
 *  omission: an entry whose long form runs past the limit is perfectly usable
 *  under its short one, so what leaves the list is one of its two names. */
export function overlongForms(
  entries: WordEntry[],
  mode: NamesMode,
  lang: string,
  derived: boolean,
  maxLen: number,
): string[] {
  return renderedForms(entries, mode, lang, derived).filter((w) => w.length > maxLen);
}

/** The entries a variant spells differently, as `base → variant` pairs.
 *
 *  Only entries carrying the tag: a variant is written into the data solely where
 *  it deviates, so its presence *is* the difference. That makes the count worth
 *  showing — it says where a variant matters, which is the question nobody can
 *  answer from the outside. */
const pairsByGroups = new WeakMap<Group[], Map<string, { from: string; to: string }[]>>();

export function variantPairs(
  groups: Group[],
  tag: string,
  base: string,
): { from: string; to: string }[] {
  // Keyed on the topic's own groups array, which is loaded once and never
  // replaced: without this the scan runs per row per render, over lists of two
  // thousand entries, for every topic on screen.
  let byTag = pairsByGroups.get(groups);
  if (!byTag) pairsByGroups.set(groups, (byTag = new Map()));
  const hit = byTag.get(tag);
  if (hit) return hit;

  const out: { from: string; to: string }[] = [];
  for (const g of groups) {
    for (const e of [...(g.words ?? []), ...(g.tiers ?? []).flat()]) {
      if (typeof e === "string" || (e as Record<string, unknown>)[tag] === undefined) continue;
      out.push({ from: renderEntry(e, "short", base)[0], to: renderEntry(e, "short", tag)[0] });
    }
  }
  byTag.set(tag, out);
  return out;
}

/** A name resolved for display: what a row shows, and what its hover reveals.
 *  `long` repeats `short` when the name has only one form. */
export interface DisplayName {
  short: string;
  long: string;
}

/** Resolve a title. Titles are `WordEntry` like the entries themselves, so a name
 *  that translates, or that has a crowded long form and a short one to put on a
 *  row, needs no shape of its own. */
export function displayName(e: WordEntry, lang: string): DisplayName {
  const w = resolveWord(e, lang);
  return typeof w === "string" ? { short: w, long: w } : w;
}

/** Whether any entry in the group has a short/long form — the condition for
 *  showing that group's names dropdown. */
export function groupHasNames(g: Group, lang: string): boolean {
  const entries = groupEntries(g);
  return entries.some((e) => typeof resolveWord(e, lang) !== "string");
}

// Groups are immutable after load, so each group's flattened entries are cached
// instead of re-flattening its tiers on every render. One WeakMap for the whole
// app — a per-caller instance would defeat the point.
const entriesCache = new WeakMap<Group, WordEntry[]>();

/** Every entry of a group, tiers flattened. Cached per group. */
export function groupEntries(g: Group): WordEntry[] {
  let entries = entriesCache.get(g);
  if (!entries) {
    entries = g.tiers ? g.tiers.flat() : (g.words ?? []);
    entriesCache.set(g, entries);
  }
  return entries;
}
