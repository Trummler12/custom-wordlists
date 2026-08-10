// Where a topic's fame ruler starts hidden, and which node governs it — the pure
// half of the ruler-visibility feature (state and UI build on this).
//
// The model in one rule: a node *declaring* `hideRulersByDefault` (a category via
// its `_category.json`, or a topic) is a control boundary. A topic's ruler is
// governed by the nearest such node walking up from the topic itself; that node's
// value is the default hidden state. Presence — not value — is what matters, so a
// redeclaration equal to an ancestor's still starts a fresh boundary (its toggle
// is independent), and a `false` decouples a topic to "shown, on its own toggle".
// A topic with no declaration anywhere on its path has no control at all: its
// ruler is simply always shown, exactly as before this feature.

import { ancestorPaths } from "./tree";
import type { CategoryMeta, TopicSummary } from "./types";

/** The node that governs a topic's ruler visibility: a category (by its path) or
 *  the topic itself. Topics sharing a control root form one toggle group; the
 *  category kind is also where that group's toggle is drawn. */
export type ControlRoot =
  | { kind: "category"; path: string }
  | { kind: "topic"; id: string };

/** The ruler control governing a topic, or null when nothing on its path declares
 *  `hideRulersByDefault` (no toggle; the ruler is always shown). `hidden` is the
 *  declared default at the boundary. The topic's own field wins over any ancestor;
 *  among categories the deepest wins. */
export function rulerControl(
  topic: TopicSummary,
  categories: Record<string, CategoryMeta>,
): { root: ControlRoot; hidden: boolean } | null {
  if (typeof topic.hideRulersByDefault === "boolean") {
    return { root: { kind: "topic", id: topic.id }, hidden: topic.hideRulersByDefault };
  }
  for (const path of ancestorPaths(topic.category)) {
    const value = categories[path]?.hideRulersByDefault;
    if (typeof value === "boolean") return { root: { kind: "category", path }, hidden: value };
  }
  return null;
}

/** Whether a topic starts with its ruler hidden — the declared default at its
 *  boundary, or false when it has no control. */
export function rulerHiddenByDefault(
  topic: TopicSummary,
  categories: Record<string, CategoryMeta>,
): boolean {
  return rulerControl(topic, categories)?.hidden ?? false;
}

/** The topics a category-kind control root governs: those among `descendants`
 *  whose nearest declaring node is this very category. A deeper boundary shadows
 *  it, so those topics belong to the deeper root and are excluded here — which is
 *  what keeps a decoupled subtree out of this category's toggle and its roll-up. */
export function controlledTopics(
  categoryPath: string,
  descendants: TopicSummary[],
  categories: Record<string, CategoryMeta>,
): TopicSummary[] {
  return descendants.filter((topic) => {
    const control = rulerControl(topic, categories);
    return control?.root.kind === "category" && control.root.path === categoryPath;
  });
}
