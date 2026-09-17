import { describe, expect, it } from "vitest";
import { resolveCondition, resolveProse, topicProse } from "./index";

/** The interface languages that carry their own topic-prose dictionary. */
const LANGS = ["en", "de", "es", "fr", "it", "ja", "ko", "pt", "zh-Hans", "zh-Hant", "ru"];

/** Recursively collect the leaf paths of an object, so two dictionaries can be
 *  compared by shape rather than by (localized) value. */
function shape(o: unknown, prefix = ""): string[] {
  if (o === null || typeof o !== "object") return [prefix];
  return Object.entries(o as Record<string, unknown>)
    .flatMap(([k, v]) => shape(v, prefix ? `${prefix}.${k}` : k))
    .sort();
}

describe("topicProse", () => {
  it("returns a language's dictionary", () => {
    expect(topicProse("en").aboveZero).toBe("more than 0");
  });
  it("falls back to English for an unknown language", () => {
    expect(topicProse("xx")).toBe(topicProse("en"));
  });
  it.each(LANGS)("registers %s with its own distinct dictionary", (lang) => {
    const dict = topicProse(lang);
    // A locale that failed to register would fall through to the English object.
    if (lang !== "en") expect(dict).not.toBe(topicProse("en"));
    expect(shape(dict)).toEqual(shape(topicProse("en")));
  });
});

describe("resolveProse", () => {
  it("resolves a dotted id against the locale", () => {
    expect(resolveProse("sovereignty.deFactoRecognized", "en")).toBe(
      "fully sovereign states recognized by many, though not all, UN members",
    );
    expect(resolveProse("coverage.noCoverage", "en")).toBe(
      "countries with no Google Street View coverage",
    );
  });
  it("falls back to English when the language has no dictionary yet", () => {
    expect(resolveProse("signLanguages", "xx")).toBe("sign languages");
  });
  it("returns the id itself when it names nothing (a stale id fails visibly)", () => {
    expect(resolveProse("sovereignty.doesNotExist", "en")).toBe("sovereignty.doesNotExist");
  });
});

describe("resolveCondition", () => {
  it("wraps a band key in the locale's `more` format", () => {
    expect(resolveCondition("100M", "en")).toBe("100 million or more");
    expect(resolveCondition("1k", "en")).toBe("1,000 or more");
    expect(resolveCondition("100M", "ja")).toBe("1億以上");
    expect(resolveCondition("300k", "de")).toBe("300.000 und mehr");
  });
  it("renders the floor token as `aboveZero`", () => {
    expect(resolveCondition(">0", "en")).toBe("more than 0");
    expect(resolveCondition(">0", "ru")).toBe("больше 0");
  });
  it("resolves a plain prose id (the descriptive continent tiers)", () => {
    expect(resolveCondition("continentTiers.0", "en")).toBe("continents and major plates");
  });
  it("folds a tier's note onto a {br}{br} second line via the @noteId tail", () => {
    expect(resolveCondition("continentTiers.3@tier3Note", "en")).toBe(
      "microplates and larger, measured or not{br}{br}Note: No area has ever been published for these plates, so this tier is grouped by the plate each sits under rather than ordered by size — and several of them are not their own encyclopedia article either.",
    );
  });
});
