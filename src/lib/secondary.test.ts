import { describe, expect, it } from "vitest";
import { canForceSecondary, secondaryControl, sharedSecondaryTopics } from "./secondary";
import type { CategoryMeta, TopicSummary } from "./types";

const topic = (id: string, fields: Partial<TopicSummary> = {}): TopicSummary => ({
  id,
  title: id,
  icon: null,
  category: "",
  path: `${id}.json`,
  wordCount: 1,
  ...fields,
});

describe("canForceSecondary", () => {
  it("says no while the secondary language is the selected one", () => {
    expect(canForceSecondary(topic("a", { languages: ["de", "en"] }), "en", "en")).toBe(false);
    expect(canForceSecondary(topic("a", { languages: ["de", "ja"] }), "ja", "ja")).toBe(false);
  });

  it("says no for a list whose names here already are the English ones", () => {
    const lol = topic("lol", { languages: ["de", "en"], usesEnglishFor: ["de"] });
    expect(canForceSecondary(lol, "de", "en")).toBe(false);
  });

  it("says yes for such a list when the secondary language is not English", () => {
    const lol = topic("lol", { languages: ["de", "en", "ja"], usesEnglishFor: ["de"] });
    expect(canForceSecondary(lol, "de", "ja")).toBe(true);
  });

  it("says yes for a list that has its own names", () => {
    expect(canForceSecondary(topic("a", { languages: ["de", "en"] }), "de", "en")).toBe(true);
  });

  it("says yes for an undeclared list — the field says nothing about its names", () => {
    expect(canForceSecondary(topic("a"), "de", "en")).toBe(true);
  });
});

describe("secondaryControl", () => {
  const categories: Record<string, CategoryMeta> = {
    gaming: { sharedEnglishToggle: true },
    "gaming/pokemon": {},
    "gaming/pokemon/pokemon": { sharedEnglishToggle: true },
  };

  it("finds nothing when no ancestor declares one", () => {
    expect(secondaryControl(topic("a", { category: "film-tv" }), categories)).toBeNull();
    expect(secondaryControl(topic("a", { category: "" }), categories)).toBeNull();
  });

  it("finds the declaring ancestor", () => {
    expect(secondaryControl(topic("a", { category: "gaming/pokemon" }), categories)).toBe("gaming");
  });

  it("prefers the nearest one, so a subtree can take its lists back", () => {
    const t = topic("gen-1", { category: "gaming/pokemon/pokemon" });
    expect(secondaryControl(t, categories)).toBe("gaming/pokemon/pokemon");
  });
});

describe("sharedSecondaryTopics", () => {
  const categories: Record<string, CategoryMeta> = {
    gaming: { sharedEnglishToggle: true },
    "gaming/pokemon/pokemon": { sharedEnglishToggle: true },
  };
  const gen = topic("gen-1", { category: "gaming/pokemon/pokemon", languages: ["de", "en"] });
  const items = topic("items", { category: "gaming/pokemon", languages: ["de", "en"] });
  const lol = topic("lol", {
    category: "gaming",
    languages: ["de", "en"],
    usesEnglishFor: ["de"],
  });
  const all = [gen, items, lol];

  it("governs only the descendants it is the nearest declaring ancestor of", () => {
    // The generations answer to the deeper category, not to `gaming`.
    expect(sharedSecondaryTopics("gaming", all, categories, "de", "en")).toEqual([items]);
    expect(sharedSecondaryTopics("gaming/pokemon/pokemon", all, categories, "de", "en")).toEqual([gen]);
  });

  it("leaves out lists the switch wouldn't change", () => {
    // lol is a descendant of `gaming` but already uses the English names in de.
    expect(sharedSecondaryTopics("gaming", all, categories, "de", "en")).not.toContain(lol);
  });

  it("governs nothing at all while English is selected", () => {
    expect(sharedSecondaryTopics("gaming", all, categories, "en", "en")).toEqual([]);
    expect(sharedSecondaryTopics("gaming/pokemon/pokemon", all, categories, "en", "en")).toEqual([]);
  });
});
