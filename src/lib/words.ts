// Resolving word entries to a language and rendering them to strings. Every
// function here is a pure function of its arguments — the active language is
// passed in rather than read from state, so a component's derived counts
// recompute on a language switch without any of this knowing about runes.

import type { Group, LocalizedString, NamePair, NamesMode, Word, WordEntry } from "./types";
import { matchTag } from "./languages";

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
 *  Chinese name, not the English one it would otherwise fall through to. */
export function resolveStr(s: LocalizedString, lang: string): string {
  if (typeof s === "string") return s;
  const own = s[lang];
  if (own !== undefined) return own;
  const tag = tagFor(s, lang);
  return tag !== undefined ? s[tag] : s.en;
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
 *  is the base every entry has. */
export function isUnknownIn(e: WordEntry, lang: string): boolean {
  if (lang === "en" || typeof e === "string") return false;
  return (e as Record<string, unknown>)[lang] === undefined && unknownLangs(e).includes(lang);
}

/** Resolve an entry to `lang`. Two equivalent shapes are accepted: the preferred
 *  leaf form (a name pair whose fields each localize) and an entry-level language
 *  map { en, de, … } whose value is itself an entry — the latter is resolved by
 *  picking the language and recursing. */
export function resolveWord(e: WordEntry, lang: string): Word {
  if (typeof e === "string") return e;
  const obj = e as Record<string, unknown>;
  if ("short" in obj && "long" in obj) {
    const p = e as NamePair;
    return { short: resolveStr(p.short, lang), long: resolveStr(p.long, lang) };
  }
  const map = e as Record<string, WordEntry>;
  // Same fallback chain as a leaf: the language, then the closest tag the entry
  // carries, then the English base.
  const tag = map[lang] !== undefined ? lang : tagFor(map, lang);
  return resolveWord((tag !== undefined ? map[tag] : undefined) ?? map.en, lang);
}

/** The string(s) an entry contributes in a names mode. A pair whose two forms
 *  render identically collapses to one, so "both" can't produce a duplicate. */
export function renderEntry(e: WordEntry, mode: NamesMode, lang: string): string[] {
  const w = resolveWord(e, lang);
  if (typeof w === "string") return [w];
  if (mode === "short") return [w.short];
  if (mode === "long") return [w.long];
  return w.short === w.long ? [w.short] : [w.short, w.long];
}

/** Count of distinct rendered strings for a list of entries (without building the
 *  array): what the per-group and per-topic counters show. */
export function renderCount(entries: WordEntry[], mode: NamesMode, lang: string): number {
  const seen = new Set<string>();
  for (const e of entries) for (const w of renderEntry(e, mode, lang)) seen.add(w);
  return seen.size;
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
