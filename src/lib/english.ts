// Which lists may be switched to their English entries, and where the control for
// doing so lives. The pure half of the per-topic content language.

import { langSupport } from "./languages";
import { ancestorPaths } from "./tree";
import type { CategoryMeta, TopicSummary } from "./types";

/** Whether this topic may be switched to English while `code` is selected. Two
 *  cases can't: English itself, and a list that already says its names in this
 *  language are the English ones. A list that hasn't declared its languages yet
 *  can — being undeclared says nothing about whether it has its own names. */
export function canForceEnglish(topic: TopicSummary, code: string): boolean {
  return code !== "en" && langSupport(topic, code) !== "english";
}

/** The category whose row carries the shared toggle for this topic, or null when
 *  no ancestor declares one — then the topic answers only to its own. The nearest
 *  declaring ancestor wins, so a subtree can take its lists back from a broader
 *  category by declaring the field itself. */
export function englishControl(
  topic: TopicSummary,
  categories: Record<string, CategoryMeta>,
): string | null {
  for (const path of ancestorPaths(topic.category)) {
    if (categories[path]?.sharedEnglishToggle) return path;
  }
  return null;
}

/** The lists one category's shared toggle governs: those descendants it is the
 *  nearest declaring ancestor of, and that switching would actually affect. */
export function sharedEnglishTopics(
  categoryPath: string,
  descendants: TopicSummary[],
  categories: Record<string, CategoryMeta>,
  code: string,
): TopicSummary[] {
  return descendants.filter(
    (t) => canForceEnglish(t, code) && englishControl(t, categories) === categoryPath,
  );
}
