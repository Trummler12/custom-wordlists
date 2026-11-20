import { describe, expect, it } from "vitest";
import { fitSeparator, stripSeparator } from "./separator";

describe("stripSeparator", () => {
  it("drops the separator and collapses the spaces around it", () => {
    expect(stripSeparator("Moroni, Comoros", ",")).toBe("Moroni Comoros");
    expect(stripSeparator("10,000,000 Volt Thunderbolt", ",")).toBe("10000000 Volt Thunderbolt");
  });
});

describe("fitSeparator", () => {
  const rules = { sep: ",", remove: true, omit: false };

  it("leaves a name without the separator alone", () => {
    expect(fitSeparator("Moroni", rules)).toBe("Moroni");
    expect(fitSeparator("Moroni", { ...rules, omit: true })).toBe("Moroni");
  });

  it("strips the separator while the reader has it removed", () => {
    expect(fitSeparator("Moroni, Comoros", rules)).toBe("Moroni Comoros");
  });

  it("keeps the name as it is while nothing is removed", () => {
    expect(fitSeparator("Moroni, Comoros", { ...rules, remove: false })).toBe("Moroni, Comoros");
  });

  it("drops the name while the list leaves such names out", () => {
    expect(fitSeparator("Moroni, Comoros", { ...rules, omit: true })).toBeNull();
  });

  it("drops a name that was nothing but separators", () => {
    expect(fitSeparator(",", rules)).toBeNull();
  });
});
