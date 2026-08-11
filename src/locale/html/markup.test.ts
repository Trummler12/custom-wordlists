import { describe, expect, it } from "vitest";
import { parseMarkup, plainText } from "./markup";

describe("parseMarkup", () => {
  it("returns plain text as one part", () => {
    expect(parseMarkup("Just words")).toEqual([{ kind: "text", text: "Just words" }]);
  });

  it("splits on {br}", () => {
    expect(parseMarkup("One{br}Two")).toEqual([
      { kind: "text", text: "One" },
      { kind: "br" },
      { kind: "text", text: "Two" },
    ]);
  });

  it("keeps an empty run from producing an empty text part", () => {
    expect(parseMarkup("{br}After")).toEqual([{ kind: "br" }, { kind: "text", text: "After" }]);
  });

  it("reads a link, and the text on either side of it", () => {
    expect(parseMarkup("see [PokéWiki](https://www.pokewiki.de/x) for more")).toEqual([
      { kind: "text", text: "see " },
      { kind: "link", text: "PokéWiki", href: "https://www.pokewiki.de/x" },
      { kind: "text", text: " for more" },
    ]);
  });

  it("reads two links on one line as two links", () => {
    const parts = parseMarkup("[a](https://a.example) and [b](https://b.example)");
    expect(parts.filter((p) => p.kind === "link")).toHaveLength(2);
  });

  it("handles {br} between links", () => {
    const parts = parseMarkup("[a](https://a.example){br}[b](https://b.example)");
    expect(parts.map((p) => p.kind)).toEqual(["link", "br", "link"]);
  });

  describe("unsafe or malformed markup stays literal", () => {
    it("refuses a javascript: URL — a data file must not reach the DOM that way", () => {
      const parts = parseMarkup("[click](javascript:alert(1))");
      expect(parts.every((p) => p.kind !== "link")).toBe(true);
      expect(plainText("[click](javascript:alert(1))")).toBe("[click](javascript:alert(1))");
    });

    it("refuses a protocol-relative or relative URL", () => {
      expect(parseMarkup("[a](//evil.example)").every((p) => p.kind !== "link")).toBe(true);
      expect(parseMarkup("[a](/local/path)").every((p) => p.kind !== "link")).toBe(true);
    });

    it("leaves an unclosed bracket alone", () => {
      expect(parseMarkup("[a(https://a.example)")).toEqual([
        { kind: "text", text: "[a(https://a.example)" },
      ]);
    });

    it("leaves bare brackets alone", () => {
      expect(parseMarkup("Rm. [1] Key")).toEqual([{ kind: "text", text: "Rm. [1] Key" }]);
    });
  });
});

describe("plainText", () => {
  it("keeps a link's label and drops its URL", () => {
    expect(plainText("see [PokéWiki](https://www.pokewiki.de/x)")).toBe("see PokéWiki");
  });

  it("turns a line break into a space, so a screen reader reads one sentence", () => {
    expect(plainText("One{br}Two")).toBe("One Two");
  });

  it("leaves a string with no markup untouched", () => {
    expect(plainText("Just words")).toBe("Just words");
  });
});
