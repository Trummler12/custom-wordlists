// Shapes of the generated manifest (data/index.json), produced by
// scripts/build-index.mjs — the source of truth for the manifest types.
// The topic-file types (Topic/Group/Preset) mirror schema/topic.schema.json.

/** One topic as summarized in the manifest — enough to render the tree. */
export interface TopicSummary {
  id: string;
  /** Display name — see `displayName` in lib/words. */
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
  /** Whether this list's romaji were transliterated rather than sourced. */
  generatedRomaji?: boolean;
  /** Whether this topic's fame ruler starts hidden behind a toggle. Its *presence*
   *  (either value) also makes the topic its own ruler-visibility boundary; absent
   *  means it inherits from the nearest ancestor that declares it. See lib/rulers. */
  hideRulersByDefault?: boolean;
  groupCount: number;
  wordCount: number;
}

/** Optional display metadata for a category node (from a `_category.json`). */
export interface CategoryMeta {
  /** Display name — see `displayName` in lib/words. */
  title?: WordEntry;
  /** Emoji/icon for the category. */
  icon?: string;
  /** Whether this category's topics start with their fame rulers hidden. Its
   *  *presence* (either value) makes the category an independent ruler-visibility
   *  boundary whose toggle governs its subtree down to the next declaring node. */
  hideRulersByDefault?: boolean;
  /** Whether this category's row carries one toggle switching every list below it
   *  to English at once. See lib/english. */
  sharedEnglishToggle?: boolean;
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
export type WordEntry = LocalizedString | NamePair | LangMapEntry;

/** An entry-level language map. Beside the languages it carries a `"?"` listing
 *  the ones it has no name in at all — see `UNKNOWN` in lib/words for why an
 *  absent key can't say that. */
export type LangMapEntry = { en: string | NamePair; "?"?: string[] } & Record<
  string,
  string | NamePair | string[] | undefined
>;

/** A word resolved to the active language: a plain string or a short/long pair. */
export type Word = string | { short: string; long: string };

/** Which form(s) of a short/long name a group emits. Per group, default "long". */
export type NamesMode = "short" | "long" | "both";

/** One family of entries a list deliberately leaves out. Every rule can be
 *  switched back on by the reader, so each needs a stable key. See lib/omitted. */
export interface Omission {
  /** Stable key for the reader's stored choice — the glob may be edited without
   *  resetting it. */
  id: string;
  /** Whole-name glob: `*`, `?`, `[0-9]`. Matches an entry when any of its
   *  language forms matches any of these, since the same junk is named
   *  differently per language — sometimes differently enough to need a second
   *  glob (`X-Angriff 2` and `Angriffplus2` are one family). */
  match: string | string[];
  /** Why, in one phrase — the line the reader sees beside the checkbox. Lives
   *  here rather than in a locale because it describes this list's source, not
   *  the app; may carry `[text](url)` and `{br}`, resolved by locale/html. */
  reason: LocalizedString;
  /** The name that stands for the family, where the source has none of its own
   *  (`Datenkarte01`…`27` → `Datenkarte`). Localized, because the base name is
   *  missing in every language, not just the one the pattern is written in. */
  as?: WordEntry;
  /** Names the glob catches but shouldn't — a glob has no negation, and one
   *  exception is cheaper than a pattern contorted to avoid it. `*-Bonbon` means
   *  the 80 species candies, not `Dynamax-Bonbon`. Matched against any language
   *  form, like the glob itself. */
  except?: string[];
  /** When true, the reader can't switch this rule off — its checkbox is shown but
   *  disabled. For a family that isn't words at all, where re-including it could
   *  only ever be a mistake (300 Dynamax Crystals named `★Sgr6879`). Rare: the
   *  default is that anything omitted can be asked back. */
  locked?: boolean;
}

/** A group of words: either a flat `words` list or ordered fame `tiers`. */
export interface Group {
  id: string;
  /** Display name, same shape as an entry — see `displayName` in lib/words. */
  title: WordEntry;
  /** What this list leaves out of its source, and why. Filtered by default; the
   *  reader may switch any of them back on (unless `locked`). */
  omitted?: Omission[];
  /** Families the list *offers* to leave out — present by default, removable on
   *  demand. Same shape, opposite default: 80 species candies are legitimate
   *  words, and still the first thing someone short of drawing room would cut. */
  omittable?: Omission[];
  words?: WordEntry[];
  tiers?: WordEntry[][];
  /** How many entries the list has no name for in the language it is being shown
   *  in — see `unknownCount` in lib/omitted. Not a field of the file: `visibleGroup`
   *  puts it on the view it hands back, because by then the entries it counts are
   *  gone and only the view knows how many there were. */
  unknownCount?: number;
}

/** A named bundle of group ids within a topic. */
export interface Preset {
  id: string;
  title: string;
  groups: string[];
}

/** A single topic data file (data/topics/<…>/<file>.json). */
/** One repair of a source that is wrong, by the entry's English name. Beside
 *  `entry` and `why` the keys are language tags: `new` is what the entry must
 *  carry, `old` what the source said when the correction was written. */
export type Correction = { entry: string; why: string } & Record<
  string,
  string | { old: string; new: string } | undefined
>;

export interface Topic {
  id: string;
  /** Display name, same shape as an entry — see `displayName` in lib/words. */
  title: WordEntry;
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
  /** Whether this list's romaji were transliterated from its Japanese names rather
   *  than taken from a source that names them. Correct as readings, not necessarily
   *  as spellings — the UI says so and asks for corrections. */
  generatedRomaji?: boolean;
  /** Whether this topic's fame ruler starts hidden behind a toggle; its presence
   *  also marks the topic as its own ruler-visibility boundary. */
  hideRulersByDefault?: boolean;
  /** Where the entries came from — one string or a list of them, free-form so a
   *  label can precede the link ("German: https://…"). */
  sources?: string | string[];
  /** Who compiled or curated the list — one string or a list of them. */
  credits?: string | string[];
  /** Where the source is simply wrong. An instruction to the import, not to the
   *  app: the frontend never reads this, and it is here only so the type mirrors
   *  the schema. See `corrections` in schema/topic.schema.json. */
  corrections?: Correction[];
  /** ISO date (YYYY-MM-DD) the list's contents last changed. */
  lastUpdated?: string;
  /** ISO date (YYYY-MM-DD) the list was last verified against its source. */
  lastChecked?: string;
  groups: Group[];
  presets?: Preset[];
}
