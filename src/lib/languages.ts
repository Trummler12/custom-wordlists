// How well a topic serves a given language. `languages` is the whole answer to
// "is this list usable in X"; `usesEnglishFor` names the ones inside it whose
// entries simply are the English names, so the UI can say that rather than leave a
// reader wondering why a German list is full of English words.

import type { TopicSummary } from "./types";

/** Declared: the list carries this language. English: it carries English, and says
 *  so is deliberate. Undeclared: nobody has confirmed the language either way. */
export type LangSupport = "declared" | "english" | "undeclared";

export function langSupport(t: TopicSummary, code: string): LangSupport {
  const english = t.usesEnglishFor ?? [];
  if (english.includes(code)) return "english";
  if (t.languages?.includes(code)) return "declared";
  // "*" stands for every language `languages` doesn't name, so it only gets asked
  // after that list has had its say.
  return english.includes("*") ? "english" : "undeclared";
}

// --- Matching a wanted tag against the tags that exist ------------------------
// A tag someone asks for is not always a tag we have. The browser says "zh-CN",
// the data says "zh-Hans"; a stored preference may name a tag we have since
// dropped. Everything that resolves a language goes through `matchTag`, so the
// answer is the same for an entry, a picker and a stored choice.

/** Region subtags whose script can't be derived from the tag itself. Chinese is
 *  the whole list: every other language we carry writes one way. */
const ALIASES: Record<string, string> = {
  "zh-cn": "zh-Hans",
  "zh-sg": "zh-Hans",
  "zh-my": "zh-Hans",
  "zh-tw": "zh-Hant",
  "zh-hk": "zh-Hant",
  "zh-mo": "zh-Hant",
};

/** A four-letter subtag is a script (`Latn`, `Hans`); two letters or three digits
 *  is a region (`CH`, `419`). */
function isScript(sub: string): boolean {
  return /^[A-Za-z]{4}$/.test(sub);
}

/** The closest tag in `available` for the one someone asked for, or undefined.
 *  First match in the given order wins, so the caller's order is the preference.
 *
 *  Region subtags may be dropped, script subtags may not: `de-CH` is German
 *  spelled slightly differently and `de` will do, while `ja-Latn` is Japanese
 *  written in a different alphabet and `ja` will not — a reader who asked for
 *  romaji and got kanji got the wrong answer, not an approximate one. Widening
 *  goes the other way for the same reason: `zh` may land on `zh-Hans` because a
 *  bare `zh` expresses no preference, but `ja` never lands on `ja-Latn`. */
export function matchTag(wanted: string, available: readonly string[]): string | undefined {
  const lower = wanted.toLowerCase();
  const exact = available.find((t) => t.toLowerCase() === lower);
  if (exact) return exact;

  const alias = ALIASES[lower];
  if (alias) {
    const hit = available.find((t) => t.toLowerCase() === alias.toLowerCase());
    if (hit) return hit;
  }

  const parts = wanted.split("-");
  const base = parts[0].toLowerCase();
  const subs = parts.slice(1);

  // `de-CH` → `de`, `es-MX` → `es`. Only regions are dropped, and only when the
  // tag carries no script of its own.
  if (subs.length > 0 && !subs.some(isScript)) {
    const hit = available.find((t) => t.toLowerCase() === base);
    if (hit) return hit;
  }

  // `zh` → `zh-Hans`: a tag with nothing after the language asks for the language
  // however it is written, so the first one we have is an answer — except a
  // romanization, which is the language written in an alphabet that isn't its
  // own. `ja-Latn` is something a reader opts into, never something they land on.
  // A tag that names a region is in the same position once its region is spent:
  // `zh-CN` with only Traditional to hand is still better served by Chinese.
  if (!subs.some(isScript)) {
    return available.find(
      (t) => t.toLowerCase().startsWith(`${base}-`) && !t.toLowerCase().endsWith("-latn"),
    );
  }
  return undefined;
}
