import { describe, expect, it } from "vitest";
import { COLOR_SHADES, CSS_COLORS } from "./colors";
import { parseMarkup, plainText, SPANS } from "./markup";

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

  it("reads a {b}bold{/b} run and the text around it", () => {
    expect(parseMarkup("use both {b}and{/b} more")).toEqual([
      { kind: "text", text: "use both " },
      { kind: "span", names: ["b"], text: "and" },
      { kind: "text", text: " more" },
    ]);
  });

  it("reads an {i}italic{/i} run", () => {
    expect(parseMarkup("{i}All{/i} variants")).toEqual([
      { kind: "span", names: ["i"], text: "All" },
      { kind: "text", text: " variants" },
    ]);
  });

  it("interleaves emphasis with a link and a break", () => {
    const parts = parseMarkup("{b}a{/b} [x](https://x.example){br}{i}b{/i}");
    expect(parts.map((p) => p.kind)).toEqual(["span", "text", "link", "br", "span"]);
  });

  it("reads a {code}code{/code} run", () => {
    expect(parseMarkup("a {code}({/code}-{code}){/code} pair")).toEqual([
      { kind: "text", text: "a " },
      { kind: "span", names: ["code"], text: "(" },
      { kind: "text", text: "-" },
      { kind: "span", names: ["code"], text: ")" },
      { kind: "text", text: " pair" },
    ]);
  });

  it("reads every alias as its span's canonical name", () => {
    for (const s of SPANS)
      for (const n of [s.name, ...s.aliases])
        expect(parseMarkup(`{${n}}x{/${n}}`)).toEqual([{ kind: "span", names: [s.name], text: "x" }]);
  });

  it("leaves a span closed under a different name literal", () => {
    expect(parseMarkup("{b}x{/i}")).toEqual([{ kind: "text", text: "{b}x{/i}" }]);
    expect(parseMarkup("{b}x{/bold}")).toEqual([{ kind: "text", text: "{b}x{/bold}" }]);
  });

  it("gives every span name to one span only, and none to a colour or shade", () => {
    const names = SPANS.flatMap((s) => [s.name, ...s.aliases]);
    expect(new Set(names).size).toBe(names.length);
    expect(names.filter((n) => CSS_COLORS.has(n) || n in COLOR_SHADES)).toEqual([]);
  });

  describe("colours", () => {
    it("colours the text", () => {
      expect(parseMarkup("{red}x{/red}")).toEqual([{ kind: "span", names: [], color: "red", text: "x" }]);
    });
    it("marks with a background colour", () => {
      expect(parseMarkup("{mark yellow}x{/mark yellow}")).toEqual([
        { kind: "span", names: ["mark"], bg: "yellow", text: "x" },
      ]);
    });
    it("combines text colour, mark background and further spans in one tag", () => {
      expect(parseMarkup("{green mark cyan}x{/green mark cyan}")).toEqual([
        { kind: "span", names: ["mark"], color: "green", bg: "cyan", text: "x" },
      ]);
      expect(parseMarkup("{b red u}x{/b red u}")).toEqual([
        { kind: "span", names: ["b", "u"], color: "red", text: "x" },
      ]);
    });
    it("shades a colour lighter or darker, leaving the mixing to the browser", () => {
      expect(parseMarkup("{mark light green}x{/mark light green}")).toEqual([
        { kind: "span", names: ["mark"], bg: "color-mix(in srgb, green, white 50%)", text: "x" },
      ]);
      expect(parseMarkup("{dark red}x{/dark red}")[0]).toMatchObject({ color: "color-mix(in srgb, red, black 40%)" });
    });
    it("reads a lone light / dark as that theme's text colour, for text only", () => {
      expect(parseMarkup("{light mark red}x{/light mark red}")).toEqual([
        { kind: "span", names: ["mark"], color: COLOR_SHADES.light.text, bg: "red", text: "x" },
      ]);
      expect(parseMarkup("{dark}x{/dark}")[0]).toMatchObject({ color: COLOR_SHADES.dark.text });
      // As a background it would read as the opposite of its word, so it isn't one.
      expect(parseMarkup("{mark light}x{/mark light}")).toEqual([
        { kind: "span", names: ["mark"], color: COLOR_SHADES.light.text, text: "x" },
      ]);
    });
    it("leaves unknown words, two text colours or a repeated span literal", () => {
      for (const t of ["{blurple}x{/blurple}", "{red blue}x{/red blue}", "{b b}x{/b b}", "{light dark}x{/light dark}"])
        expect(parseMarkup(t)).toEqual([{ kind: "text", text: t }]);
    });
    it("keeps the text of a coloured run in plain text", () => {
      expect(plainText("a {green mark cyan}b{/green mark cyan} c")).toBe("a b c");
    });
  });

  it("drops an empty {b}{/b} span rather than emitting an empty run", () => {
    expect(parseMarkup("a{b}{/b}b")).toEqual([
      { kind: "text", text: "a" },
      { kind: "text", text: "b" },
    ]);
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

    it("leaves an unclosed {b} alone", () => {
      expect(parseMarkup("a {b}bold forever")).toEqual([
        { kind: "text", text: "a {b}bold forever" },
      ]);
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

  it("keeps the text of a bold/italic run and drops the markers", () => {
    expect(plainText("use both {b}and{/b} {i}full{/i} names")).toBe("use both and full names");
  });
});
