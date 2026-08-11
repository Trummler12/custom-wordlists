import { describe, expect, it } from "vitest";
import { activeRules, entryForms, findOmission, globToRegExp, isOmitted, visibleGroup } from "./omitted";
import type { Group, Omission } from "./types";

let n = 0;
const rule = (match: string, extra: Partial<Omission> = {}): Omission => ({
  id: `r${n++}`,
  match,
  reason: "test",
  ...extra,
});

describe("globToRegExp", () => {
  const matches = (glob: string, s: string) => globToRegExp(glob).test(s);

  it("anchors: a rule covers a whole name or nothing", () => {
    expect(matches("Kupon", "Kupon")).toBe(true);
    expect(matches("Kupon", "Kupon 1")).toBe(false);
    expect(matches("Kupon", "Superkupon")).toBe(false);
  });

  it("* stands for any run, including an empty one", () => {
    expect(matches("★*", "★And390")).toBe(true);
    expect(matches("★*", "★")).toBe(true);
    expect(matches("★*", "And390")).toBe(false);
  });

  it("? stands for exactly one character", () => {
    expect(matches("Brückbrief ?", "Brückbrief H")).toBe(true);
    expect(matches("Brückbrief ?", "Brückbrief")).toBe(false);
    expect(matches("Brückbrief ?", "Brückbrief HM")).toBe(false);
  });

  it("supports character classes and ranges", () => {
    expect(matches("Kupon [0-9]", "Kupon 3")).toBe(true);
    expect(matches("Kupon [0-9]", "Kupon x")).toBe(false);
    expect(matches("X-* [2-6]", "X-Initiative 2")).toBe(true);
    expect(matches("X-* [2-6]", "X-Initiative")).toBe(false);
    expect(matches("R[0-9]-Schlüssel", "R4-Schlüssel")).toBe(true);
  });

  it("treats regex metacharacters as literals", () => {
    // Written as a glob, "X-Sp.-Ang." means those characters, not "any character".
    expect(matches("X-Sp.-Ang.", "X-Sp.-Ang.")).toBe(true);
    expect(matches("X-Sp.-Ang.", "X-SpX-AngX")).toBe(false);
    expect(matches("a+b", "a+b")).toBe(true);
    expect(matches("a+b", "aab")).toBe(false);
  });

  it("reads an unclosed bracket as a literal rather than failing to compile", () => {
    // A pattern is data; one that threw would take the whole topic file down.
    expect(() => globToRegExp("Item [1")).not.toThrow();
    expect(matches("Item [1", "Item [1")).toBe(true);
  });
});

describe("entryForms", () => {
  it("returns the string itself for a plain entry", () => {
    expect(entryForms("Pikachu")).toEqual(["Pikachu"]);
  });

  it("collects every language of a map", () => {
    expect(entryForms({ en: "Data Card 01", de: "Datenkarte01" })).toEqual([
      "Data Card 01",
      "Datenkarte01",
    ]);
  });

  it("collects both halves of a name pair", () => {
    expect(entryForms({ short: "SpongeBob", long: "SpongeBob SquarePants" })).toEqual([
      "SpongeBob",
      "SpongeBob SquarePants",
    ]);
  });

  it("reaches the strings inside a localized pair", () => {
    const e = { short: { en: "Card", de: "Karte" }, long: { en: "Data Card", de: "Datenkarte" } };
    expect(entryForms(e).sort()).toEqual(["Card", "Data Card", "Datenkarte", "Karte"]);
  });
});

describe("findOmission", () => {
  const rules = [rule("★*"), rule("Datenkarte[0-9]*", { as: { en: "Data Card", de: "Datenkarte" } })];

  it("matches an entry through any of its language forms", () => {
    // The pattern is German; the English form never matches it, and the entry
    // still goes — one rule per family, written in whichever language reads best.
    const card = { en: "Data Card 01", de: "Datenkarte01" };
    expect(findOmission(card, rules)?.match).toBe("Datenkarte[0-9]*");
  });

  it("matches a language-neutral entry", () => {
    expect(findOmission("★And390", rules)?.match).toBe("★*");
  });

  it("leaves the base name alone — that is the point of `as`", () => {
    expect(isOmitted({ en: "Data Card", de: "Datenkarte" }, rules)).toBe(false);
  });

  it("leaves everything else alone", () => {
    for (const e of ["Pokéball", { en: "Rare Candy", de: "Sonderbonbon" }]) {
      expect(isOmitted(e, rules)).toBe(false);
    }
  });

  it("returns the first rule that covers an entry, so its reason is the one shown", () => {
    const overlapping = [rule("Datenkarte*", { reason: "first" }), rule("Datenkarte[0-9]*")];
    expect(findOmission("Datenkarte01", overlapping)?.reason).toBe("first");
  });

  it("omits nothing when there are no rules", () => {
    expect(isOmitted("★And390", [])).toBe(false);
  });
});

describe("activeRules", () => {
  const g: Group = {
    id: "g",
    title: "G",
    words: [],
    omitted: [
      rule("★*"),
      rule("Datenkarte*", { id: "data-cards" }),
    ],
  };

  it("holds every rule while nothing is switched on", () => {
    expect(activeRules(g, []).map((r) => r.match)).toEqual(["★*", "Datenkarte*"]);
  });

  it("drops a rule the reader asked back", () => {
    expect(activeRules(g, ["data-cards"]).map((r) => r.match)).toEqual(["★*"]);
  });

  it("ignores an id no rule declares", () => {
    expect(activeRules(g, ["nonsense"])).toHaveLength(2);
  });
});

describe("visibleGroup", () => {
  const flat = (): Group => ({
    id: "items",
    title: "Items",
    words: ["Pokéball", "★And390", { en: "Data Card 01", de: "Datenkarte01" }],
    omitted: [
      rule("★*"),
      rule("Datenkarte*", { id: "data-cards", as: { en: "Data Card", de: "Datenkarte" } }),
    ],
  });

  it("returns the group itself when nothing is omitted", () => {
    const plain: Group = { id: "g", title: "G", words: ["a"] };
    expect(visibleGroup(plain, [])).toBe(plain);
  });

  it("drops matching entries and puts each rule's `as` in their place", () => {
    const v = visibleGroup(flat(), []);
    expect(v.words).toEqual(["Pokéball", { en: "Data Card", de: "Datenkarte" }]);
  });

  it("brings a family back — and drops its stand-in, which has nothing left to stand for", () => {
    const v = visibleGroup(flat(), ["data-cards"]);
    expect(v.words).toEqual(["Pokéball", { en: "Data Card 01", de: "Datenkarte01" }]);
  });

  it("leaves the group itself untouched", () => {
    const g = flat();
    visibleGroup(g, []);
    expect(g.words).toHaveLength(3);
  });

  it("answers the same object for the same settings, and a different one otherwise", () => {
    const g = flat();
    expect(visibleGroup(g, [])).toBe(visibleGroup(g, []));
    expect(visibleGroup(g, [])).not.toBe(visibleGroup(g, ["data-cards"]));
  });

  it("filters per tier, so a ruler's depths keep meaning what they meant", () => {
    const tiered: Group = {
      id: "g",
      title: "G",
      tiers: [["Pikachu", "★A"], ["Bidoof", "★B"]],
      omitted: [rule("★*")],
    };
    expect(visibleGroup(tiered, []).tiers).toEqual([["Pikachu"], ["Bidoof"]]);
  });

  it("puts a stand-in in the least famous tier", () => {
    const tiered: Group = {
      id: "g",
      title: "G",
      tiers: [["Pikachu"], ["Bidoof"]],
      omitted: [rule("Karte*", { as: "Karte" })],
    };
    expect(visibleGroup(tiered, []).tiers).toEqual([["Pikachu"], ["Bidoof", "Karte"]]);
  });
});
