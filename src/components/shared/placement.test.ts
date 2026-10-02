import { describe, expect, it } from "vitest";
import { place, type PlaceInput } from "./placement";

const box = (left: number, top: number, right: number, bottom: number) => ({ left, top, right, bottom });

// A 1000 × 800 viewport with a 30px footer; the Topics column runs from 100 to 500.
const base: PlaceInput = {
  frame: { left: 100, right: 500 },
  trigger: box(300, 200, 320, 220),
  anchor: box(100, 190, 500, 230),
  size: { width: 150, height: 100 },
  viewport: { width: 1000, height: 800, bottomInset: 30 },
  horizontal: "frame-left",
  vertical: "half",
  gap: 4,
  gutter: 8,
};

describe("place, horizontally", () => {
  it("starts a row popup at the frame's left edge, as wide as its content", () => {
    const p = place({ ...base, trigger: box(120, 200, 140, 220) });
    expect(p.left).toBe(100);
    expect(p.maxWidth).toBe(400);
  });

  it("keeps its right edge from ending left of the trigger's", () => {
    expect(place(base).left).toBe(320 - 150);
  });

  it("never lets it grow past the frame", () => {
    const p = place({ ...base, size: { width: 900, height: 100 } });
    expect(p.left).toBe(100);
    expect(p.maxWidth).toBe(400);
  });

  it("hangs a note leftward from its trigger, sliding right where the left runs out", () => {
    expect(place({ ...base, horizontal: "trigger-right" }).left).toBe(170);
    const tight = place({ ...base, horizontal: "trigger-right", trigger: box(40, 200, 60, 220) });
    expect(tight.left).toBe(8);
  });

  it("caps a frameless popup by its own maximum and the viewport", () => {
    const p = place({ ...base, frame: undefined, horizontal: "trigger-right", maxWidth: 320, size: { width: 2000, height: 100 } });
    expect(p.maxWidth).toBe(320);
  });
});

describe("place, vertically", () => {
  it("opens below an anchor in the upper half, capped to the room down to the footer", () => {
    const p = place(base);
    expect(p.above).toBe(false);
    expect(p.edge).toBe(234);
    expect(p.maxHeight).toBe(800 - 30 - 230 - 4 - 8);
  });

  it("opens above an anchor in the lower half", () => {
    const p = place({ ...base, anchor: box(100, 600, 500, 640) });
    expect(p.above).toBe(true);
    expect(p.edge).toBe(596);
    expect(p.maxHeight).toBe(600 - 4 - 8);
  });

  it("puts a confirmation above whenever it fits there, even high on the page", () => {
    expect(place({ ...base, vertical: "prefer-above" }).above).toBe(true);
  });

  it("puts it below only where above is both too small and the smaller side", () => {
    const high = box(100, 60, 500, 100);
    expect(place({ ...base, vertical: "prefer-above", anchor: high }).above).toBe(false);
  });

  it("always opens a header menu below", () => {
    expect(place({ ...base, vertical: "below", anchor: box(100, 600, 500, 640) }).above).toBe(false);
  });
});
