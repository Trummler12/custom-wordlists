import { describe, expect, it } from "vitest";
import { rulerHidden } from "./rulers";
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

describe("rulerHidden", () => {
  it("is false when nothing on the path declares it", () => {
    expect(rulerHidden(topic("a", { category: "geography/human" }), {})).toBe(false);
  });

  it("follows a topic's own declaration", () => {
    expect(rulerHidden(topic("a", { hideRulers: true }), {})).toBe(true);
    expect(rulerHidden(topic("a", { hideRulers: false }), {})).toBe(false);
  });

  it("inherits from the nearest ancestor category", () => {
    const categories: Record<string, CategoryMeta> = {
      "geography/human/antarctica": { hideRulers: true },
    };
    const t = topic("crickets", { category: "geography/human/antarctica" });
    expect(rulerHidden(t, categories)).toBe(true);
  });

  it("lets a topic re-enable its ruler under a hiding category", () => {
    const categories: Record<string, CategoryMeta> = { zzz: { hideRulers: true } };
    expect(rulerHidden(topic("a", { category: "zzz", hideRulers: false }), categories)).toBe(false);
  });

  it("takes the deepest declaring category when several are on the path", () => {
    const categories: Record<string, CategoryMeta> = {
      outer: { hideRulers: true },
      "outer/inner": { hideRulers: false },
    };
    expect(rulerHidden(topic("a", { category: "outer/inner" }), categories)).toBe(false);
  });
});
