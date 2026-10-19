import { describe, expect, it } from "vitest";
import { nameLanding, numberLanding, parseJump } from "./jump";

describe("parseJump", () => {
  it("reads a number, thousands separators and all", () => {
    expect(parseJump(" 12 ")).toEqual({ kind: "number", value: 12 });
    expect(parseJump("1'000")).toEqual({ kind: "number", value: 1000 });
    expect(parseJump("1,000,000")).toEqual({ kind: "number", value: 1000000 });
  });

  it("reads anything else as a name", () => {
    expect(parseJump("Germany")).toEqual({ kind: "name", text: "Germany" });
    expect(parseJump("Area 51")).toEqual({ kind: "name", text: "Area 51" });
  });

  it("has nothing to go to for an empty field", () => {
    expect(parseJump("  ")).toBeNull();
  });
});

describe("nameLanding", () => {
  const items = ["Austria", "Belgium", "Chile", "Denmark"].map((name, i) => ({ qid: `Q${i}`, name }));

  it("finds the item itself", () => {
    expect(nameLanding(items, "chile")).toBe(2);
  });

  it("lands where a missing name would sort", () => {
    expect(nameLanding(items, "Bolivia")).toBe(2);
  });

  it("stays on the last item past the end", () => {
    expect(nameLanding(items, "Zambia")).toBe(3);
  });
});

describe("numberLanding", () => {
  const items = [900, 500, 100, 10].map((num, i) => ({ qid: `Q${i}`, num }));

  it("lands on the first item at or below the value", () => {
    expect(numberLanding(items, 500)).toBe(1);
    expect(numberLanding(items, 300)).toBe(2);
    expect(numberLanding(items, 5000)).toBe(0);
  });

  it("stays on the last item below the smallest", () => {
    expect(numberLanding(items, 1)).toBe(3);
  });
});
