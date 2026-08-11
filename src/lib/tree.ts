// The category tree the topic list renders, built from the flat manifest.

import type { TopicSummary } from "./types";

/** One level of the category tree. Renders as a single collapsible node showing
 *  only its own path segment, so "gaming/pokemon/pokemon" nests inside
 *  "gaming/pokemon" instead of repeating the whole path as a flat header. */
export interface CatNode {
  name: string;
  path: string;
  topics: TopicSummary[];
  children: CatNode[];
  /** All topics under this node (own + descendants); filled once per tree build,
   *  so category rows don't re-flatten their subtree on every render. */
  all: TopicSummary[];
}

const fillAll = (node: CatNode): TopicSummary[] =>
  (node.all = node.topics.concat(...node.children.map(fillAll)));

/** Build the nested tree from each topic's `category` path. Topics keep manifest
 *  order; categories appear in first-seen order. */
export function buildTree(topics: TopicSummary[]): CatNode {
  const root: CatNode = { name: "", path: "", topics: [], children: [], all: [] };
  for (const t of topics) {
    let node = root;
    let path = "";
    for (const seg of t.category.split("/").filter(Boolean)) {
      path = path ? `${path}/${seg}` : seg;
      let child = node.children.find((c) => c.name === seg);
      if (!child) {
        child = { name: seg, path, topics: [], children: [], all: [] };
        node.children.push(child);
      }
      node = child;
    }
    node.topics.push(t);
  }
  fillAll(root);
  return root;
}

/** A category path's ancestors, deepest first: "a/b/c" → ["a/b/c","a/b","a"]. In
 *  that order because the features that walk it want the nearest declaring
 *  ancestor, not the outermost. */
export function ancestorPaths(category: string): string[] {
  const segs = category.split("/").filter(Boolean);
  const paths: string[] = [];
  for (let i = segs.length; i > 0; i--) paths.push(segs.slice(0, i).join("/"));
  return paths;
}

/** Depth of a node below the root: top-level categories are 0. */
export const catDepth = (node: CatNode): number => node.path.split("/").length - 1;

/** Fallback display name for a category with no `_category.json` title. */
export const titleCase = (seg: string): string =>
  seg
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
