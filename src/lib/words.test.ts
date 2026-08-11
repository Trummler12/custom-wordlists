import { describe, expect, it } from "vitest";
import {
  displayName,
  groupEntries,
  groupHasNames,
  renderCount,
  renderEntry,
  resolveStr,
  resolveWord,
} from "./words";
import type { Group } from "./types";

describe("resolveStr", () => {
  it("passes a plain string through — it is already neutral", () => {
    expect(resolveStr("Pikachu", "de")).toBe("Pikachu");
  });

  it("picks the language, falling back to the en base", () => {
    const s = { en: "Squirtle", de: "Schiggy" };
    expect(resolveStr(s, "de")).toBe("Schiggy");
    expect(resolveStr(s, "en")).toBe("Squirtle");
    expect(resolveStr(s, "fr")).toBe("Squirtle");
  });
});

describe("resolveWord", () => {
  it("localizes each half of a name pair independently", () => {
    const pair = { short: "USA", long: { en: "United States", de: "Vereinigte Staaten" } };
    expect(resolveWord(pair, "de")).toEqual({ short: "USA", long: "Vereinigte Staaten" });
  });

  it("accepts an entry-level language map and recurses into it", () => {
    const map = { en: "Data Card", de: { short: "Karte", long: "Datenkarte" } };
    expect(resolveWord(map, "de")).toEqual({ short: "Karte", long: "Datenkarte" });
    expect(resolveWord(map, "en")).toBe("Data Card");
  });

  it("falls back to en for a language the map doesn't carry", () => {
    expect(resolveWord({ en: "Ash", de: "Asch" }, "fr")).toBe("Ash");
  });
});

describe("renderEntry", () => {
  const pair = { short: "SpongeBob", long: "SpongeBob SquarePants" };

  it("emits the requested form of a pair", () => {
    expect(renderEntry(pair, "short", "en")).toEqual(["SpongeBob"]);
    expect(renderEntry(pair, "long", "en")).toEqual(["SpongeBob SquarePants"]);
    expect(renderEntry(pair, "both", "en")).toEqual(["SpongeBob", "SpongeBob SquarePants"]);
  });

  it("collapses a pair whose forms are identical, so 'both' can't duplicate", () => {
    expect(renderEntry({ short: "Pikachu", long: "Pikachu" }, "both", "en")).toEqual(["Pikachu"]);
  });

  it("ignores the mode for a plain string, which has only one form", () => {
    for (const mode of ["short", "long", "both"] as const) {
      expect(renderEntry("Charizard", mode, "en")).toEqual(["Charizard"]);
    }
  });
});

describe("renderCount", () => {
  it("counts distinct rendered strings, not entries", () => {
    const entries = [{ short: "A", long: "Alpha" }, "Alpha"];
    // "both" renders A, Alpha, Alpha → two distinct.
    expect(renderCount(entries, "both", "en")).toBe(2);
    expect(renderCount(entries, "long", "en")).toBe(1);
  });

  it("counts in the language it is given", () => {
    const entries = [{ en: "Ash", de: "Asch" }, "Ash"];
    expect(renderCount(entries, "long", "en")).toBe(1);
    expect(renderCount(entries, "long", "de")).toBe(2);
  });
});

describe("displayName", () => {
  it("repeats a single-form name in both fields", () => {
    expect(displayName("South Park", "en")).toEqual({ short: "South Park", long: "South Park" });
  });

  it("keeps a pair's two halves, resolved", () => {
    const title = { short: "Gen I", long: "Generation I" };
    expect(displayName(title, "de")).toEqual({ short: "Gen I", long: "Generation I" });
  });
});

describe("groupHasNames", () => {
  it("is true only where an entry resolves to a pair in that language", () => {
    const g: Group = { id: "g", title: "G", words: ["Ash", { short: "A", long: "Alpha" }] };
    expect(groupHasNames(g, "en")).toBe(true);
    expect(groupHasNames({ id: "g", title: "G", words: ["Ash"] }, "en")).toBe(false);
  });
});

describe("groupEntries", () => {
  it("flattens tiers, and returns a flat list unchanged", () => {
    expect(groupEntries({ id: "g", title: "G", tiers: [["a"], ["b", "c"]] })).toEqual(["a", "b", "c"]);
    expect(groupEntries({ id: "g", title: "G", words: ["a"] })).toEqual(["a"]);
  });

  it("returns the same array on a second call — the cache is the point", () => {
    const g: Group = { id: "g", title: "G", tiers: [["a"], ["b"]] };
    expect(groupEntries(g)).toBe(groupEntries(g));
  });

  it("treats a group with neither list as empty", () => {
    expect(groupEntries({ id: "g", title: "G" })).toEqual([]);
  });
});
