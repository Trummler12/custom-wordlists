// Which lists may be switched to their English entries, and where the control for
// doing so lives. The pure half of the per-topic content language.

import { langSupport } from "./languages";
import { ancestorPaths } from "./tree";
import type { CategoryMeta, TopicSummary } from "./types";

/** Whether switching this topic to English would change anything in `code`.
 *  It wouldn't with English already selected, nor for a list whose names in this
 *  language are the English ones — which is exactly what `usesEnglishFor` says. */
export function canForceEnglish(topic: TopicSummary, code: string): boolean {
  return code !== "en" && langSupport(topic, code) === "declared";
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
