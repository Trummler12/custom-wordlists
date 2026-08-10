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
