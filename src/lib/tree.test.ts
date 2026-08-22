import { describe, expect, it } from "vitest";
import { ancestorPaths, buildTree, catDepth, mergeGroups, synthesizeTopics, titleCase } from "./tree";
import type { Group, TopicSummary } from "./types";

const topic = (id: string, category: string): TopicSummary => ({
  id,
  title: id,
  icon: null,
  category,
  path: `${id}.json`,
  wordCount: 1,
});

/** A leaf whose path reflects its folder, so `synthesizeTopics` can read its
 *  stem — the family key a set of `inheritsUpwards` leaves share. */
const leaf = (
  category: string,
  stem: string,
  inheritsUpwards: number,
  extra: Partial<TopicSummary> = {},
): TopicSummary => ({
  id: `${category.split("/").pop()}-${stem}`,
  title: stem,
  icon: "🗺️",
  category,
  path: `${category}/${stem}.json`,
  inheritsUpwards,
  wordCount: 1,
  ...extra,
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

describe("synthesizeTopics", () => {
  const countries = [
    leaf("geography/human/africa", "countries", 1, { languages: ["en", "de", "fr"] }),
    leaf("geography/human/asia", "countries", 1, { languages: ["en", "de", "ja"] }),
    leaf("geography/human/europe", "countries", 1, { languages: ["en", "de", "es"] }),
  ];

  it("merges same-named leaves into one topic at the meeting level", () => {
    const [synth, ...rest] = synthesizeTopics(countries);
    expect(rest).toHaveLength(0);
    expect(synth.id).toBe("geography-human-countries");
    expect(synth.category).toBe("geography/human");
    expect(synth.path).toBe(""); // no file of its own
    expect(synth.contributors).toEqual([
      "africa-countries",
      "asia-countries",
      "europe-countries",
    ]);
    expect(synth.icon).toBe("🗺️");
  });

  it("gives the synthesized topic only the languages every member has", () => {
    const [synth] = synthesizeTopics(countries);
    expect(synth.languages).toEqual(["en", "de"]); // fr/ja/es each missing from some member
  });

  it("keeps different file stems apart", () => {
    const synths = synthesizeTopics([
      leaf("geography/human/africa", "countries", 1),
      leaf("geography/human/africa", "capitals", 1),
      leaf("geography/human/asia", "countries", 1),
      leaf("geography/human/asia", "capitals", 1),
    ]);
    expect(synths.map((s) => s.id).sort()).toEqual([
      "geography-human-capitals",
      "geography-human-countries",
    ]);
  });

  it("synthesizes at every level up to `inheritsUpwards`", () => {
    // Cities: a per-country leaf that merges per continent AND globally.
    const synths = synthesizeTopics([
      leaf("geography/human/asia/japan", "cities", 2),
      leaf("geography/human/asia/india", "cities", 2),
      leaf("geography/human/europe/france", "cities", 2),
    ]);
    const byId = Object.fromEntries(synths.map((s) => [s.id, s]));
    // per continent (one level up)
    expect(byId["geography-human-asia-cities"].contributors).toEqual([
      "japan-cities",
      "india-cities",
    ]);
    expect(byId["geography-human-europe-cities"].contributors).toEqual(["france-cities"]);
    // globally (two levels up) — all three
    expect(byId["geography-human-cities"].contributors).toEqual([
      "japan-cities",
      "india-cities",
      "france-cities",
    ]);
  });

  it("is nothing for topics that never inherit upward", () => {
    expect(synthesizeTopics([topic("languages", "geography/human")])).toEqual([]);
  });

  it("hangs the synthesized topic in the tree beside its contributors' parent", () => {
    const synths = synthesizeTopics(countries);
    const root = buildTree([topic("languages", "geography/human"), ...countries, ...synths]);
    const human = root.children[0].children[0]; // geography → human
    expect(human.path).toBe("geography/human");
    expect(human.topics.map((t) => t.id)).toEqual(["languages", "geography-human-countries"]);
    // the merged topic is a sibling of `languages`, not a child of a continent
    expect(human.children.map((c) => c.name)).toEqual(["africa", "asia", "europe"]);
  });
});

describe("mergeGroups", () => {
  const synth = leaf("geography/human", "countries", 1);
  const tier = (...names: string[]) => names.map((en) => ({ en }));
  const source = (tid: string, tier0: string[], tier1: string[]): { tid: string; group: Group } => ({
    tid,
    group: {
      id: tid,
      title: "Countries",
      defaultNames: "short",
      tierConditions: ["100 million or more", "more than 0"],
      tiers: [tier(...tier0), tier(...tier1)],
    },
  });

  it("assembles tiers band by band and deduplicates transcontinentals", () => {
    const merged = mergeGroups(synth, [
      source("europe", ["Russia"], ["France"]),
      source("asia", ["Russia", "China"], ["Japan"]),
    ]);
    // Russia, in tier 0 of both, appears once; order is first-seen.
    expect(merged.tiers?.[0].map((e) => (e as { en: string }).en)).toEqual([
      "Russia",
      "China",
    ]);
    expect(merged.tiers?.[1].map((e) => (e as { en: string }).en)).toEqual(["France", "Japan"]);
  });

  it("keeps the contributor groups as provenance and copies the boundary metadata", () => {
    const sources = [source("europe", ["Russia"], []), source("asia", ["China"], [])];
    const merged = mergeGroups(synth, sources);
    expect(merged.sources).toBe(sources);
    expect(merged.defaultNames).toBe("short");
    expect(merged.tierConditions).toEqual(["100 million or more", "more than 0"]);
  });

  it("deduplicates the omission rules by id, so one row stands for the whole family", () => {
    const withRules = (
      tid: string,
      omitted: { id: string; match: string[] }[],
      omittable: { id: string; match: string[] }[],
    ): { tid: string; group: Group } => ({
      tid,
      group: {
        id: tid,
        title: "Countries",
        omitted: omitted.map((r) => ({ ...r, reason: "left out" })),
        omittable: omittable.map((r) => ({ ...r, reason: "offered" })),
        tiers: [[]],
      },
    });
    const merged = mergeGroups(synth, [
      // Each continent writes the same rule ids with its own territories.
      withRules("europe", [{ id: "breakaway-states", match: ["Transnistria"] }], [{ id: "contested-states", match: ["Kosovo"] }]),
      withRules("asia", [{ id: "breakaway-states", match: ["Abkhazia"] }], [{ id: "contested-states", match: ["Taiwan"] }]),
      withRules("africa", [{ id: "breakaway-states", match: ["Somaliland"] }], []),
    ]);
    expect(merged.omitted?.map((r) => r.id)).toEqual(["breakaway-states"]);
    expect(merged.omittable?.map((r) => r.id)).toEqual(["contested-states"]);
    // First occurrence wins; the per-continent matches stay reachable via `sources`.
    expect((merged.omitted?.[0] as { match: string[] }).match).toEqual(["Transnistria"]);
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
