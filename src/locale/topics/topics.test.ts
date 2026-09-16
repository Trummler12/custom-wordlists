import { describe, expect, it } from "vitest";
import { resolveProse, topicProse } from "./index";

/** The interface languages that carry their own topic-prose dictionary. */
const LANGS = ["en", "de", "es", "fr", "it", "ja", "ko", "zh-Hans", "zh-Hant", "ru"];

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
