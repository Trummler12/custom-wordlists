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
  /** Ruler tooltip for a list that has been ranked. */
  fameGroupsDefined: (count: number) => string;
  /** Ruler tooltip for a list that hasn't — an invitation to rank it. */
  noFameGroups: string;
  /** 🧹 button and the panel it opens: what this list leaves out. */
  omittedLabel: string;
  omittedTitle: string;
  /** Checkbox beside one omission rule; label reflects what a click would do. */
  omitToggle: (omitted: boolean) => string;
  /** Why one rule's checkbox is disabled. */
  omitLocked: string;
  /** Settings button (aria-label) and the menu's own label. */
  settings: string;
  /** Label of the preference that reveals the per-list English toggles. */
  showEnglishToggle: string;
  /** Why that preference does nothing while the interface is English. */
  showEnglishToggleEn: string;
  /** Toggle a single list to English names; label reflects the current state. */
  englishToggle: (forced: boolean) => string;
  /** Toggle from a category row every list it governs; label on current state. */
  englishToggleAll: (allForced: boolean) => string;
  /** Toggle a single list's fame ruler; label reflects the current state. */
  rulerToggle: (shown: boolean) => string;
  /** Toggle from a category row all the rulers it governs; label on current state. */
  rulerToggleAll: (allShown: boolean) => string;
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
  /** Second half of that warning — see `langWarning()` for when it applies. */
  langFallback: string;
  /** Info marker for a topic whose names in the selected language are the English
   *  ones, on purpose. The language is always the dictionary's own, so a locale may
   *  name it outright and ignore the argument — which reads better in languages
   *  that would inflect it. English keeps it: it is what a language without its own
   *  dictionary would fall back to. */
  langUsesEnglish: (language: string) => string;
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

/** The full ⚠️ warning for a topic, in the active language. The fallback sentence
 *  is dropped for English: an entry's `en` form is the base every other language
 *  falls back *to*, so with English selected nothing is being fallen back from.
 *
 *  Carries `{br}` — render through `html/Msg.svelte`, or `html/plain.ts` where the
 *  result has to be a plain string. */
export function langWarning(ui: UIStrings, code: string, name: string): string {
  const first = ui.langUnsupported(name);
  return code === FALLBACK_LANG ? first : `${first}{br}${ui.langFallback}`;
}
