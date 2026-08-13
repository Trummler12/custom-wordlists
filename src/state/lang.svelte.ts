// The selected UI language, and everything that follows from it.
//
// Exported as a single instance rather than as loose `let`s: a `$state` export
// read across a module boundary as a plain value loses its reactivity, so every
// store in state/ hands out an object and callers reach through it (`lang.current`,
// not `lang`). The same rule is why `ui` is a `$derived` field and not a plain one.

import { CONTENT_LANGS, FALLBACK_LANG, strings, UI_LANGS, type UIStrings } from "../locale";
import { matchTag } from "../lib/languages";
import type { TopicSummary } from "../lib/types";

const STORAGE_KEY = "wordlists:lang";
const UI_STORAGE_KEY = "wordlists:uiLang";

/** The interface follows the list language unless told otherwise. */
export const AUTO = "auto";

/** A language's name, in `inLang`. `Intl.DisplayNames` is generated from the same
 *  CLDR data the language lists are, so it agrees with them for free and needs no
 *  table of our own — pass a language its own code for the endonym. */
function displayName(l: string, inLang: string): string {
  try {
    return new Intl.DisplayNames([inLang], { type: "language" }).of(l) ?? l.toUpperCase();
  } catch {
    // A runtime without the API, or a tag it refuses to parse.
    return l.toUpperCase();
  }
}

class LangState {
  /** The **content** language: which names a list emits, and what the 🌐 picker
   *  sets. Neutral topics ignore it. */
  current = $state("en");

  /** The **interface** preference: AUTO, or a language with a dictionary. Stored
   *  separately from the content language — the whole point is that they differ. */
  uiPref = $state(AUTO);

  /** What the browser asked for at startup, kept for AUTO to fall back on. */
  #browser = "";

  /** Languages the picker offers — the app's curated set (see locale/), not
   *  derived from topics: a topic missing the selected language falls back to en. */
  readonly available: string[] = CONTENT_LANGS;

  /** The language the chrome actually renders in.
   *
   *  AUTO is *not* simply "follow the picker": the picker offers languages we have
   *  no dictionary for, and a German reader choosing Japanese lists asked for
   *  Japanese names, not an English interface. So the content language is tried
   *  first, then whatever the browser wanted, then English. */
  readonly uiLang: string = $derived(
    this.uiPref !== AUTO && UI_LANGS.includes(this.uiPref)
      ? this.uiPref
      : (matchTag(this.current, UI_LANGS) ??
        (this.#browser ? matchTag(this.#browser, UI_LANGS) : undefined) ??
        FALLBACK_LANG),
  );

  /** UI-chrome strings for the interface language. */
  readonly ui: UIStrings = $derived(strings(this.uiLang));

  /** A language in its own language — what the picker lists. */
  name(l: string): string {
    return displayName(l, l);
  }

  /** A language in the interface language — what a sentence about it says. */
  nameInUi(l: string): string {
    return displayName(l, this.uiLang);
  }

  /** Resolve the startup languages: stored → browser → en, the stored and browser
   *  tags matched rather than compared, so `zh-CN` finds Simplified Chinese. */
  init(): void {
    this.#browser = navigator.language ?? "";
    const stored = read(STORAGE_KEY);
    this.current =
      [stored, this.#browser, FALLBACK_LANG]
        .map((l) => (l ? matchTag(l, this.available) : undefined))
        .find((l) => l !== undefined) ??
      this.available[0] ??
      FALLBACK_LANG;
    const ui = read(UI_STORAGE_KEY);
    this.uiPref = ui && (ui === AUTO || UI_LANGS.includes(ui)) ? ui : AUTO;
  }

  /** Switch languages. Topic files carry every language inline, so nothing is
   *  refetched — the derived counts and output re-resolve each entry against the
   *  new language, and the id-keyed selection stays put. */
  set(l: string): void {
    if (l === this.current) return;
    this.current = l;
    write(STORAGE_KEY, l);
  }

  /** Pin the interface to one language, or hand it back to AUTO. */
  setUiPref(l: string): void {
    this.uiPref = l;
    write(UI_STORAGE_KEY, l);
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
function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, l: string): void {
  try {
    localStorage.setItem(key, l);
  } catch {
    /* storage unavailable — the choice just won't survive a reload */
  }
}

export const lang = new LangState();
