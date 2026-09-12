import { describe, expect, it } from "vitest";
import { dropPrefix, resolveRoute, restoreFromQuery, segmentsToRoute, stripBase } from "./route";

describe("stripBase", () => {
  it("drops the deploy base and empty segments", () => {
    expect(stripBase("/custom-wordlists/countries/de", "/custom-wordlists/")).toEqual(["countries", "de"]);
  });
  it("handles the root base used in dev", () => {
    expect(stripBase("/countries/de/en", "/")).toEqual(["countries", "de", "en"]);
  });
  it("drops the coverage.html filename", () => {
    expect(stripBase("/custom-wordlists/coverage.html", "/custom-wordlists/")).toEqual([]);
  });
});

describe("restoreFromQuery", () => {
  it("decodes a ?/ packed path", () => {
    expect(restoreFromQuery("?/countries/de")).toEqual(["countries", "de"]);
  });
  it("stops at the first & and percent-decodes", () => {
    expect(restoreFromQuery("?/languages/zh-Hans&foo=bar")).toEqual(["languages", "zh-Hans"]);
  });
  it("is null without the ?/ marker", () => {
    expect(restoreFromQuery("?lang=de")).toBeNull();
    expect(restoreFromQuery("")).toBeNull();
  });
});

describe("dropPrefix", () => {
  it("drops a leading coverage/ prefix", () => {
    expect(dropPrefix(["coverage", "countries", "de"])).toEqual(["countries", "de"]);
  });
  it("leaves prefix-less segments untouched", () => {
    expect(dropPrefix(["countries", "de"])).toEqual(["countries", "de"]);
  });
});

describe("segmentsToRoute", () => {
  it("keeps a known topic and its languages", () => {
    expect(segmentsToRoute(["capitals", "fr", "en"])).toEqual({ topic: "capitals", lang: "fr", uiLang: "en" });
  });
  it("nulls an unknown topic", () => {
    expect(segmentsToRoute(["banana", "de"])).toEqual({ topic: null, lang: "de", uiLang: null });
  });
  it("returns an empty route for no segments", () => {
    expect(segmentsToRoute([])).toEqual({ topic: null, lang: null, uiLang: null });
  });
});

describe("resolveRoute", () => {
  it("reads a clean prefixed pathname", () => {
    expect(resolveRoute("/custom-wordlists/coverage/languages/ja", "", "/custom-wordlists/")).toEqual({
      topic: "languages",
      lang: "ja",
      uiLang: null,
    });
  });
  it("reads the dev root base", () => {
    expect(resolveRoute("/coverage/capitals/fr", "", "/")).toEqual({ topic: "capitals", lang: "fr", uiLang: null });
  });
  it("prefers a ?/ restore query (carrying the coverage/ prefix) over the pathname", () => {
    expect(resolveRoute("/custom-wordlists/coverage.html", "?/coverage/countries/de/en", "/custom-wordlists/")).toEqual({
      topic: "countries",
      lang: "de",
      uiLang: "en",
    });
  });
});
