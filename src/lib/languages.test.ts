import { describe, expect, it } from "vitest";
import { langSupport } from "./languages";
import type { TopicSummary } from "./types";

const topic = (fields: Partial<TopicSummary>): TopicSummary => ({
  id: "t",
  title: "T",
  icon: null,
  category: "",
  path: "t.json",
  groupCount: 1,
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
