// Resolving word entries to a language and rendering them to strings. Every
// function here is a pure function of its arguments — the active language is
// passed in rather than read from state, so a component's derived counts
// recompute on a language switch without any of this knowing about runes.

import type { Group, LocalizedString, NamePair, NamesMode, Word, WordEntry } from "./types";

/** Resolve a leaf string to `lang`: a language map picks `lang` (falling back to
 *  its "en" base); a plain string is already neutral. */
export function resolveStr(s: LocalizedString, lang: string): string {
  return typeof s === "string" ? s : (s[lang] ?? s.en);
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
  return resolveWord(map[lang] ?? map.en, lang);
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
