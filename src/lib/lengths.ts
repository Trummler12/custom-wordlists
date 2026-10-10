// How long a name may be: the reader's character limits, and the separate ones for
// the languages whose names spend a character per syllable. Pure; the store that
// holds the limits is state/settings, the rules that apply them are the reserved
// `<` / `>` omissions (lib/omitted).

export interface Limits {
  min: number;
  max: number;
}

/** 32 is skribbl.io's own cap; below 3 a name is rarely worth drawing. */
export const DEFAULT_LIMITS: Limits = { min: 3, max: 32 };

/** For Chinese, Japanese and Korean, where two characters already make a full word
 *  (珍珠, 진주). With the Latin minimum, hundreds of their names would drop out. */
export const DEFAULT_SCRIPT_LIMITS: Limits = { min: 2, max: 32 };

/** The languages with limits of their own. Exact tags: `ja-Latn` (romaji) is Latin
 *  text and follows the general limits. */
export const SCRIPT_LANGS: readonly string[] = ["ja", "ko", "zh-Hans", "zh-Hant"];

const SYLLABIC = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

/** What decides one name's fate: the limits, and whether each rule is in force. */
export interface LengthRules {
  limits: Limits;
  /** The list language's own limits, where it has some. */
  script?: Limits;
  /** Whether names under / over the limits are left out. */
  short: boolean;
  long: boolean;
}

/** The limits one name answers to. Decided by its characters as well as its list:
 *  a Japanese list's romaji and its English fallbacks are Latin text, and by its
 *  characters alone 中国 can't be told Chinese from Japanese — so the list language
 *  picks the row, the name's script whether it applies. */
export function limitsOf(form: string, rules: Pick<LengthRules, "limits" | "script">): Limits {
  return rules.script && SYLLABIC.test(form) ? rules.script : rules.limits;
}

/** Whether a name is under or over its limits, or neither. Counted the way the
 *  game counts, in string length. */
export function lengthClass(form: string, limits: Limits): "short" | "long" | null {
  if (form.length < limits.min) return "short";
  if (form.length > limits.max) return "long";
  return null;
}

/** Whether a name survives the rules in force. */
export function keepsForm(form: string, rules: LengthRules): boolean {
  const cls = lengthClass(form, limitsOf(form, rules));
  return !((cls === "short" && rules.short) || (cls === "long" && rules.long));
}
