// Shapes of the generated manifest (data/index.json), produced by
// scripts/build-index.mjs — the source of truth for the manifest types.
// The topic-file types (Topic/Group/Preset) mirror schema/topic.schema.json.

/** One topic as summarized in the manifest — enough to render the tree. */
export interface TopicSummary {
  id: string;
  title: string;
  /** Per-language titles, present only when the name actually translates (e.g.
   *  SpongeBob). Absent when every language shares the same name; falls back to
   *  `title`. */
  titles?: Record<string, string>;
  /** Emoji/icon, or null when the topic has none. */
  icon: string | null;
  /** Category path from topics/ (e.g. "gaming" or "gaming/pokemon"); "" = none. */
  category: string;
  /** Path to the topic's JSON file, relative to data/topics/ (e.g.
   *  "animation/south-park.json" or "animation/spongebob/characters.json"). */
  path: string;
  /** Languages the topic fully supports; absent = unspecified (no warning). */
  languages?: string[];
  groupCount: number;
  wordCount: number;
}

/** Optional display metadata for a category node (from a `_category.json`). */
export interface CategoryMeta {
  /** Display name for languages without a `titles` entry; also the global name. */
  title?: string;
  /** Per-language display names, keyed by language code. */
  titles?: Record<string, string>;
  /** Emoji/icon for the category. */
  icon?: string;
}

/** The generated manifest the frontend loads first. */
export interface Manifest {
  generatedAt: string;
  topics: TopicSummary[];
  /** Category display metadata keyed by category path; only labelled ones appear.
   *  Optional so an older cached index.json (pre-categories) still type-checks. */
  categories?: Record<string, CategoryMeta>;
}

/** A string that may be localized: a plain string (same in every language), or a
 *  per-language map whose keys are language codes ("en" is the base; languages
 *  equal to "en" are omitted). */
export type LocalizedString = string | Record<string, string>;

/** A short/long name entry; each field may itself be a LocalizedString. */
export interface NamePair {
  short: LocalizedString;
  long: LocalizedString;
}

/** A word entry in a list: a localized string, a short/long name pair (each field
 *  may itself localize — the preferred form), or an entry-level language map whose
 *  values are whole entries (also accepted, e.g. from community content). */
export type WordEntry = LocalizedString | NamePair | { [lang: string]: WordEntry };

/** A word resolved to the active language: a plain string or a short/long pair. */
export type Word = string | { short: string; long: string };

/** A group of words: either a flat `words` list or ordered fame `tiers`. */
export interface Group {
  id: string;
  title: string;
  /** Per-language group titles, present only when the group name translates. */
  titles?: Record<string, string>;
  words?: WordEntry[];
  tiers?: WordEntry[][];
}

/** A named bundle of group ids within a topic. */
export interface Preset {
  id: string;
  title: string;
  groups: string[];
}

/** A single topic data file (data/topics/<…>/<file>.json). */
export interface Topic {
  id: string;
  title: string;
  /** Per-language titles, when the topic name translates. */
  titles?: Record<string, string>;
  icon?: string;
  description?: string;
  /** Languages this topic fully supports; absent = language-neutral. */
  languages?: string[];
  /** ISO date (YYYY-MM-DD) the list's contents last changed. */
  lastUpdated?: string;
  /** ISO date (YYYY-MM-DD) the list was last verified against its source. */
  lastChecked?: string;
  groups: Group[];
  presets?: Preset[];
}
