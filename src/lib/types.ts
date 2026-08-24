// Shapes of the generated manifest (data/index.json), produced by
// scripts/build-index.mjs — the source of truth for the manifest types.
// The topic-file types (Topic/Group) mirror schema/topic.schema.json.

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
  /** Whether this topic has no fame ruler at all — stronger than hiding it behind a
   *  toggle. Inherited down the tree; the topic's own value wins. See lib/rulers. */
  hideRulers?: boolean;
  /** Just a number, passed through from the topic file: how many levels up this
   *  leaf's list is also shown, merged with the same-named leaves it meets there.
   *  1 for `countries.json`/`capitals.json` (meet one level up, under `human/`), 2
   *  later for cities. Nothing to do with ids — resolving which leaves actually meet
   *  is `synthesizeTopics`' job, one layer on. Absent = the leaf lives only where it
   *  sits. */
  inheritsUpwards?: number;
  /** Populated by the frontend (`synthesizeTopics`), never read from a file: on a
   *  SYNTHESIZED topic it holds the ids of the leaves that merge — the resolution
   *  of their `inheritsUpwards` numbers into concrete contributors, which is where
   *  ids first matter. Such a topic keeps no selection state of its own; its depth,
   *  counts and fullness all delegate to these leaves, and it is left out of
   *  category sums so they are not counted twice. Absent on every ordinary topic.
   *  See lib/tree. */
  contributors?: string[];
  /** Icon-tagged control ladders this topic carries, `icon → ordered rule ids` —
   *  the Geoguessr coverage filter is `{ geoguessr: ["no-coverage", "rare-coverage"] }`.
   *  From build-index (a real topic) or copied from a contributor (a synthesized
   *  one), so a control can be shown and synced without loading the file. Absent
   *  where the topic carries no such rule. */
  controls?: Record<string, string[]>;
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
  /** Whether the topics in this category's subtree have no fame ruler at all.
   *  Inherited down to the next declaring node. See lib/rulers. */
  hideRulers?: boolean;
  /** Whether this category's row carries one toggle switching every list below it
   *  to English at once. See lib/english. */
  sharedEnglishToggle?: boolean;
  /** Icon keys whose control this category surfaces on its own row and syncs across
   *  its subtree — `["geoguessr"]` on `geography/human` gives one coverage radio
   *  that commands every Countries/Capitals leaf below. Generic so any icon-tagged
   *  control (see `Omission.icon`) can be lifted to a category. */
  syncControls?: string[];
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

/** A short/long name entry; each field may itself be a LocalizedString.
 *
 *  A bag of named forms, not a fixed couple: at least one of the two is present,
 *  and omitting one binds the entry to the other mode — a `{ short }` never loads
 *  under `long`, a `{ long }` never under `short` (see `renderEntry`). This is the
 *  seam a future `all` mode extends with further variant fields; today it carries
 *  short and long, either of which a single-form entry may leave out. */
export interface NamePair {
  short?: LocalizedString;
  long?: LocalizedString;
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

/** A word resolved to the active language: a plain string, or a short/long pair
 *  where each half is present exactly when the entry carried it — a single-form
 *  entry resolves to a pair with one half. */
export type Word = string | { short?: string; long?: string };

/** Which form(s) of a short/long name a group emits. Per group, default "long". */
export type NamesMode = "short" | "long" | "both";

/** One family of entries a list deliberately leaves out. Every rule can be
 *  switched back on by the reader, so each needs a stable key. See lib/omitted. */
/** Something about a list that only becomes true — or only matters — once the
 *  reader's ruler has gone far enough down it.
 *
 *  For what no count can derive: that a tier's order means nothing because its
 *  source publishes no figures, that its entries come from a thinner source than
 *  the rest. Whatever *is* derivable stays in code, where it can't go stale. */
export interface TierNote {
  /** The ruler position from which this applies, one-based, counted from the
   *  famous end. A statement about where the ruler stands, not an index. */
  fromTier: number;
  /** Absent means ℹ️ — ⚠️ stays reserved for what is unconfirmed. */
  icon?: string;
  text: LocalizedString;
}

/** The ruler's hover text — what the list is ordered by, and what the stop the
 *  reader has dragged to has just selected. Replaces the bare "Fame groups
 *  defined: n" for a list whose tiers came from an outside boundary. */
export interface RulerTooltip {
  /** Shown once the ruler has moved off rest. May carry `{condition}`, replaced
   *  by `tierConditions[depth - 1]` — the lowest band the ruler has just brought
   *  in ("everything with {condition} inhabitants"). */
  text: LocalizedString;
  /** Shown at the leftmost stop, where nothing is selected and so no condition is
   *  in force: say instead what the list is ordered by, which is the one thing the
   *  reader cannot yet read off a selection. */
  empty: LocalizedString;
}

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
  /** When true, the panel label is prefixed with "up to N", N being how many
   *  entries the rule matches. For a rule whose `reason` names a category rather
   *  than a fixed set ("territories generally regarded as part of another state"),
   *  where the count is worth having and not already in the wording — so the reason
   *  is then phrased to read on from the count. A rule whose reason already states
   *  its own number (Pokémon's "300 Dynamax Crystals") leaves this off. */
  count?: boolean;
  /** An icon key that lifts this rule out of the 🚫 panel into its own control.
   *  Rules that share an icon form one ordered ladder (array order = strictness),
   *  rendered as a radio group rather than independent checkboxes — the Geoguessr
   *  coverage filter is `no-coverage` then `rare-coverage`, both `"geoguessr"`. The
   *  frontend resolves the key to the actual glyph or image. */
  icon?: string;
}

/** A group of words: either a flat `words` list or ordered fame `tiers`. */
export interface Group {
  id: string;
  /** Display name, same shape as an entry — see `displayName` in lib/words. */
  title: WordEntry;
  /** Which form of a short/long entry this group emits until the reader picks
   *  another. Absent means `long`. A list of countries wants `short` — which is a
   *  fact about that list rather than a preference, hence a field. */
  defaultNames?: NamesMode;
  /** Notes that appear once the ruler reaches far enough down — see `TierNote`. */
  tierNotes?: TierNote[];
  /** What this list leaves out of its source, and why. Filtered by default; the
   *  reader may switch any of them back on (unless `locked`). */
  omitted?: Omission[];
  /** Families the list *offers* to leave out — present by default, removable on
   *  demand. Same shape, opposite default: 80 species candies are legitimate
   *  words, and still the first thing someone short of drawing room would cut. */
  omittable?: Omission[];
  words?: WordEntry[];
  tiers?: WordEntry[][];
  /** What each tier's boundary is, one entry per tier, same length and order as
   *  `tiers`. Names the outside cut a tiered list was built from (a population, an
   *  area) so the ruler tooltip can say what was selected and an `inheritsUpwards`
   *  family can be checked for drawing tier k the same way. Localized. Absent for a
   *  list with no outside boundary. See schema/topic.schema.json. */
  tierConditions?: LocalizedString[];
  /** What the ruler's hover says — see `RulerTooltip`. Absent falls back to the
   *  bare tier count. */
  rulerTooltip?: RulerTooltip;
  /** Present only on a SYNTHESIZED group (assembled by `topics.groupsOf` for an
   *  inheritsUpwards topic): the contributor groups it was merged from, kept so a
   *  later per-contributor view (⚙️/✂️) can regroup without the merge being
   *  rewritten. Rendering and counts use the deduplicated `tiers`; this is the
   *  provenance the merge must not throw away. See _untracked/docs/geography-architecture.md. */
  sources?: { tid: string; group: Group }[];
  /** How many entries the list has no name for in the language it is being shown
   *  in, one number per tier — see `unknownByTier` in lib/omitted. Not a field of
   *  the file: `visibleGroup` puts it on the view it hands back, because by then
   *  the entries it counts are gone and only the view knows how many there were.
   *
   *  Per tier so the reader's ruler can scope it — the panel reports what is
   *  missing from the list they are taking, not from the file. */
  unknownByTier?: number[];
  /** Per declared rule id: how many entries it matches, and a sample of their
   *  names for the hover — put here by `visibleGroup`, which sees the entries
   *  before they are filtered, and merged across a family by `mergeGroups`. The
   *  count feeds a rule's "up to N" label, the names its tooltip. */
  omissionSummary?: Record<string, { count: number; names: string[] }>;
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
  /** Whether this topic has no fame ruler at all — no slider, no toggle. Inherited
   *  down the tree; the topic's own value wins. See lib/rulers. */
  hideRulers?: boolean;
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
  // A topic carries its list directly, in the same shape a `Group` does;
  // `topics.groupsOf` wraps it as the single group the rendering code consumes.
  defaultNames?: NamesMode;
  tierNotes?: TierNote[];
  omitted?: Omission[];
  omittable?: Omission[];
  words?: WordEntry[];
  tiers?: WordEntry[][];
  tierConditions?: LocalizedString[];
  rulerTooltip?: RulerTooltip;
  /** How many levels up this leaf's list is also shown, merged with the same-named
   *  leaves it meets there into one synthesized topic. `1` = the parent level (each
   *  `<continent>/countries.json` meets the others one level up, under Human). `2`
   *  would additionally merge two levels up (cities: per continent, then global). A
   *  leaf keeps its own list where it sits AND contributes upward — an added field,
   *  not an alternative to `tiers`/`words`. See schema/topic.schema.json. */
  inheritsUpwards?: number;
}
