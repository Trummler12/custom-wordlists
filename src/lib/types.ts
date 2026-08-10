// Shapes of the generated manifest (data/index.json), produced by
// scripts/build-index.mjs — the source of truth for the manifest types.
// The topic-file types (Topic/Group/Preset) mirror schema/topic.schema.json.

/** One topic as summarized in the manifest — enough to render the tree. */
export interface TopicSummary {
  id: string;
  /** Display name, already merged from the topic file's `title`/`titles`. */
  title: WordEntry;
  /** Emoji/icon, or null when the topic has none. */
  icon: string | null;
  /** Category path from topics/ (e.g. "gaming" or "gaming/pokemon"); "" = none. */
  category: string;
  /** Path to the topic's JSON file, relative to data/topics/ (e.g.
   *  "animation/south-park.json" or "animation/spongebob/characters.json"). */
  path: string;
  /** True when the topic is a lone file in a folder named after it. That layout is
   *  how a topic says it expects to be split into subtopics later, so such a topic
   *  keeps its expander and its group rows even while it has only one group. */
  foldered?: boolean;
  /** Languages the topic fully supports. Absent means support is undeclared — the
   *  UI flags the topic (⚠️, even in English) until it's filled in. */
  languages?: string[];
  /** Of those, the ones whose names simply are the English ones. See lib/languages. */
  usesEnglishFor?: string[];
  /** Whether this topic's fame ruler starts hidden behind a toggle. Its *presence*
   *  (either value) also makes the topic its own ruler-visibility boundary; absent
   *  means it inherits from the nearest ancestor that declares it. See lib/rulers. */
  hideRulersByDefault?: boolean;
  groupCount: number;
  wordCount: number;
}

/** Optional display metadata for a category node (from a `_category.json`). */
export interface CategoryMeta {
  /** Display name, already merged from the sidecar's `title`/`titles`. */
  title?: WordEntry;
  /** Emoji/icon for the category. */
  icon?: string;
  /** Whether this category's topics start with their fame rulers hidden. Its
   *  *presence* (either value) makes the category an independent ruler-visibility
   *  boundary whose toggle governs its subtree down to the next declaring node. */
  hideRulersByDefault?: boolean;
}

/** The generated manifest the frontend loads first. */
export interface Manifest {
  generatedAt: string;
  topics: TopicSummary[];
  /** Category display metadata keyed by category path; only labelled ones appear.
   *  Optional so an older cached index.json (pre-categories) still type-checks. */
  categories?: Record<string, CategoryMeta>;
}

/** A per-language map: the "en" base is required, other language codes optional. */
export type LangMap<T> = { en: T } & Record<string, T>;

/** A string that may translate: the same in every language (a plain string), or a
 *  language map with an "en" base (languages equal to "en" are omitted). */
export type LocalizedString = string | LangMap<string>;

/** A short/long name entry; each field may itself be a LocalizedString. */
export interface NamePair {
  short: LocalizedString;
  long: LocalizedString;
}

/** A word entry in a list: a localized string, a short/long name pair (each field
 *  may itself localize — the preferred form), or an entry-level language map whose
 *  values are a whole entry — a string or name pair (also accepted, e.g. from
 *  community content). */
export type WordEntry = LocalizedString | NamePair | LangMap<string | NamePair>;

/** A word resolved to the active language: a plain string or a short/long pair. */
export type Word = string | { short: string; long: string };

/** Which form(s) of a short/long name a group emits. Per group, default "long". */
export type NamesMode = "short" | "long" | "both";

/** A group of words: either a flat `words` list or ordered fame `tiers`. */
export interface Group {
  id: string;
  /** Display name, same shape as an entry — see `displayName` in lib/words. */
  title: WordEntry;
  /** @deprecated Being folded into `title`; read through `titles ?? title`. */
  titles?: LangMap<string>;
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
  /** Display name, same shape as an entry — see `displayName` in lib/words. */
  title: WordEntry;
  /** @deprecated Being folded into `title`; read through `titles ?? title`. */
  titles?: LangMap<string>;
  icon?: string;
  description?: string;
  /** Languages this topic fully supports. Absent means support is undeclared (the
   *  UI shows a ⚠️ marker); declare the languages to confirm support — including
   *  for a language-neutral list whose entries read the same in every locale. */
  languages?: string[];
  /** Of those, the ones whose names simply are the English ones — the UI says so with
   *  an ℹ️ rather than leaving the reader to wonder. `"*"` stands for every language
   *  not named in `languages`. See lib/languages. */
  usesEnglishFor?: string[];
  /** Whether this topic's fame ruler starts hidden behind a toggle; its presence
   *  also marks the topic as its own ruler-visibility boundary. */
  hideRulersByDefault?: boolean;
  /** ISO date (YYYY-MM-DD) the list's contents last changed. */
  lastUpdated?: string;
  /** ISO date (YYYY-MM-DD) the list was last verified against its source. */
  lastChecked?: string;
  groups: Group[];
  presets?: Preset[];
}
