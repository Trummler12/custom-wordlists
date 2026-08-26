// UI-chrome strings (everything the app itself renders — not topic content).
// One dictionary per locale implements UIStrings — seven of them, listed in UI
// below; the frontend resolves the active one via strings(lang), falling back to
// English for any language that has topic data but no UI translation yet.
//
// Grouped rather than flat, and a group is one of two things: a PLACE, when its
// strings only ever appear there (header, tree, settings, output, footer), or a
// FEATURE, when they follow a control that turns up on several rows (names, fame,
// omitted, language). Which one a string is can be read off the component tree —
// `settings.showEnglish` labels a checkbox that exists in exactly one popover, so
// it is a place, while `language.useEnglish` sits on every topic row, so it is a
// feature. The group carries the prefix, so no key repeats it.

import type { VariantId } from "./variants";

/** The banner. */
export interface HeaderStrings {
  /** Tagline around the inline skribbl.io link: "<before> skribbl.io <after>". */
  taglineBefore: string;
  taglineAfter: string;
}

/** The topic tree's own chrome — its controls have their own groups below. */
export interface TreeStrings {
  topics: string;
  loading: string;
  /** Error banner for a failed manifest load. */
  loadError: (message: string) => string;
  empty: string;
  /** Expander aria-label, e.g. "Expand Pokémon" / "Collapse Pokémon". The title
   *  is passed whole and the locale places it: German puts the verb last. */
  toggle: (expanded: boolean, title: string) => string;
  /** Per-topic inline "loading…" while its data streams in. */
  loadingShort: string;
  /** Selection meta, e.g. "12 of 30 words" (topic, group and category rows).
   *  A list of one is a list of one word, not "1 of 1 words". */
  wordsOf: (selected: number, total: number) => string;
}

/** The short/long name-form dropdown. */
export interface NamesStrings {
  form: { pref: string; short: string; long: string; both: string; all: string };
  formLabel: (group: string) => string;
}

/** The fame ruler and the 📏 that shows it. */
export interface FameStrings {
  depthLabel: (group: string) => string;
  /** Slider aria-valuetext. At depth 1 there is no "top 1 of" to speak of. */
  valueText: (depth: number, total: number) => string;
  /** Ruler tooltip for a list that has been ranked. */
  groupsDefined: (count: number) => string;
  /** Ruler tooltip for a list that hasn't — an invitation to rank it. */
  none: string;
  /** The prefix a topic's `rulerTooltip.text` wears — what the ruler position has
   *  selected, down to the condition the text then names. */
  selected: string;
  /** The same prefix for a merged topic whose contributors don't all sit at its
   *  ruler position: most are there, not all. */
  mostlySelected: string;
  /** Toggle a single list's fame ruler; label reflects the current state. */
  toggle: (shown: boolean) => string;
  /** Toggle from a category row all the rulers it governs; label on current state. */
  toggleAll: (allShown: boolean) => string;
}

/** The 🧹 button and the panel it opens: what this list leaves out. */
export interface OmittedStrings {
  label: string;
  title: string;
  /** Checkbox beside one omission rule; label reflects what a click would do. */
  toggle: (omitted: boolean) => string;
  /** Why one rule's checkbox is disabled. */
  locked: string;
  /** The "up to N" a counting rule leads with, its `reason` reading on from it —
   *  an upper bound, since how many a click brings back depends on the ruler. */
  upTo: (n: number) => string;
  /** The panel row for entries the list has no name for, and its hint — which,
   *  like `toggle`, says what a click would do. The language is named rather than
   *  referred to: the interface may be in a different one, and "no German names"
   *  under a German interface showing Korean lists would be a lie. In two halves,
   *  as `usesEnglish` — see `splitName` in lib/languages.
   *
   *  An upper bound rather than a plain count: `n` is what the whole list is
   *  missing, and how many of them a click actually brings back depends on where
   *  the reader's fame ruler stands. */
  unknown: (n: number, primary: string, secondary: string) => string;
  unknownHint: (omitted: boolean) => string;
  /** One line of the hint's breakdown, for a ranked list: which fame tier the
   *  missing names fall in, counted from the famous end as the ruler counts its
   *  stops. The useful half of the bound above — it says how far down a reader
   *  has to go before any of this concerns them. */
  unknownTier: (tier: number, n: number) => string;
  /** The panel row for names the target game would refuse for their length, and
   *  its hint — which names them, since unlike the row above these have names.
   *
   *  Names rather than entries: what leaves the list is one form of an entry, and
   *  the entry itself is fine under its other one. Also an upper bound, for the
   *  same reason as `unknown`. */
  tooLong: (n: number, maxLen: number) => string;
  tooLongHint: (omitted: boolean) => string;
}

/** The Pegman filter behind its own button: a country has full Street View
 *  coverage, only sparse coverage, or none — the reader picks how strict to be. */
export interface CoverageStrings {
  /** Button aria-label and popup heading. */
  label: string;
  /** The three strictness levels, from loosest to strictest. `all` keeps every
   *  country; `withCoverage` (labelled "official") drops the uncovered ones but keeps
   *  the sparse; `reliable` keeps only the fully covered. */
  all: string;
  withCoverage: string;
  reliable: string;
}

/** The sovereignty & recognition matrix behind its own ✅ button: a grid of cells,
 *  de-jure recognition down the rows, de-facto control across the columns, that the
 *  reader fills as a top-left-anchored staircase. The cells are named by their row
 *  and column, so only the axes and the always-on corner need words. */
export interface SovereigntyStrings {
  /** Button aria-label and popup heading. */
  label: string;
  /** A Wikipedia URL for this language's "states with limited recognition" article,
   *  linked beside the heading. */
  wiki: string;
  /** The row and column axis names, for the corner cell (`de jure` down the rows,
   *  `de facto` across the columns). */
  axisRow: string;
  axisCol: string;
  /** The two column headers, most independent first. */
  cols: [string, string];
  /** The four row headers, most recognized first. */
  rows: [string, string, string, string];
  /** A fuller definition of each column and row, shown on the header's hover. */
  colDefs: [string, string];
  rowDefs: [string, string, string, string];
  /** The always-on top-left cell (universally recognized, fully independent). */
  regular: string;
}

/** The picker, the ⚠️/ℹ️ markers, and the per-list 🇬🇧 toggles. */
export interface LanguageStrings {
  /** Globe-button aria-label, e.g. "Language: English". */
  label: (current: string) => string;
  menu: string;
  /** Warning marker for a topic that doesn't fully support the selected language. */
  unsupported: (language: string) => string;
  /** Second half of that warning — see `langWarning()` for when it applies. */
  fallback: string;
  /** Info marker for a topic whose names in the selected language are the English
   *  ones, on purpose. The content language named in the interface one, so it is
   *  genuinely a variable: a German interface says this about Korean lists.
   *
   *  Handed over in two halves — see `splitName` in lib/languages — because a
   *  locale may need to decline the name, and `Chinesisch (vereinfacht)` can only
   *  take an ending on its first word. A locale that puts the name in front of
   *  its sentence simply concatenates them. */
  usesEnglish: (primary: string, secondary: string) => string;
  /** The switch for a language that is written two ways — romaji beside kana, or
   *  Latin American Spanish beside Spanish. Only ever shown while that language is
   *  selected, but shown in whatever language the interface is in. */
  variant: Record<VariantId, string>;
  /** What a variant offers, where that needs saying — the romaji one names its
   *  spelling convention and why the other convention isn't offered. Partial: a
   *  variant that speaks for itself needs no note. */
  variantNote: Partial<Record<VariantId, string>>;
  /** Said of a list whose romaji were transliterated rather than sourced: correct
   *  as readings, not necessarily as spellings. Carries `[text](url)` — render it
   *  through html/Msg. */
  generatedRomaji: string;
  /** How many of a list's entries the variant spells differently. The number is
   *  the point: it says where a variant matters, which is otherwise invisible. */
  variantDiffers: (n: number) => string;
  /** Opens the list of those entries, side by side. */
  variantShowList: string;
  /** Toggle a single list to English names; label reflects the current state. */
  useEnglish: (forced: boolean) => string;
  /** Toggle from a category row every list it governs; label on current state. */
  useEnglishAll: (allForced: boolean) => string;
}

/** The ⚙️ popover. */
export interface SettingsStrings {
  /** Button aria-label and the menu's own label. */
  label: string;
  /** Label of the preference that reveals the per-list English toggles. */
  showEnglish: string;
  /** Why that preference does nothing while the interface is English. */
  showEnglishEn: string;
  /** Label of the dropdown pinning the interface to one language. Reads as one
   *  line with its value ("Interface language: English"), so it carries its own
   *  colon — French and German don't punctuate one the same way. */
  interfaceLang: string;
  /** Its first option, and the default: follow the list language where we have a
   *  dictionary for it. Kept short — it sits in a dropdown, not in a sentence. */
  interfaceAuto: string;
  /** The reset button: drops every stored preference back to the shipped default.
   *  Carries a `{br}` so it wraps predictably in the narrow menu. */
  reset: string;
  /** The armed label after the first click — a second click confirms, so the reset
   *  is never one stray click away. */
  resetConfirm: string;
  /** Accessible name of the ✕ that disarms the reset without firing it. */
  resetCancel: string;
}

/** The output panel and its counter. */
export interface OutputStrings {
  label: string;
  copy: string;
  copied: string;
  /** Button label when the clipboard refused — an insecure origin, a document
   *  that isn't focused, a denied permission. */
  copyFailed: string;
  /** What to do about it, shown beside the list. The chips are selected for the
   *  reader at the same moment, so this describes a state as much as it asks. */
  copyManual: string;
  empty: string;
  generatedList: string;
  /** Counter labels: "<words>: 42 · <chars>: 310 / 1,000". */
  words: string;
  chars: string;
  belowMin: (min: number) => string;
  overMax: string;
  /** How many of the words in the list skribbl would refuse for their length —
   *  which can only happen where a reader switched the ✂️ rule off, so it states a
   *  consequence rather than warning about a surprise. The words themselves are on
   *  the hover, since the number is the part worth a line. */
  overLong: (count: number, maxLen: number) => string;
}

/** The footer. */
export interface FooterStrings {
  /** Label of the link to the repository. */
  repository: string;
  /** Around the inline guide link: "<helpOut> <contributionGuide><helpOutAfter>".
   *  `helpOutAfter` carries the trailing punctuation, which German and English
   *  place differently around the link. */
  helpOut: string;
  contributionGuide: string;
  helpOutAfter: string;
}

/** Every user-facing string the app chrome renders, keyed and typed. */
export interface UIStrings {
  header: HeaderStrings;
  tree: TreeStrings;
  names: NamesStrings;
  fame: FameStrings;
  omitted: OmittedStrings;
  coverage: CoverageStrings;
  sovereignty: SovereigntyStrings;
  language: LanguageStrings;
  settings: SettingsStrings;
  output: OutputStrings;
  footer: FooterStrings;
}

import { en } from "./en";
import { de } from "./de";
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { ja } from "./ja";
import { ko } from "./ko";

/** Language that backs any locale without its own UI dictionary. */
export const FALLBACK_LANG = "en";

// Five of these are machine-written and unreviewed by a native speaker; the
// contribution guide asks for proofreaders by name. Chinese is missing on
// purpose: it is a content language because Pokémon has it, not a planned
// interface language — see docs/Language-Roadmap.md.
const UI: Record<string, UIStrings> = { en, de, es, fr, it, ja, ko };

/** Languages the chrome can be rendered in — the ones with a dictionary above.
 *  Deliberately small: a list can be offered in a language long before anyone has
 *  translated the interface into it, which is the whole reason the two are
 *  separate settings. */
export const UI_LANGS: string[] = Object.keys(UI).sort();

/** Languages the app offers in its picker — the app-level curated set, not
 *  derived from topics; a topic missing the selected language falls back to en.
 *
 *  These are the tags the data actually uses, script and all: `zh-Hans` and
 *  `zh-Hant` are two lists, and a reader who wants Traditional should be able to
 *  say so rather than have a script guessed for them. Tags nobody offers still
 *  resolve — see `matchTag` — so a browser asking for `zh-CN` lands here anyway.
 *
 *  Alphabetical, which is also the order `matchTag` prefers when a bare tag has
 *  to be widened. */
export const CONTENT_LANGS: string[] = [
  "de",
  "en",
  "es",
  "fr",
  "it",
  "ja",
  "ko",
  "zh-Hans",
  "zh-Hant",
];

/** UI strings for `lang`, falling back to English when it has no dictionary. */
export function strings(lang: string): UIStrings {
  return UI[lang] ?? UI[FALLBACK_LANG];
}

/** The full ⚠️ warning for a topic, in the active language. The fallback sentence
 *  is dropped for English: an entry's `en` form is the base every other language
 *  falls back *to*, so with English selected nothing is being fallen back from.
 *
 *  Carries `{br}` — render through `html/Msg.svelte`, or `html/plain.ts` where the
 *  result has to be a plain string. */
export function langWarning(ui: UIStrings, code: string, name: string): string {
  const first = ui.language.unsupported(name);
  return code === FALLBACK_LANG ? first : `${first}{br}${ui.language.fallback}`;
}
