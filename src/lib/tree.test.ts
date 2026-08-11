import { describe, expect, it } from "vitest";
import { ancestorPaths, buildTree, catDepth, titleCase } from "./tree";
import type { TopicSummary } from "./types";

const topic = (id: string, category: string): TopicSummary => ({
  id,
  title: id,
  icon: null,
  category,
  path: `${id}.json`,
  groupCount: 1,
  wordCount: 1,
});

describe("ancestorPaths", () => {
  it("lists every ancestor, deepest first", () => {
    expect(ancestorPaths("a/b/c")).toEqual(["a/b/c", "a/b", "a"]);
  });

  it("handles a single segment and no category at all", () => {
    expect(ancestorPaths("a")).toEqual(["a"]);
    expect(ancestorPaths("")).toEqual([]);
  });
});

describe("buildTree", () => {
  const topics = [
    topic("south-park", "animation"),
    topic("items", "gaming/pokemon"),
    topic("gen-1", "gaming/pokemon/pokemon"),
    topic("loose", ""),
  ];
  const root = buildTree(topics);

  it("puts an uncategorized topic at the root", () => {
    expect(root.topics.map((t) => t.id)).toEqual(["loose"]);
  });

  it("nests one level per path segment", () => {
    const gaming = root.children.find((c) => c.name === "gaming")!;
    const pokemon = gaming.children.find((c) => c.name === "pokemon")!;
    expect(pokemon.path).toBe("gaming/pokemon");
    expect(pokemon.topics.map((t) => t.id)).toEqual(["items"]);
    expect(pokemon.children.map((c) => c.path)).toEqual(["gaming/pokemon/pokemon"]);
  });

  it("keeps categories in first-seen order and topics in manifest order", () => {
    expect(root.children.map((c) => c.name)).toEqual(["animation", "gaming"]);
  });

  it("fills `all` with a node's own topics and every descendant's", () => {
    const gaming = root.children.find((c) => c.name === "gaming")!;
    expect(gaming.topics).toEqual([]);
    expect(gaming.all.map((t) => t.id)).toEqual(["items", "gen-1"]);
    expect(root.all).toHaveLength(4);
  });

  it("builds an empty root from no topics", () => {
    const empty = buildTree([]);
    expect(empty.all).toEqual([]);
    expect(empty.children).toEqual([]);
  });
});

describe("catDepth", () => {
  it("counts top-level categories as 0", () => {
    const root = buildTree([topic("gen-1", "gaming/pokemon/pokemon")]);
    const gaming = root.children[0];
    expect(catDepth(gaming)).toBe(0);
    expect(catDepth(gaming.children[0])).toBe(1);
    expect(catDepth(gaming.children[0].children[0])).toBe(2);
  });
});

describe("titleCase", () => {
  it("turns a kebab-case folder name into a display name", () => {
    expect(titleCase("film-tv")).toBe("Film Tv");
    expect(titleCase("gaming")).toBe("Gaming");
  });
});
