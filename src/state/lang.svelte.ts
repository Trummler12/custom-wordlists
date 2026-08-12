// The selected UI language, and everything that follows from it.
//
// Exported as a single instance rather than as loose `let`s: a `$state` export
// read across a module boundary as a plain value loses its reactivity, so every
// store in state/ hands out an object and callers reach through it (`lang.current`,
// not `lang`). The same rule is why `ui` is a `$derived` field and not a plain one.

import { FALLBACK_LANG, strings, SUPPORTED_LANGS, type UIStrings } from "../locale";
import type { TopicSummary } from "../lib/types";

const STORAGE_KEY = "wordlists:lang";

// Endonyms for the picker; fallback is the upper-cased code.
const ENDONYMS: Record<string, string> = {
  de: "Deutsch", en: "English", fr: "Français", es: "Español", it: "Italiano",
  pt: "Português", nl: "Nederlands", pl: "Polski", ja: "日本語", ko: "한국어", zh: "中文",
};

class LangState {
  /** Which variant of a localized topic to show. Neutral topics ignore it. */
  current = $state("en");

  /** Languages the picker offers — the app's curated set (see locale/), not
   *  derived from topics: a topic missing the selected language falls back to en. */
  readonly available: string[] = SUPPORTED_LANGS;

  /** UI-chrome strings for the current language, English where untranslated. */
  readonly ui: UIStrings = $derived(strings(this.current));

  /** Display name of a language, in that language. */
  name(l: string): string {
    return ENDONYMS[l] ?? l.toUpperCase();
  }

  /** Resolve the startup language: stored → browser → en → first available. */
  init(): void {
    const stored = read();
    const browser = navigator.language?.slice(0, 2);
    this.current =
      [stored, browser, "en"].find((l) => l && this.available.includes(l)) ??
      this.available[0] ??
      "en";
  }

  /** Switch languages. Topic files carry every language inline, so nothing is
   *  refetched — the derived counts and output re-resolve each entry against the
   *  new language, and the id-keyed selection stays put. */
  set(l: string): void {
    if (l === this.current) return;
    this.current = l;
    write(l);
  }

  // --- Content language ------------------------------------------------------
  // The interface language is one thing; the language a list's names come out in
  // is another. They agree unless a topic is switched to English — for a list
  // whose German names nobody uses, say. Everything that renders words asks
  // `contentLang` rather than reading `current`, so counts, de-duplication, the
  // output, the ⚠️/ℹ️ marker and which entries a list even has all move together,
  // and none of them has to know a topic can differ.
  //
  // Here rather than in `selection` because it is a language, not a choice about
  // one list's contents — and because `topics` needs it to resolve a group, which
  // it cannot ask `selection` for without a cycle.

  /** Topics switched to their English entries. Not stored: it answers to the
   *  language in the picker, and that changes under it. */
  forceEnglish = $state<Record<string, boolean>>({});

  contentLang(tid: string): string {
    return this.forceEnglish[tid] ? FALLBACK_LANG : this.current;
  }
  isForcedEnglish(t: TopicSummary): boolean {
    return !!this.forceEnglish[t.id];
  }
  toggleEnglish(t: TopicSummary): void {
    this.forceEnglish[t.id] = !this.forceEnglish[t.id];
  }

  allForcedEnglish(ts: TopicSummary[]): boolean {
    return ts.length > 0 && ts.every((t) => this.isForcedEnglish(t));
  }
  someForcedEnglish(ts: TopicSummary[]): boolean {
    return !this.allForcedEnglish(ts) && ts.some((t) => this.isForcedEnglish(t));
  }
  toggleCatEnglish(ts: TopicSummary[]): void {
    const on = !this.allForcedEnglish(ts);
    for (const t of ts) this.forceEnglish[t.id] = on;
  }
}

// localStorage throws in a few real setups (private mode, blocked storage), and
// a missing preference is never worth an error.
function read(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
function write(l: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, l);
  } catch {
    /* storage unavailable — the choice just won't survive a reload */
  }
}

export const lang = new LangState();
