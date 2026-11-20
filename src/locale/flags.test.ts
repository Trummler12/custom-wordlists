import { describe, expect, it } from "vitest";
import { FLAG_TYPES, FLAG_URLS, FLAGS, flagFor, flagsFor } from "./flags";
import { CONTENT_LANGS } from "./index";

describe("FLAGS", () => {
  it("names only images that exist", () => {
    for (const path of Object.values(FLAGS).flat()) expect(FLAG_URLS, path).toHaveProperty([path]);
  });

  it("keeps each language's flags in type order, one per type", () => {
    for (const [lang, paths] of Object.entries(FLAGS)) {
      const ranks = paths.map((p) => FLAG_TYPES.indexOf(p.split("/")[0] as never));
      expect(ranks.every((r) => r >= 0), lang).toBe(true);
      expect(ranks, lang).toEqual([...new Set(ranks)].sort((a, b) => a - b));
    }
  });

  it("gives every language in the picker a flag", () => {
    for (const lang of CONTENT_LANGS) expect(flagsFor(lang).length, lang).toBeGreaterThan(0);
  });
});

describe("flagFor", () => {
  it("takes the preferred type where the language has it", () => {
    expect(flagFor("fr", "linguistic")?.type).toBe("linguistic");
  });

  it("falls back to the language's default", () => {
    expect(flagFor("ja", "mixed")?.type).toBe("country");
    expect(flagFor("es")?.type).toBe("mixed");
  });

  it("has nothing for a language without a flag", () => {
    expect(flagFor("xx")).toBeUndefined();
  });
});
