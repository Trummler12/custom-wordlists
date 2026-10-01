// Which lists may be switched to their entries in the reader's secondary language, and
// where the control for doing so lives. The pure half of the per-topic content language.

import { langSupport } from "./index";
import { ancestorPaths } from "../tree";
import type { CategoryMeta, TopicSummary } from "../types";

/** Whether this topic may be switched to `secondary` while `primary` is selected. Two
 *  cases can't: the secondary language is the primary one, and a switch to English for
 *  a list that already says its names in the primary language are the English ones. A
 *  list that hasn't declared its languages yet can — being undeclared says nothing about
 *  whether it has its own names. */
export function canForceSecondary(topic: TopicSummary, primary: string, secondary: string): boolean {
  if (primary === secondary) return false;
  return secondary !== "en" || langSupport(topic, primary) !== "english";
}

/** The category whose row carries the shared toggle for this topic, or null when
 *  no ancestor declares one — then the topic answers only to its own. The nearest
 *  declaring ancestor wins, so a subtree can take its lists back from a broader
 *  category by declaring the field itself. */
export function secondaryControl(
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
export function sharedSecondaryTopics(
  categoryPath: string,
  descendants: TopicSummary[],
  categories: Record<string, CategoryMeta>,
  primary: string,
  secondary: string,
): TopicSummary[] {
  return descendants.filter(
    (t) => canForceSecondary(t, primary, secondary) && secondaryControl(t, categories) === categoryPath,
  );
}
