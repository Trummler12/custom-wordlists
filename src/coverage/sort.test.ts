import { describe, expect, it } from "vitest";
import { firstDir, sortItems, type SortableItem } from "./sort";

const items: SortableItem[] = [
  { qid: "Q1", name: "Alpha", num: 100, miss: ["de"] }, // 1 gap
  { qid: "Q2", name: "Bravo", num: 300, miss: ["de", "fr", "it"] }, // 3 gaps, de missing
  { qid: "Q3", name: "Charlie", num: 200 }, // 0 gaps, de present
  { qid: "Q4", name: "Delta", num: 300, miss: ["fr"] }, // 1 gap, de present
];

const ids = (arr: SortableItem[]) => arr.map((i) => i.qid);

describe("firstDir", () => {
  it("is ascending for the name column, descending otherwise", () => {
    expect(firstDir("name")).toBe("asc");
    expect(firstDir("num")).toBe("desc");
    expect(firstDir("de")).toBe("desc");
  });
});

describe("sortItems", () => {
  it("default (null): fewest gaps, then largest number, then name", () => {
    // Q3 (0 gaps) first; then the 1-gap pair by number desc — Q4 (300) before Q1 (100); then Q2 (3).
    expect(ids(sortItems(items, { key: null, dir: "desc" }))).toEqual(["Q3", "Q4", "Q1", "Q2"]);
  });

  it("a language column puts its missing labels on top, fewest other gaps first", () => {
    // de missing: Q1, Q2 (top); present: Q3, Q4. Within top, fewest gaps first => Q1 (1) then Q2 (3).
    // Within present, fewest gaps first => Q3 (0) then Q4 (1) — the easy wins rise.
    expect(ids(sortItems(items, { key: "de", dir: "desc" }))).toEqual(["Q1", "Q2", "Q3", "Q4"]);
  });

  it("the numeric column, descending, breaks ties by name", () => {
    // 300: Q2 (Bravo) & Q4 (Delta) -> name asc => Q2, Q4; then 200 Q3; then 100 Q1.
    expect(ids(sortItems(items, { key: "num", dir: "desc" }))).toEqual(["Q2", "Q4", "Q3", "Q1"]);
  });

  it("the name column sorts alphabetically and reverses on toggle", () => {
    expect(ids(sortItems(items, { key: "name", dir: "asc" }))).toEqual(["Q1", "Q2", "Q3", "Q4"]);
    expect(ids(sortItems(items, { key: "name", dir: "desc" }))).toEqual(["Q4", "Q3", "Q2", "Q1"]);
  });

  it("does not crash on a nameless item (no label in any language)", () => {
    const withNameless: SortableItem[] = [...items, { qid: "Q9", num: 50, miss: ["de", "fr"] }];
    // The nameless row sorts as "" (top under name-asc) and never throws.
    expect(() => sortItems(withNameless, { key: "name", dir: "asc" })).not.toThrow();
    expect(ids(sortItems(withNameless, { key: "name", dir: "asc" }))[0]).toBe("Q9");
  });

  it("does not mutate the input", () => {
    const before = ids(items);
    sortItems(items, { key: "name", dir: "desc" });
    expect(ids(items)).toEqual(before);
  });
});
