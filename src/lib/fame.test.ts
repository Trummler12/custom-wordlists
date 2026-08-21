import { describe, expect, it } from "vitest";
import {
  depthFromKey,
  fameGroups,
  nearestIndex,
  rulerTip,
  skipCollapsed,
  snapPositions,
  tierNoteAt,
  tierSizes,
} from "./fame";
import type { Group, LocalizedString } from "./types";

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

  it("all but touches the two stops around an interior empty tier", () => {
    // A list whose tier boundaries come from outside — a population, a year — can
    // have nothing in one band between two that do. Its stop stays, so a reader
    // sees one stop carries two condition steps, but the gap shrinks to near zero
    // so it claims none of the room a full tier would.
    const pos = snapPositions(tiered(5, 0, 5));
    expect(pos).toHaveLength(4);
    for (let i = 1; i < pos.length; i++) expect(pos[i]).toBeGreaterThan(pos[i - 1]);
    const emptyGap = pos[2] - pos[1];
    expect(emptyGap).toBeGreaterThan(0);
    expect(emptyGap).toBeLessThan(0.05);
  });

  it("collapses leading empty tiers onto the famous end", () => {
    // Oceania has no country over 100M: its top bands are empty. They pile onto 0,
    // so the first perceptible stop is the one that brings in real entries.
    const pos = snapPositions(tiered(0, 0, 5, 5));
    expect(pos).toHaveLength(5);
    expect(pos[0]).toBe(0);
    expect(pos[1]).toBe(0);
    expect(pos[2]).toBe(0);
    expect(pos[3]).toBeGreaterThan(0);
    expect(pos.at(-1)).toBe(1);
  });

  it("collapses trailing empty tiers onto the least-famous end", () => {
    const pos = snapPositions(tiered(5, 5, 0, 0));
    expect(pos).toHaveLength(5);
    expect(pos[2]).toBe(1);
    expect(pos[3]).toBe(1);
    expect(pos.at(-1)).toBe(1);
    expect(pos[1]).toBeLessThan(1);
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

describe("skipCollapsed", () => {
  it("leaves a step alone when its stop is a pixel of its own", () => {
    const pos = [0, 0.3, 0.6, 1];
    expect(skipCollapsed(pos, 1, 2)).toBe(2);
    expect(skipCollapsed(pos, 2, 1)).toBe(1);
  });

  it("steps past leading stops collapsed onto 0, so an arrow moves the thumb", () => {
    // pos for tiered(0, 0, 5, 5): [0, 0, 0, x, 1]. From rest, one press should reach
    // the first stop with a pixel of its own, not the invisible duplicate at 0.
    const pos = snapPositions(tiered(0, 0, 5, 5));
    expect(skipCollapsed(pos, 0, 1)).toBe(3);
  });

  it("steps back past trailing stops collapsed onto 1", () => {
    // pos for tiered(5, 5, 0, 0): [0, x, 1, 1, 1] — depths 2, 3 and 4 share the far
    // pixel and the same visible entries, so one press back from the end lands on
    // depth 1, the first stop that actually moves the thumb and drops a real tier.
    const pos = snapPositions(tiered(5, 5, 0, 0));
    expect(skipCollapsed(pos, 4, 3)).toBe(1);
  });

  it("never leaves the range, so Home and End still reach the true ends", () => {
    const pos = snapPositions(tiered(0, 0, 5));
    expect(skipCollapsed(pos, 3, 0)).toBe(0);
    expect(skipCollapsed(pos, 0, 3)).toBe(3);
  });
});

describe("rulerTip", () => {
  const resolve = (s: LocalizedString) => (typeof s === "string" ? s : s.en);
  const g = (): Group => ({
    ...tiered(2, 3),
    tierConditions: ["100 million or more", "20 million or more"],
    rulerTooltip: {
      text: "Selected: Countries with {condition} inhabitants",
      empty: "Ranked by population.",
    },
  });

  it("is nothing for a list that declares none, so the caller can fall back", () => {
    expect(rulerTip(tiered(2, 3), 1, resolve)).toBeUndefined();
  });

  it("says what the list is ordered by at rest", () => {
    expect(rulerTip(g(), 0, resolve)).toBe("Ranked by population.");
  });

  it("fills {condition} with the lowest band the ruler has brought in", () => {
    expect(rulerTip(g(), 1, resolve)).toBe("Selected: Countries with 100 million or more inhabitants");
    expect(rulerTip(g(), 2, resolve)).toBe("Selected: Countries with 20 million or more inhabitants");
  });

  it("drops the token when there are no conditions to fill it", () => {
    const noConds: Group = {
      ...tiered(2, 3),
      rulerTooltip: { text: "Selected: {condition}", empty: "Ranked." },
    };
    expect(rulerTip(noConds, 1, resolve)).toBe("Selected: ");
  });
});

describe("tierNoteAt", () => {
  const g = (...notes: { fromTier: number; text: string }[]): Group => ({
    ...tiered(3, 4, 5, 6),
    tierNotes: notes,
  });

  it("says nothing until the ruler reaches the note", () => {
    const one = g({ fromTier: 3, text: "thin down here" });
    expect(tierNoteAt(one, 2)).toBeUndefined();
    expect(tierNoteAt(one, 3)?.text).toBe("thin down here");
    expect(tierNoteAt(one, 4)?.text).toBe("thin down here");
  });

  it("shows the deepest note that applies, not every one of them", () => {
    const two = g({ fromTier: 2, text: "second" }, { fromTier: 4, text: "fourth" });
    expect(tierNoteAt(two, 3)?.text).toBe("second");
    expect(tierNoteAt(two, 4)?.text).toBe("fourth");
  });

  it("is nothing for a list that declares none", () => {
    expect(tierNoteAt(tiered(3, 4), 2)).toBeUndefined();
    expect(tierNoteAt(flat(10), 1)).toBeUndefined();
  });
});
