// UI-chrome strings (everything the app itself renders — not topic content).
// One dictionary per locale (en.ts, de.ts) implements UIStrings; the frontend
// resolves the active one via strings(lang), falling back to English for any
// language that has topic data but no UI translation yet.

/** Every user-facing string the app chrome renders, keyed and typed. */
export interface UIStrings {
  /** Tagline around the inline skribbl.io link: "<before> skribbl.io <after>". */
  taglineBefore: string;
  taglineAfter: string;
  loadingTopics: string;
  /** Error banner for a failed manifest load. */
  loadError: (message: string) => string;
  noTopics: string;
  topics: string;
  /** Expander aria-label, e.g. "Expand Pokémon" / "Collapse Pokémon". */
  toggle: (expanded: boolean, title: string) => string;
  /** Per-topic inline "loading…" while its data streams in. */
  loadingShort: string;
  /** Selection meta, e.g. "12 of 30 words" (topic, group and category rows). */
  wordsOf: (selected: number, total: number) => string;
  /** Options of the per-group name-form dropdown. */
  nameForm: { short: string; long: string; both: string };
  nameFormLabel: (group: string) => string;
  fameDepthLabel: (group: string) => string;
  tiersValueText: (depth: number, total: number) => string;
  output: string;
  copy: string;
  copied: string;
  emptyOutput: string;
  generatedList: string;
  /** Counter labels: "<words>: 42 · <chars>: 310 / 1,000". */
  wordsLabel: string;
  charsLabel: string;
  belowMin: (min: number) => string;
  overMax: string;
  excluded: (count: number, maxLen: number, list: string) => string;
  /** Globe-button aria-label, e.g. "Language: English". */
  languageLabel: (current: string) => string;
  languageMenu: string;
  /** Warning marker for a topic that doesn't fully support the selected language. */
  langUnsupported: (language: string) => string;
  /** Footer: label of the link to the repository. */
  repository: string;
  /** Footer, around the inline guide link: "<helpOut> <guide><helpOutAfter>".
   *  `helpOutAfter` carries the trailing punctuation, which German and English
   *  place differently around the link. */
  helpOut: string;
  contributionGuide: string;
  helpOutAfter: string;
}

import { en } from "./en";
import { de } from "./de";

/** Language that backs any locale without its own UI dictionary. */
export const FALLBACK_LANG = "en";

const UI: Record<string, UIStrings> = { en, de };

/** Languages the app offers in its picker — the ones with a UI dictionary. This
 *  is the deliberately-curated app-level set, independent of any single topic's
 *  own `languages`; grow it by adding a dictionary above. */
export const SUPPORTED_LANGS: string[] = Object.keys(UI).sort();

/** UI strings for `lang`, falling back to English when it has no dictionary. */
export function strings(lang: string): UIStrings {
  return UI[lang] ?? UI[FALLBACK_LANG];
}
