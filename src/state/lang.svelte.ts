// The selected UI language, and everything that follows from it.
//
// Exported as a single instance rather than as loose `let`s: a `$state` export
// read across a module boundary as a plain value loses its reactivity, so every
// store in state/ hands out an object and callers reach through it (`lang.current`,
// not `lang`). The same rule is why `ui` is a `$derived` field and not a plain one.

import { CONTENT_LANGS, FALLBACK_LANG, strings, UI_LANGS, type UIStrings } from "../locale";
import { VARIANTS, variantFor, type Variant } from "../locale/variants";
import { matchTag } from "../lib/languages";
import type { TopicSummary } from "../lib/types";

const STORAGE_KEY = "wordlists:lang";
const UI_STORAGE_KEY = "wordlists:uiLang";
const VARIANT_STORAGE_KEY = "wordlists:variants";

/** The keys the reader's language choices live under — the content language and the
 *  interface language. Grouped and exported so a settings reset can look them up by
 *  name rather than hard-code the strings (see `PRESERVED_KEYS` in `state/reset`). */
export const LANGUAGE_STORAGE_KEYS = [STORAGE_KEY, UI_STORAGE_KEY] as const;

/** The interface follows the list language unless told otherwise. */
export const AUTO = "auto";

/** One formatter per locale that has been asked for, `null` where the runtime
 *  refused to build one. Constructing an `Intl.DisplayNames` costs roughly nine
 *  times what asking an existing one does, and every topic row asks on every
 *  render — for the language in its ⚠️/ℹ️ marker — as does every 🧹 panel.
 *
 *  Bounded by the interface languages, so a handful of entries at most. */
const formatters = new Map<string, Intl.DisplayNames | null>();

/** A language's name, in `inLang`. `Intl.DisplayNames` is generated from the same
 *  CLDR data the language lists are, so it agrees with them for free and needs no
 *  table of our own — pass a language its own code for the endonym. */
function displayName(l: string, inLang: string): string {
  let f = formatters.get(inLang);
  if (f === undefined) {
    try {
      f = new Intl.DisplayNames([inLang], { type: "language" });
    } catch {
      // A runtime without the API, or a locale it refuses to parse.
      f = null;
    }
    formatters.set(inLang, f);
  }
  try {
    return f?.of(l) ?? l.toUpperCase();
  } catch {
    // `of` throws on its own for a malformed tag, which a stored preference can be.
    return l.toUpperCase();
  }
}

/** Where one list's answer about one variant is stored. Both halves, since a list
 *  can declare more than one and they are separate questions. */
function overrideKey(v: Variant, tid: string): string {
  return `${v.id}|${tid}`;
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
    for (const l of (read(VARIANT_STORAGE_KEY) ?? "").split(",").filter(Boolean)) {
      if (variantFor(l)) this.variants[l] = true;
    }
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

  /** Languages switched to their second way of being written, by language tag.
   *  Stored: unlike the English toggles this is a lasting preference — someone who
   *  reads romaji reads it every visit. */
  variants = $state<Record<string, boolean>>({});

  /** Lists told to deviate from the global choice, by variant *and* topic id. Only
   *  meaningful for a variant declared `perTopic`.
   *
   *  By variant as well, because one list can declare two: items and moves carry
   *  both `es-419` and `ja-Latn`, so a key on the topic alone let a reader's Spanish
   *  decision govern their romaji — and romaji, having no per-list control, offered
   *  no way to take it back.
   *
   *  Cleared for a variant whenever its global switch flips — see `toggleVariant`,
   *  which is what gives a list a way back to following the switch. */
  variantByTopic = $state<Record<string, boolean>>({});

  /** What each topic declares in `languages`, mirrored from the manifest by
   *  `topics` at load — this store cannot ask for it, since that one imports this
   *  one. Used for one question: does a variant apply to this list at all. */
  declaredLangs = $state<Record<string, readonly string[]>>({});

  /** Topics whose romaji are transliterated at render time rather than stored,
   *  mirrored the same way. */
  derivedRomaji = $state<Record<string, boolean>>({});

  /** Whether this list's names are being transliterated right now: it says its
   *  romaji are derived, and the reader has asked for romaji. Everything that
   *  renders an entry passes this along — see `resolveStr` in lib/words.
   *
   *  The tag rather than "a variant is on": the two lists with derived romaji also
   *  declare `es-419`, so asking the looser question calls Latin American Spanish a
   *  romanization. `contentLang` has already applied the per-list gate, so the tag
   *  it returns is the whole answer. */
  derivesRomaji(tid: string): boolean {
    return !!this.derivedRomaji[tid] && this.contentLang(tid).toLowerCase().endsWith("-latn");
  }

  variantOn(l: string): boolean {
    return !!variantFor(l) && !!this.variants[l];
  }
  /** Whether this list uses the variant: its own answer if it has one, the global
   *  one otherwise.
   *
   *  A list that doesn't declare the variant tag never uses it, whatever the
   *  switch says. That gate is what lets an absent key mean "the same as English"
   *  — the items carry no romaji at all, and without it every one of them would
   *  resolve to its English name the moment romaji was switched on. */
  variantOnFor(tid: string): boolean {
    const v = variantFor(this.current);
    if (!v || !(this.declaredLangs[tid] ?? []).includes(v.tag)) return false;
    // A variant with no per-list control can hold no per-list answer. Reading one
    // anyway is the other half of how a stale choice reached the wrong variant.
    if (!v.perTopic) return this.variantOn(this.current);
    return this.variantByTopic[overrideKey(v, tid)] ?? this.variantOn(this.current);
  }
  toggleVariantFor(tid: string): void {
    const v = variantFor(this.current);
    if (!v?.perTopic) return;
    this.variantByTopic[overrideKey(v, tid)] = !this.variantOnFor(tid);
  }
  /** Flip the variant for every list at once — and take back the lists that had
   *  said otherwise.
   *
   *  A per-list 🌎 stores an answer against the topic, and `variantOnFor` prefers
   *  it to the global one, so without this a list that once disagreed disagrees
   *  forever: a checkbox has two states and none of them says "follow the switch
   *  again". Clearing the overrides is that missing state, expressed through the
   *  control that already exists rather than a third one nobody would find. */
  toggleVariant(l: string): void {
    this.variants[l] = !this.variants[l];
    const v = variantFor(l);
    if (v) {
      const mine = `${v.id}|`;
      // Only this variant's keys: a list can hold an answer about each, and
      // switching romaji is no reason to forget what it said about Spanish.
      for (const k of Object.keys(this.variantByTopic)) {
        if (k.startsWith(mine)) delete this.variantByTopic[k];
      }
    }
    write(VARIANT_STORAGE_KEY, Object.keys(this.variants).filter((k) => this.variants[k]).join(","));
  }

  /** The tag a list's entries resolve with: English where the topic is switched to
   *  it, the variant tag where one is on, the content language otherwise. */
  contentLang(tid: string): string {
    if (this.forceEnglish[tid]) return FALLBACK_LANG;
    return this.variantOnFor(tid) ? VARIANTS[this.current].tag : this.current;
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
