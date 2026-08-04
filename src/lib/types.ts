// Shapes of the generated manifest (data/index.json), produced by
// scripts/build-index.mjs — the source of truth for the manifest types.
// The topic-file types (Topic/Group/Preset) mirror schema/topic.schema.json.

/** One topic as summarized in the manifest — enough to render the tree. */
export interface TopicSummary {
  id: string;
  title: string;
  /** Per-language titles; present only when the variants' names actually differ
   *  (e.g. SpongeBob). Absent when every language shares the same name. */
  titles?: Record<string, string>;
  /** Emoji/icon, or null when the topic has none. */
  icon: string | null;
  /** Category path from topics/ (e.g. "gaming" or "gaming/pokemon"); "" = none. */
  category: string;
  /** True when the file sits loose in the category folder (no id-named folder). */
  flat?: boolean;
  /** Available language codes (e.g. ["de","en"]); empty = language-neutral. */
  langs: string[];
  /** JSON filenames for the topic; the frontend fetches one of these. */
  files: string[];
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

/** A word entry: a plain string, or a short/long name pair (for the Names mode). */
export type Word = string | { short: string; long: string };

/** A group of words: either a flat `words` list or ordered fame `tiers`. */
export interface Group {
  id: string;
  title: string;
  words?: Word[];
  tiers?: Word[][];
}

/** A named bundle of group ids within a topic. */
export interface Preset {
  id: string;
  title: string;
  groups: string[];
}

/** A single topic data file (data/topics/<id>/<file>.json). */
export interface Topic {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  /** Present only on translated variants; absent on language-neutral files. */
  lang?: string;
  /** ISO date (YYYY-MM-DD) the list's contents last changed. */
  lastUpdated?: string;
  /** ISO date (YYYY-MM-DD) the list was last verified against its source. */
  lastChecked?: string;
  groups: Group[];
  presets?: Preset[];
}
