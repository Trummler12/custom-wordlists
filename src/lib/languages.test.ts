import { describe, expect, it } from "vitest";
import { langSupport, matchTag, splitName, tagChip } from "./languages";
import type { TopicSummary } from "./types";

const topic = (fields: Partial<TopicSummary>): TopicSummary => ({
  id: "t",
  title: "T",
  icon: null,
  category: "",
  path: "t.json",
  wordCount: 1,
  ...fields,
});

describe("langSupport", () => {
  it("is undeclared when nothing says otherwise — including for English", () => {
    const t = topic({});
    expect(langSupport(t, "de")).toBe("undeclared");
    expect(langSupport(t, "en")).toBe("undeclared");
  });

  it("is declared for a language the list carries, undeclared for the rest", () => {
    const t = topic({ languages: ["de", "en"] });
    expect(langSupport(t, "de")).toBe("declared");
    expect(langSupport(t, "fr")).toBe("undeclared");
  });

  it("is english where the list says its names there are the English ones", () => {
    const t = topic({ languages: ["de", "en"], usesEnglishFor: ["de"] });
    expect(langSupport(t, "de")).toBe("english");
    expect(langSupport(t, "en")).toBe("declared");
  });

  it("answers english for a code named outside `languages` too", () => {
    // The subset rule is a convention the validator nudges, not a condition the
    // resolution depends on.
    expect(langSupport(topic({ languages: ["en"], usesEnglishFor: ["de"] }), "de")).toBe("english");
  });

  describe('the "*" wildcard', () => {
    const t = topic({ languages: ["de", "en"], usesEnglishFor: ["*"] });

    it("covers every language `languages` doesn't name", () => {
      expect(langSupport(t, "pt")).toBe("english");
      expect(langSupport(t, "ru")).toBe("english");
    });

    it("does not override a language that is named — those keep their own names", () => {
      expect(langSupport(t, "de")).toBe("declared");
      expect(langSupport(t, "en")).toBe("declared");
    });

    it("leaves nothing undeclared", () => {
      expect(langSupport(t, "xx")).not.toBe("undeclared");
    });
  });
});

describe("matchTag", () => {
  // What the Pokémon lists carry, which is the set the picker will offer.
  const NINE = ["de", "en", "es", "fr", "it", "ja", "ko", "zh-Hans", "zh-Hant"];

  it("takes the tag itself when it is there", () => {
    expect(matchTag("de", NINE)).toBe("de");
    expect(matchTag("zh-Hant", NINE)).toBe("zh-Hant");
  });

  it("matches regardless of how the tag is cased", () => {
    // A stored preference or an Accept-Language header may spell it either way.
    expect(matchTag("ZH-HANS", NINE)).toBe("zh-Hans");
    expect(matchTag("zh-hant", NINE)).toBe("zh-Hant");
  });

  it("knows which script a Chinese region writes in", () => {
    expect(matchTag("zh-CN", NINE)).toBe("zh-Hans");
    expect(matchTag("zh-SG", NINE)).toBe("zh-Hans");
    expect(matchTag("zh-TW", NINE)).toBe("zh-Hant");
    expect(matchTag("zh-HK", NINE)).toBe("zh-Hant");
  });

  it("falls back to the script that is there when the other isn't", () => {
    expect(matchTag("zh-CN", ["en", "zh-Hant"])).toBe("zh-Hant");
  });

  it("drops a region subtag", () => {
    expect(matchTag("de-CH", NINE)).toBe("de");
    expect(matchTag("en-GB", NINE)).toBe("en");
    expect(matchTag("es-419", NINE)).toBe("es");
  });

  it("widens a bare tag to a script, because it expressed no preference", () => {
    expect(matchTag("zh", NINE)).toBe("zh-Hans");
    // First in the given order wins, so the caller's order is the preference.
    expect(matchTag("zh", ["zh-Hant", "zh-Hans"])).toBe("zh-Hant");
  });

  it("never crosses a script boundary", () => {
    // Both directions are wrong answers rather than approximate ones. Romaji
    // resolves to the English name instead, which the caller reaches by falling
    // through — see `resolveStr`.
    expect(matchTag("ja-Latn", ["en", "ja"])).toBeUndefined();
    expect(matchTag("ja", ["en", "ja-Latn"])).toBeUndefined();
  });

  it("gives up rather than guess", () => {
    expect(matchTag("ru", NINE)).toBeUndefined();
    expect(matchTag("pt-BR", NINE)).toBeUndefined();
  });
});

describe("tagChip", () => {
  const NINE = ["de", "en", "es", "fr", "it", "ja", "ko", "zh-Hans", "zh-Hant"];

  it("is the base language where that is already unique", () => {
    expect(tagChip("de", NINE)).toBe("DE");
    expect(tagChip("ja", NINE)).toBe("JA");
  });

  it("takes one letter more only where two tags share a base", () => {
    expect(tagChip("zh-Hans", NINE)).toBe("ZHS");
    expect(tagChip("zh-Hant", NINE)).toBe("ZHT");
  });

  it("drops the script once it is the only one of its language", () => {
    // Nothing to tell apart, so nothing to spell out.
    expect(tagChip("zh-Hans", ["en", "zh-Hans"])).toBe("ZH");
  });
});

describe("splitName", () => {
  it("leaves a plain name whole", () => {
    expect(splitName("Koreanisch")).toEqual(["Koreanisch", ""]);
  });

  it("splits a qualifier off, keeping the space with it", () => {
    // The locale glues the two back together around whatever ending it needs, so
    // the tail has to carry its own separator.
    expect(splitName("Chinesisch (vereinfacht)")).toEqual(["Chinesisch", " (vereinfacht)"]);
  });
});
