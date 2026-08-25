import { describe, expect, it } from "vitest";
import {
  displayName,
  groupEntries,
  groupHasNames,
  groupHasPref,
  groupHasVariants,
  overlongForms,
  renderCount,
  renderEntry,
  resolveStr,
  resolveWord,
  unknownLangs,
  isUnknownIn,
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

  it("takes the closest tag before giving up on the language", () => {
    // A reader asking for Chinese on a list that spells it `zh-Hans` wants the
    // Chinese name, not the English one it would otherwise fall through to.
    const s = { en: "Squirtle", "zh-Hans": "杰尼龟", "zh-Hant": "傑尼龜" };
    expect(resolveStr(s, "zh")).toBe("杰尼龟");
    expect(resolveStr(s, "zh-TW")).toBe("傑尼龜");
    expect(resolveStr(s, "de-CH")).toBe("Squirtle");
  });

  it("resolves a romanization to the English name when the entry has none", () => {
    // ピカチュウ romanizes to "Pikachu", which is its English name exactly — so the
    // entry omits the key, as it omits every name equal to English. Falling back
    // to the kana would hand ピカチュウ to a reader who asked for romaji.
    expect(resolveStr({ en: "Pikachu", ja: "ピカチュウ" }, "ja-Latn")).toBe("Pikachu");
    expect(resolveStr({ en: "Charmander", ja: "ヒトカゲ", "ja-Latn": "Hitokage" }, "ja-Latn")).toBe(
      "Hitokage",
    );
  });

  it("does not read `?` as a language", () => {
    // It holds language tags, not a name — matching against it would return an
    // array where a string belongs.
    const s = { en: "Squirtle", "?": ["ko"] } as unknown as { en: string };
    expect(resolveStr(s, "ko")).toBe("Squirtle");
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

  it("resolves a single-form pair to the one half it carries", () => {
    expect(resolveWord({ short: "Asia" }, "en")).toEqual({ short: "Asia" });
    expect(resolveWord({ long: "Pacific plate" }, "en")).toEqual({ long: "Pacific plate" });
  });

  it("recurses into a language map holding single-form pairs", () => {
    const asia = { en: { short: "Asia" }, de: { short: "Asien" } };
    expect(resolveWord(asia, "de")).toEqual({ short: "Asien" });
    expect(resolveWord(asia, "fr")).toEqual({ short: "Asia" });
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

  it("drops a short-only entry from long, and a long-only from short", () => {
    // A continent with no eponymous plate, and a plate with no continent.
    expect(renderEntry({ short: "Asia" }, "short", "en")).toEqual(["Asia"]);
    expect(renderEntry({ short: "Asia" }, "long", "en")).toEqual([]);
    expect(renderEntry({ short: "Asia" }, "both", "en")).toEqual(["Asia"]);
    expect(renderEntry({ long: "Pacific plate" }, "long", "en")).toEqual(["Pacific plate"]);
    expect(renderEntry({ long: "Pacific plate" }, "short", "en")).toEqual([]);
    expect(renderEntry({ long: "Pacific plate" }, "both", "en")).toEqual(["Pacific plate"]);
  });

  it("adds the others only under 'all', deduplicated on top of short/long", () => {
    // Taiwan's four English forms: short, long, and two further variants.
    const tw = {
      short: "Taiwan",
      long: "Taiwan, Republic of China",
      others: ["Taiwan R.O.C.", "Taiwan ROC"],
    };
    expect(renderEntry(tw, "short", "en")).toEqual(["Taiwan"]);
    expect(renderEntry(tw, "both", "en")).toEqual(["Taiwan", "Taiwan, Republic of China"]);
    expect(renderEntry(tw, "all", "en")).toEqual([
      "Taiwan",
      "Taiwan, Republic of China",
      "Taiwan R.O.C.",
      "Taiwan ROC",
    ]);
  });

  it("takes a lone others string, and never repeats a form 'all' already carries", () => {
    expect(renderEntry({ short: "HK", others: "HK" }, "all", "en")).toEqual(["HK"]);
    expect(renderEntry({ short: "HK", long: "Hong Kong", others: "Hong Kong" }, "all", "en")).toEqual([
      "HK",
      "Hong Kong",
    ]);
  });

  it("resolves the others in the active language", () => {
    const e = { short: { en: "Cologne", de: "Köln" }, others: [{ en: "Colonia", de: "Domstadt" }] };
    expect(renderEntry(e, "all", "de")).toEqual(["Köln", "Domstadt"]);
    expect(renderEntry(e, "all", "en")).toEqual(["Cologne", "Colonia"]);
  });

  it("falls a mode with no form of its own back to pref — but only to pref", () => {
    const e = { pref: "a", long: "bc" };
    expect(renderEntry(e, "pref", "en")).toEqual(["a"]);
    expect(renderEntry(e, "short", "en")).toEqual(["a"]); // short absent → pref
    expect(renderEntry(e, "long", "en")).toEqual(["bc"]); // long present → itself
    expect(renderEntry(e, "both", "en")).toEqual(["a", "bc"]);
    expect(renderEntry(e, "all", "en")).toEqual(["a", "bc"]);
  });

  it("does not let a missing form fall past pref onto the other form", () => {
    // No pref: a short-only entry stays out of long, a long-only out of short —
    // the binding that predates pref, preserved because the pref fallback is absent.
    expect(renderEntry({ short: "Asia" }, "long", "en")).toEqual([]);
    expect(renderEntry({ long: "Pacific plate" }, "short", "en")).toEqual([]);
  });

  it("emits all three explicit forms under 'both' when they differ, no fallback", () => {
    const e = { pref: "Democratic Republic of Congo", short: "DR Congo", long: "Democratic Republic of the Congo" };
    expect(renderEntry(e, "both", "en")).toEqual([
      "Democratic Republic of Congo",
      "DR Congo",
      "Democratic Republic of the Congo",
    ]);
    // A pref-less pair still yields just its two, so B11's continents/plates are unmoved.
    expect(renderEntry({ short: "Asia" }, "both", "en")).toEqual(["Asia"]);
    expect(renderEntry({ short: "A", long: "Alpha" }, "both", "en")).toEqual(["A", "Alpha"]);
  });

  it("emits pref, short, long and others under 'all', deduplicated", () => {
    const e = { pref: "United States", long: "United States of America", others: ["USA", "America"] };
    expect(renderEntry(e, "pref", "en")).toEqual(["United States"]);
    expect(renderEntry(e, "all", "en")).toEqual([
      "United States",
      "United States of America",
      "USA",
      "America",
    ]);
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

  it("drops the forms past maxLen, and counts all of them without one", () => {
    const entries = [{ short: "Sandwich", long: "South Sandwich Plate" }];
    expect(renderCount(entries, "both", "en")).toBe(2);
    expect(renderCount(entries, "both", "en", false, 10)).toBe(1);
  });
});

describe("overlongForms", () => {
  // The entry survives its long form: that is what makes this a rule about forms
  // rather than about entries, and why it cannot live in `visibleGroup`.
  const entries = [{ short: "Sandwich", long: "South Sandwich Plate" }, "Manus Plate"];

  it("names the forms past the limit and leaves the rest alone", () => {
    expect(overlongForms(entries, "both", "en", false, 12)).toEqual(["South Sandwich Plate"]);
    expect(overlongForms(entries, "short", "en", false, 12)).toEqual([]);
  });

  it("is empty when everything fits", () => {
    expect(overlongForms(entries, "both", "en", false, 40)).toEqual([]);
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

describe("groupHasPref", () => {
  it("is true only where an entry carries a pref name in that language", () => {
    const withPref: Group = { id: "g", title: "G", words: ["Ash", { pref: "Taiwan", long: "Republic of China" }] };
    expect(groupHasPref(withPref, "en")).toBe(true);
    const plain: Group = { id: "g", title: "G", words: ["Ash", { short: "A", long: "Alpha" }] };
    expect(groupHasPref(plain, "en")).toBe(false);
  });
});

describe("groupHasVariants", () => {
  it("is true only where an entry carries an others variant in that language", () => {
    const withVar: Group = {
      id: "g",
      title: "G",
      words: ["Ash", { short: "Taiwan", others: ["Taiwan ROC"] }],
    };
    expect(groupHasVariants(withVar, "en")).toBe(true);
    const plain: Group = { id: "g", title: "G", words: ["Ash", { short: "A", long: "Alpha" }] };
    expect(groupHasVariants(plain, "en")).toBe(false);
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

describe("unknownLangs / isUnknownIn", () => {
  const coin = { en: "Gimmighoul Coin", fr: "Pièce de Mordudor", "?": ["de", "ko"] };

  it("reads the languages an entry has no name in", () => {
    expect(unknownLangs(coin)).toEqual(["de", "ko"]);
    expect(unknownLangs("Protein")).toEqual([]);
    expect(unknownLangs({ en: "Poké Ball", de: "Pokéball" })).toEqual([]);
  });

  it("separates 'we have nothing' from 'the same as English'", () => {
    // Both entries lack a `de` key; only one of them is claiming a German name.
    expect(isUnknownIn(coin, "de")).toBe(true);
    expect(isUnknownIn("Protein", "de")).toBe(false);
    expect(isUnknownIn({ en: "Nugget", fr: "Pépite" }, "de")).toBe(false);
  });

  it("lets an own key outrank the gap the source reported", () => {
    const filled = { ...coin, de: "Gierspinst-Münze" };
    expect(isUnknownIn(filled, "de")).toBe(false);
    expect(isUnknownIn(filled, "ko")).toBe(true);
  });

  it("never counts English — it is the base every entry has", () => {
    expect(isUnknownIn({ en: "x", "?": ["en"] }, "en")).toBe(false);
    expect(isUnknownIn({ en: "x", "?": ["en"] }, "en-GB")).toBe(false);
  });

  it("asks a variant tag about the language it varies from", () => {
    // `?` holds languages, never variant tags — a missing row is not a missing
    // name. So an entry with no Spanish name has none in Latin American Spanish
    // either, and asking for the whole tag would find nothing and quietly assert
    // the English word as the Spanish one.
    const cape = { en: "Cape Brace", "?": ["es"] };
    expect(isUnknownIn(cape, "es")).toBe(true);
    expect(isUnknownIn(cape, "es-419")).toBe(true);
    // Same for a romanization: with no Japanese name there is no reading to derive.
    const gap = { en: "Rotom Catalog", "?": ["ja"] };
    expect(isUnknownIn(gap, "ja-Latn")).toBe(true);
  });

  it("lets the variant's own key outrank the gap, as any own key does", () => {
    // Which is why only this half asks for the whole tag: the entry has a Latin
    // American name, whatever `?` says about Spanish at large.
    const filled = { en: "Cape Brace", "es-419": "Capa Brazalete", "?": ["es"] };
    expect(isUnknownIn(filled, "es-419")).toBe(false);
    expect(isUnknownIn(filled, "es")).toBe(true);
  });

  it("leaves resolution alone: `?` is not a language", () => {
    expect(resolveWord(coin, "de")).toBe("Gimmighoul Coin");
    expect(resolveWord(coin, "fr")).toBe("Pièce de Mordudor");
  });
});
