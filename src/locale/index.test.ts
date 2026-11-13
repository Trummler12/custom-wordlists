import { describe, expect, it } from "vitest";
import { overlay, strings } from "./index";
import { de } from "./de";
import { en } from "./en";

describe("overlay", () => {
  const base = { a: "A", group: { x: "X", y: "Y" }, fn: (n: number) => `${n}`, pair: ["1", "2"] };

  it("takes a label from the dictionary when it has one", () => {
    expect(overlay(base, { a: "a" }).a).toBe("a");
  });

  it("fills a missing label from the base", () => {
    expect(overlay(base, {}).a).toBe("A");
  });

  it("fills single fields of a group rather than the whole group", () => {
    expect(overlay(base, { group: { x: "x" } }).group).toEqual({ x: "x", y: "Y" });
  });

  it("treats a function and a tuple as one label", () => {
    const fn = (n: number) => `#${n}`;
    const out = overlay(base, { fn, pair: ["3", "4"] });
    expect(out.fn(1)).toBe("#1");
    expect(out.pair).toEqual(["3", "4"]);
  });

  it("leaves the base untouched", () => {
    overlay(base, { group: { x: "x" } });
    expect(base.group.x).toBe("X");
  });
});

describe("strings", () => {
  it("falls back to English for a language without a dictionary", () => {
    expect(strings("xx").settings.label).toBe(en.settings.label);
  });

  it("takes a missing language's labels from the chosen fallback", () => {
    expect(strings("xx", "de").settings.label).toBe(de.settings.label);
  });

  it("prefers the interface dictionary over the fallback", () => {
    expect(strings("de", "en").settings.label).toBe(de.settings.label);
  });

  it("returns the same object for the same pair", () => {
    expect(strings("de", "en")).toBe(strings("de", "en"));
  });
});
