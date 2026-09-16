import { describe, expect, it } from "vitest";
import { resolveProse, topicProse } from "./index";

describe("topicProse", () => {
  it("returns a language's dictionary", () => {
    expect(topicProse("en").aboveZero).toBe("more than 0");
  });
  it("falls back to English for an unknown language", () => {
    expect(topicProse("xx")).toBe(topicProse("en"));
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
