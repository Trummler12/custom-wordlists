import { describe, expect, it } from "vitest";
import { keepsForm, lengthClass, limitsOf, type LengthRules } from "./lengths";

const limits = { min: 3, max: 10 };
const script = { min: 2, max: 10 };

describe("lengthClass", () => {
  it("sorts a name under, over or within its limits", () => {
    expect(lengthClass("Wu", limits)).toBe("short");
    expect(lengthClass("Wurmple", limits)).toBe(null);
    expect(lengthClass("Thunderbolt", limits)).toBe("long");
  });
});

describe("limitsOf", () => {
  it("gives a name in a syllabic script its list's script limits", () => {
    expect(limitsOf("珍珠", { limits, script })).toBe(script);
    expect(limitsOf("진주", { limits, script })).toBe(script);
    expect(limitsOf("ピィ", { limits, script })).toBe(script);
  });

  it("keeps Latin names in such a list on the general limits", () => {
    expect(limitsOf("Py", { limits, script })).toBe(limits);
  });

  it("uses the general limits where the list language has none", () => {
    expect(limitsOf("珍珠", { limits })).toBe(limits);
  });
});

describe("keepsForm", () => {
  const rules: LengthRules = { limits, script, short: true, long: true };

  it("drops what a rule in force catches", () => {
    expect(keepsForm("Wu", rules)).toBe(false);
    expect(keepsForm("Thunderbolt", rules)).toBe(false);
    expect(keepsForm("珍珠", rules)).toBe(true);
  });

  it("keeps it once the reader has switched that rule off", () => {
    expect(keepsForm("Wu", { ...rules, short: false })).toBe(true);
    expect(keepsForm("Thunderbolt", { ...rules, long: false })).toBe(true);
  });
});
