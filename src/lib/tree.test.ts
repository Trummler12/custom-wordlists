import { describe, expect, it } from "vitest";
import { ancestorPaths, buildTree, catDepth, liftControls, mergeGroups, pruneTree, synthesizeTopics, titleCase } from "./tree";
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

  it("skips the first skipInherit levels, merging only further up", () => {
    const seasons = [
      leaf("sports/olympia/summer", "sports", 2, { skipInherit: 1 }),
      leaf("sports/olympia/winter", "sports", 2, { skipInherit: 1 }),
    ];
    const synths = synthesizeTopics(seasons);
    expect(synths.map((s) => s.category)).toEqual(["sports"]);
    expect(synths[0].contributors).toEqual(["summer-sports", "winter-sports"]);
  });

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

  it("is as unfinished as its least finished member", () => {
    const [complete] = synthesizeTopics(countries);
    expect(complete.incompleteTopic).toBeUndefined();
    expect(complete.plannedTopic).toBeUndefined();

    const [incomplete] = synthesizeTopics([...countries.slice(1), { ...countries[0], incompleteTopic: true }]);
    expect(incomplete.incompleteTopic).toBe(true);
    expect(incomplete.plannedTopic).toBeUndefined();

    const [planned] = synthesizeTopics([
      { ...countries[0], incompleteTopic: true },
      { ...countries[1], plannedTopic: true },
      countries[2],
    ]);
    expect(planned.plannedTopic).toBe(true);
    expect(planned.incompleteTopic).toBeUndefined();
  });

  it("carries the dataOrigin its members share, and none where they differ", () => {
    const wd = countries.map((c) => ({ ...c, dataOrigin: "Wikidata" }));
    expect(synthesizeTopics(wd)[0].dataOrigin).toBe("Wikidata");
    const lists = countries.map((c) => ({ ...c, dataOrigin: ["Wikidata", "Wikipedia"] }));
    expect(synthesizeTopics(lists)[0].dataOrigin).toEqual(["Wikidata", "Wikipedia"]);
    expect(synthesizeTopics([...wd.slice(1), { ...wd[0], dataOrigin: "PokéAPI" }])[0].dataOrigin).toBeUndefined();
    expect(synthesizeTopics([...wd.slice(1), countries[0]])[0].dataOrigin).toBeUndefined();
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

  it("sums the unknown counts and unites the rule summaries across contributors", () => {
    const src = (
      tid: string,
      unknownByTier: number[],
      summary: Record<string, { count: number; names: string[] }>,
    ): { tid: string; group: Group } => ({
      tid,
      group: { id: tid, title: "Countries", tiers: [[]], unknownByTier, omissionSummary: summary },
    });
    const merged = mergeGroups(synth, [
      src("europe", [1, 0], { "breakaway-states": { count: 1, names: ["Transnistria"] } }),
      src("asia", [2, 1], { "breakaway-states": { count: 1, names: ["Abkhazia"] } }),
    ]);
    expect(merged.unknownByTier).toEqual([3, 1]);
    expect(merged.omissionSummary?.["breakaway-states"]).toEqual({
      count: 2,
      names: ["Transnistria", "Abkhazia"],
    });
  });
});

describe("pruneTree", () => {
  const root = buildTree([
    topic("heroes", "comics/dc"),
    topic("villains", "comics/dc"),
    topic("south-park", "animation/south-park"),
    topic("spongebob", "animation/spongebob"),
    topic("loose", ""),
  ]);
  const ids = (ts: TopicSummary[]) => ts.map((t) => t.id);
  const hiding = (...hidden: string[]) => (t: TopicSummary) => !hidden.includes(t.id);

  it("keeps everything when every topic is shown", () => {
    const pruned = pruneTree(root, () => true);
    expect(ids(pruned.all)).toEqual(ids(root.all));
    expect(pruned.children.map((c) => c.path)).toEqual(["comics", "animation"]);
  });

  it("drops a category once nothing below it is shown", () => {
    const animation = pruneTree(root, hiding("spongebob")).children[1];
    expect(animation.children.map((c) => c.path)).toEqual(["animation/south-park"]);
    expect(ids(animation.all)).toEqual(["south-park"]);
  });

  it("keeps a top-level category even when it is empty", () => {
    const comics = pruneTree(root, hiding("heroes", "villains")).children[0];
    expect(comics.path).toBe("comics");
    expect(comics.children).toEqual([]);
    expect(comics.all).toEqual([]);
  });

  it("filters the root's own topics and refills its `all`", () => {
    const pruned = pruneTree(root, hiding("loose", "spongebob"));
    expect(pruned.topics).toEqual([]);
    expect(ids(pruned.all)).toEqual(["heroes", "villains", "south-park"]);
  });

  it("hands back the branches nothing was taken from", () => {
    const pruned = pruneTree(root, hiding("spongebob"));
    expect(pruned.children[0]).toBe(root.children[0]); // comics, untouched
    expect(pruned.children[1]).not.toBe(root.children[1]); // animation lost a topic
    expect(pruned.children[1].children[0]).toBe(root.children[1].children[0]); // south-park
    expect(pruneTree(root, () => true)).toBe(root);
  });

  it("leaves the tree it was given untouched", () => {
    pruneTree(root, () => false);
    expect(root.all).toHaveLength(5);
  });
});

describe("liftControls", () => {
  const carrying = (category: string, stem: string, icons: string[], extra: Partial<TopicSummary> = {}) =>
    leaf(category, stem, 1, {
      controls: Object.fromEntries(icons.map((i) => [i, [{ id: "rule" }]])),
      ...extra,
    });

  it("lifts a control to the deepest category holding all its carriers", () => {
    expect(
      liftControls([
        carrying("geography/human/africa", "countries", ["geoguessr", "sovereignty"]),
        carrying("geography/human/africa", "capitals", ["geoguessr"]),
        carrying("geography/human/asia", "countries", ["geoguessr", "sovereignty"]),
      ]),
    ).toEqual({ "geography/human": ["geoguessr", "sovereignty"] });
  });

  it("lifts higher once a carrier appears in another branch", () => {
    expect(
      liftControls([
        carrying("geography/human/africa", "countries", ["geoguessr"]),
        carrying("geography/human/asia", "countries", ["geoguessr"]),
        carrying("geography/physical", "rivers", ["geoguessr"]),
      ]),
    ).toEqual({ geography: ["geoguessr"] });
  });

  it("keeps two carriers in one category on that category", () => {
    expect(
      liftControls([
        carrying("geography/human/africa", "countries", ["geoguessr"]),
        carrying("geography/human/africa", "capitals", ["geoguessr"]),
      ]),
    ).toEqual({ "geography/human/africa": ["geoguessr"] });
  });

  it("lifts nothing for a single carrier, across top-level categories, or for planned ones", () => {
    expect(liftControls([carrying("geography/human", "languages", ["language-type"])])).toEqual({});
    expect(
      liftControls([carrying("geography", "countries", ["geoguessr"]), carrying("sports", "venues", ["geoguessr"])]),
    ).toEqual({});
    expect(
      liftControls([
        carrying("geography/human/africa", "countries", ["geoguessr"]),
        carrying("geography/physical", "rivers", ["geoguessr"], { plannedTopic: true }),
      ]),
    ).toEqual({});
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
