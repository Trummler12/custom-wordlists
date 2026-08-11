import { describe, expect, it } from "vitest";
import { canForceEnglish, englishControl, sharedEnglishTopics } from "./english";
import type { CategoryMeta, TopicSummary } from "./types";

const topic = (id: string, fields: Partial<TopicSummary> = {}): TopicSummary => ({
  id,
  title: id,
  icon: null,
  category: "",
  path: `${id}.json`,
  groupCount: 1,
  wordCount: 1,
  ...fields,
});

describe("canForceEnglish", () => {
  it("says no while English is the selected language", () => {
    expect(canForceEnglish(topic("a", { languages: ["de", "en"] }), "en")).toBe(false);
  });

  it("says no for a list whose names here already are the English ones", () => {
    const lol = topic("lol", { languages: ["de", "en"], usesEnglishFor: ["de"] });
    expect(canForceEnglish(lol, "de")).toBe(false);
  });

  it("says yes for a list that has its own names", () => {
    expect(canForceEnglish(topic("a", { languages: ["de", "en"] }), "de")).toBe(true);
  });

  it("says yes for an undeclared list — the field says nothing about its names", () => {
    expect(canForceEnglish(topic("a"), "de")).toBe(true);
  });
});

describe("englishControl", () => {
  const categories: Record<string, CategoryMeta> = {
    gaming: { sharedEnglishToggle: true },
    "gaming/pokemon": {},
    "gaming/pokemon/pokemon": { sharedEnglishToggle: true },
  };

  it("finds nothing when no ancestor declares one", () => {
    expect(englishControl(topic("a", { category: "film-tv" }), categories)).toBeNull();
    expect(englishControl(topic("a", { category: "" }), categories)).toBeNull();
  });

  it("finds the declaring ancestor", () => {
    expect(englishControl(topic("a", { category: "gaming/pokemon" }), categories)).toBe("gaming");
  });

  it("prefers the nearest one, so a subtree can take its lists back", () => {
    const t = topic("gen-1", { category: "gaming/pokemon/pokemon" });
    expect(englishControl(t, categories)).toBe("gaming/pokemon/pokemon");
  });
});

describe("sharedEnglishTopics", () => {
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
    expect(sharedEnglishTopics("gaming", all, categories, "de")).toEqual([items]);
    expect(sharedEnglishTopics("gaming/pokemon/pokemon", all, categories, "de")).toEqual([gen]);
  });

  it("leaves out lists the switch wouldn't change", () => {
    // lol is a descendant of `gaming` but already uses the English names in de.
    expect(sharedEnglishTopics("gaming", all, categories, "de")).not.toContain(lol);
  });

  it("governs nothing at all while English is selected", () => {
    expect(sharedEnglishTopics("gaming", all, categories, "en")).toEqual([]);
    expect(sharedEnglishTopics("gaming/pokemon/pokemon", all, categories, "en")).toEqual([]);
  });
});
