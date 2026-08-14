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

/** The language a tag belongs to, without script or region — what a question
 *  about *support* asks, where a question about *rendering* wants the whole tag.
 *  A list carrying Japanese supports Japanese whether or not it has romaji. */
export function baseTag(tag: string): string {
  return tag.split("-")[0];
}

/** A display name split at its parenthesis: `Chinesisch (vereinfacht)` becomes
 *  `["Chinesisch", " (vereinfacht)"]`, and a name without one keeps an empty tail.
 *
 *  For the locales that put the language name *inside* a sentence rather than in
 *  front of one. German declines it — "auch im Koreanischen" — and a qualifier in
 *  brackets can't take the ending, so the two halves have to be handed over
 *  separately for the locale to reassemble. */
export function splitName(name: string): [string, string] {
  const at = name.indexOf(" (");
  return at === -1 ? [name, ""] : [name.slice(0, at), name.slice(at)];
}

/** The short badge for a tag in a list of them: the base language, and one letter
 *  more only where that wouldn't be unique.
 *
 *  `DE` beside `ZH-HANS` is a badge beside a spelled-out tag; `ZHS` and `ZHT` sit
 *  in the same column as the rest and still tell the two apart. The full tag is
 *  worth putting on the hover of whatever this labels. */
export function tagChip(tag: string, available: readonly string[]): string {
  const [base, sub] = tag.split("-");
  const rivals = available
    .filter((t) => t !== tag && t.split("-")[0] === base)
    .map((t) => t.split("-")[1] ?? "");
  if (rivals.length === 0 || !sub) return base.toUpperCase();
  // The *distinguishing* letter, not the first one: `Hans` and `Hant` agree for
  // three characters, and `ZHH` twice over would be worse than no badge at all.
  let i = 0;
  while (i < sub.length - 1 && rivals.some((r) => r[i] === sub[i])) i++;
  return `${base}${sub[i]}`.toUpperCase();
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

  // A romanization asks for the language in Latin script, and an entry that has
  // no romaji still has one name written that way: its English base. So this
  // matches nothing and lets the caller fall through to `en` — which is also what
  // an absent key has always meant. Falling back to the kana instead would hand
  // ヒトカゲ to someone who asked for Hitokage.
  if (subs.some((s) => s.toLowerCase() === "latn")) return undefined;

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
