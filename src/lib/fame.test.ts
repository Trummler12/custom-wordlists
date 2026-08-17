import { describe, expect, it } from "vitest";
import { depthFromKey, fameGroups, nearestIndex, snapPositions, tierSizes } from "./fame";
import type { Group } from "./types";

const tiered = (...sizes: number[]): Group => ({
  id: "g",
  title: "G",
  tiers: sizes.map((n, t) => Array.from({ length: n }, (_, i) => `t${t}-${i}`)),
});
const flat = (n: number): Group => ({
  id: "g",
  title: "G",
  words: Array.from({ length: n }, (_, i) => `w${i}`),
});

describe("fameGroups", () => {
  it("counts tiers, and reports a flat list as none", () => {
    expect(fameGroups(tiered(3, 4))).toBe(2);
    expect(fameGroups(flat(10))).toBe(0);
  });
});

describe("tierSizes", () => {
  it("reads a flat list as one step holding everything", () => {
    expect(tierSizes(tiered(3, 4))).toEqual([3, 4]);
    expect(tierSizes(flat(10))).toEqual([10]);
  });
});

describe("snapPositions", () => {
  it("starts at 0 and ends at exactly 1", () => {
    for (const g of [tiered(1, 1), tiered(10, 20, 30), tiered(1, 999), flat(7)]) {
      const pos = snapPositions(g);
      expect(pos[0]).toBe(0);
      expect(pos.at(-1)).toBe(1);
    }
  });

  it("gives one position per tier boundary, both ends included", () => {
    expect(snapPositions(tiered(5, 5, 5))).toHaveLength(4);
    expect(snapPositions(flat(5))).toEqual([0, 1]);
  });

  it("increases strictly, so no two stops share a spot", () => {
    const pos = snapPositions(tiered(1, 1, 1, 200));
    for (let i = 1; i < pos.length; i++) expect(pos[i]).toBeGreaterThan(pos[i - 1]);
  });

  it("spaces stops by tier size, but never below the minimum gap", () => {
    // A huge tier next to a tiny one: the big one takes more travel, and the
    // small one still gets a reachable stop rather than being crushed to zero.
    const [, a, b] = snapPositions(tiered(1, 99));
    expect(b - a).toBeGreaterThan(a);
    expect(a).toBeGreaterThan(0.15);
  });

  it("keeps a stop for an empty tier", () => {
    // A list whose tier boundaries come from outside — a population, a year — can
    // have nothing in one band and must still say so, or its next band would sit
    // where the empty one belongs. So the stop exists, at the minimum spacing,
    // and the ones after it stay where a full tier would have put them.
    const pos = snapPositions(tiered(5, 0, 5));
    expect(pos).toHaveLength(4);
    for (let i = 1; i < pos.length; i++) expect(pos[i]).toBeGreaterThan(pos[i - 1]);
    expect(pos[2] - pos[1]).toBeLessThan(pos[1] - pos[0]);
  });

  it("survives a group whose tiers are all empty", () => {
    // Not a list anyone would write, but the sizes sum to zero and the spacing
    // maths divides by that sum.
    const pos = snapPositions(tiered(0, 0));
    expect(pos[0]).toBe(0);
    expect(pos.at(-1)).toBe(1);
  });

  it("survives a group with no tiers at all", () => {
    // Unreachable through the schema, which requires a tier — but the function
    // is in lib/, where the next caller won't know that.
    expect(snapPositions({ id: "g", title: "G", tiers: [] })).toEqual([0]);
  });
});

describe("nearestIndex", () => {
  const pos = [0, 0.25, 0.5, 1];

  it("snaps to the closest stop", () => {
    expect(nearestIndex(pos, 0)).toBe(0);
    expect(nearestIndex(pos, 0.26)).toBe(1);
    expect(nearestIndex(pos, 0.9)).toBe(3);
  });

  it("takes the lower stop when a position sits exactly between two", () => {
    expect(nearestIndex(pos, 0.375)).toBe(1);
  });
});

describe("depthFromKey", () => {
  const key = (k: string) => ({ key: k }) as KeyboardEvent;

  it("moves one step per arrow, in both spellings of each direction", () => {
    expect(depthFromKey(key("ArrowRight"), 2, 5)).toBe(3);
    expect(depthFromKey(key("ArrowUp"), 2, 5)).toBe(3);
    expect(depthFromKey(key("ArrowLeft"), 2, 5)).toBe(1);
    expect(depthFromKey(key("ArrowDown"), 2, 5)).toBe(1);
  });

  it("stops at both ends", () => {
    expect(depthFromKey(key("ArrowRight"), 5, 5)).toBe(5);
    expect(depthFromKey(key("ArrowLeft"), 0, 5)).toBe(0);
  });

  it("jumps to an end with Home and End", () => {
    expect(depthFromKey(key("Home"), 3, 5)).toBe(0);
    expect(depthFromKey(key("End"), 3, 5)).toBe(5);
  });

  it("returns null for anything else, so the caller leaves the event alone", () => {
    expect(depthFromKey(key("Tab"), 3, 5)).toBeNull();
    expect(depthFromKey(key("a"), 3, 5)).toBeNull();
  });
});
