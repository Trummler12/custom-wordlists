import { describe, expect, it } from "vitest";
import {
  availableSeparators,
  classifyCustom,
  DEFAULT_SEPARATOR,
  detectSeparator,
  exportLists,
  overlapStats,
  parseImport,
  parseItems,
  previewText,
  separatorCounts,
  SEPARATORS,
  serializeItems,
} from "./custom";

describe("separatorCounts", () => {
  it("counts each separator", () => {
    const c = separatorCounts("a,b,c;d");
    expect(c[","]).toBe(2);
    expect(c[";"]).toBe(1);
  });
  it("counts a separator inside quotes too — quotes are ordinary characters", () => {
    expect(separatorCounts('"a,b",c')[","]).toBe(2);
  });
});

describe("detectSeparator", () => {
  it("picks the most common separator", () => {
    expect(detectSeparator("a,b,c")).toBe(",");
    expect(detectSeparator("a;b;c,d")).toBe(";");
  });
  it("falls back to the default on an empty input", () => {
    expect(detectSeparator("")).toBe(DEFAULT_SEPARATOR);
    expect(detectSeparator("justoneitem")).toBe(DEFAULT_SEPARATOR);
  });
  it("falls back to the default on a tie", () => {
    // one comma, one semicolon — no clear winner, so `,` rather than an arbitrary one.
    expect(detectSeparator("a,b;c")).toBe(DEFAULT_SEPARATOR);
  });
  it("detects newline- and tab-separated columns", () => {
    expect(detectSeparator("a\nb\nc")).toBe("\n");
    expect(detectSeparator("a\tb\tc")).toBe("\t");
  });
});

describe("availableSeparators", () => {
  it("offers only the separators that occur", () => {
    expect(availableSeparators("a,b;c")).toEqual([",", ";"]);
  });
  it("offers all separators when none occurs", () => {
    expect(availableSeparators("word")).toEqual([...SEPARATORS]);
  });
});

describe("parseItems", () => {
  it("splits, trims and drops empties", () => {
    expect(parseItems("a, b ,, c ", ",")).toEqual(["a", "b", "c"]);
  });
  it("splits on the separator even inside quotes, and keeps the quote marks", () => {
    expect(parseItems('"a, b", c', ",")).toEqual(['"a', 'b"', "c"]);
  });
  it("splits newline lists", () => {
    expect(parseItems("Apple\nPear\n\nOrange", "\n")).toEqual(["Apple", "Pear", "Orange"]);
  });
  it("is empty for empty input", () => {
    expect(parseItems("", ",")).toEqual([]);
  });
});

describe("classifyCustom", () => {
  const seen = new Set<string>();
  it("keeps unique, in-cap items in order", () => {
    const r = classifyCustom([["a", "b", "c"]], { cap: 32, keepTooLong: false, seen });
    expect(r.kept).toEqual(["a", "b", "c"]);
    expect(r.total).toBe(3);
    expect(r.internal.count).toBe(0);
  });
  it("counts internal duplicates within one source and keeps the first", () => {
    const r = classifyCustom([["a", "b", "a"]], { cap: 32, keepTooLong: false, seen });
    expect(r.kept).toEqual(["a", "b"]);
    expect(r.internal.count).toBe(1);
    expect(r.internal.samples).toEqual(["a"]);
  });
  it("counts local duplicates across sources, internal within one", () => {
    // "b" repeats across the two sources (local); "c" repeats within the second (internal).
    const r = classifyCustom([["a", "b"], ["b", "c", "c"]], { cap: 32, keepTooLong: false, seen });
    expect(r.kept).toEqual(["a", "b", "c"]);
    expect(r.local.count).toBe(1);
    expect(r.internal.count).toBe(1);
    expect(r.total).toBe(5);
  });
  it("counts global duplicates against the seen set", () => {
    const r = classifyCustom([["a", "b"]], { cap: 32, keepTooLong: false, seen: new Set(["a"]) });
    expect(r.kept).toEqual(["b"]);
    expect(r.global.count).toBe(1);
  });
  it("drops over-long items by default but always reports them", () => {
    const long = "x".repeat(40);
    const r = classifyCustom([["a", long]], { cap: 32, keepTooLong: false, seen });
    expect(r.kept).toEqual(["a"]);
    expect(r.tooLong.count).toBe(1);
  });
  it("keeps over-long items when the rule is switched off", () => {
    const long = "x".repeat(40);
    const r = classifyCustom([["a", long]], { cap: 32, keepTooLong: true, seen });
    expect(r.kept).toEqual(["a", long]);
    expect(r.tooLong.count).toBe(1);
  });
  it("applies the precedence over-long => internal => local => global", () => {
    const long = "x".repeat(40);
    // The over-long item is counted under tooLong, not as a global dup, even though
    // it also sits in `seen`.
    const r = classifyCustom([[long]], { cap: 32, keepTooLong: false, seen: new Set([long]) });
    expect(r.tooLong.count).toBe(1);
    expect(r.global.count).toBe(0);
  });
});

describe("serializeItems", () => {
  it("round-trips with parseItems", () => {
    const items = ["Apple", "Pear", "Orange"];
    expect(parseItems(serializeItems(items, ","), ",")).toEqual(items);
  });
  it("joins without quoting, so an item holding the separator splits on the way back", () => {
    expect(serializeItems(["a, b", "c"], ",")).toBe("a, b,c");
    expect(parseItems(serializeItems(["a, b", "c"], ","), ",")).toEqual(["a", "b", "c"]);
  });
});

describe("exportLists / parseImport", () => {
  const lists = [
    { name: "Fruit", separator: "," as const, items: ["Apple", "Pear"] },
    { name: "Veg", separator: ";" as const, items: ["Carrot"] },
  ];
  it("round-trips through the export payload", () => {
    expect(parseImport(exportLists(lists))).toEqual(lists);
  });
  it("returns nothing for a bad blob", () => {
    expect(parseImport("not json")).toEqual([]);
    expect(parseImport("{}")).toEqual([]);
  });
  it("drops malformed entries but keeps good ones", () => {
    const blob = JSON.stringify({
      version: 1,
      lists: [
        { name: "Good", separator: ",", items: ["a"] },
        { name: "NoItems", separator: "," },
        { name: "BadSep", separator: "?", items: ["a"] },
        { separator: ",", items: ["a"] },
      ],
    });
    expect(parseImport(blob)).toEqual([{ name: "Good", separator: ",", items: ["a"] }]);
  });
});

describe("overlapStats", () => {
  it("counts shared distinct items and each set's size", () => {
    expect(overlapStats(["a", "b", "c"], ["b", "c", "d"])).toEqual({ shared: 2, sizeA: 3, sizeB: 3 });
  });
  it("de-duplicates before counting", () => {
    expect(overlapStats(["a", "a", "b"], ["a"])).toEqual({ shared: 1, sizeA: 2, sizeB: 1 });
  });
  it("shares nothing with an empty list", () => {
    expect(overlapStats(["a"], [])).toEqual({ shared: 0, sizeA: 1, sizeB: 0 });
  });
});

describe("previewText", () => {
  it("joins the items when they fit both caps", () => {
    expect(previewText(["Apple", "Pear", "Orange"], 42, 420)).toBe("Apple, Pear, Orange");
  });
  it("caps the item count and marks the remainder", () => {
    expect(previewText(["a", "b", "c", "d"], 2, 420)).toBe("a, b, …");
  });
  it("caps the character length at a whole-item boundary", () => {
    expect(previewText(["Apple", "Pear", "Orange"], 42, 15)).toBe("Apple, Pear, …");
  });
  it("hard-cuts a single item longer than the budget", () => {
    expect(previewText(["Supercalifragilistic"], 42, 10)).toBe("Supercalif…");
  });
  it("shows at least one item even with maxItems below 1", () => {
    expect(previewText(["only", "more"], 0, 420)).toBe("only, …");
  });
});
