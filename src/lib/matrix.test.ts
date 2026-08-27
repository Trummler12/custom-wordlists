import { describe, expect, it } from "vitest";
import { type Cell, cellKey, dominates, includedAfterClick } from "./matrix";

describe("dominates", () => {
  it("is true up-and-left, false down or right", () => {
    expect(dominates([1, 1], [3, 2])).toBe(true); // top-left over anything
    expect(dominates([2, 1], [2, 1])).toBe(true); // a cell over itself
    expect(dominates([3, 1], [2, 1])).toBe(false); // further down
    expect(dominates([1, 2], [1, 1])).toBe(false); // further right
    expect(dominates([2, 1], [1, 2])).toBe(false); // down-left vs up-right: incomparable
  });
});

describe("includedAfterClick", () => {
  // The 2×4 grid the sovereignty matrix uses.
  const grid: Cell[] = [];
  for (let r = 1; r <= 4; r++) for (let c = 1; c <= 2; c++) grid.push([r, c]);

  /** Apply a click to a whole included-set and return the new keys. */
  const after = (included: Set<string>, clicked: Cell) => {
    const clickedIncluded = included.has(cellKey(clicked));
    const next = new Set<string>();
    for (const x of grid) {
      if (includedAfterClick(x, clicked, clickedIncluded, included.has(cellKey(x)))) next.add(cellKey(x));
    }
    return next;
  };

  const ideal = (keys: string[]) => new Set(keys);

  it("turning a cell on fills everything up-and-left", () => {
    // Nothing included yet; click the free-association cell [2,2].
    const next = after(new Set(), [2, 2]);
    expect(next).toEqual(ideal(["1,1", "1,2", "2,1", "2,2"]));
  });

  it("turning a cell off clears everything down-and-right", () => {
    // The full grid; click [2,1] off.
    const full = ideal(grid.map(cellKey));
    const next = after(full, [2, 1]);
    // [2,1] and everything down-and-right of it (col 1–2, rows 2–4) go; the top row stays.
    expect(next).toEqual(ideal(["1,1", "1,2"]));
  });

  it("keeps a staircase a staircase (the default region round-trips)", () => {
    // Default: col 1 through row 3, col 2 through row 2.
    const def = ideal(["1,1", "1,2", "2,1", "2,2", "3,1"]);
    // Including [3,2] pulls in its up-left closure (already all present) and itself.
    const opened = after(def, [3, 2]);
    expect(opened).toEqual(ideal(["1,1", "1,2", "2,1", "2,2", "3,1", "3,2"]));
    // Clicking [3,2] again excludes it and everything down-and-right — back to default.
    expect(after(opened, [3, 2])).toEqual(def);
  });
});
