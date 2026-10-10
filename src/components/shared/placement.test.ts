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
  vertical: "more-room",
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

  it("widens it to the right by a scrollbar's room instead of narrowing the content", () => {
    const p = place({ ...base, size: { width: 900, height: 100 }, extraWidth: 15 });
    expect(p.left).toBe(100);
    expect(p.maxWidth).toBe(415);
  });

  it("adds a scrollbar on the right of a popup hanging under its trigger, not the left", () => {
    const p = place({ ...base, size: { width: 165, height: 100 }, extraWidth: 15 });
    expect(p.left).toBe(320 - 150);
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
  it("opens towards the side with more room", () => {
    expect(place(base).above).toBe(false);
    expect(place({ ...base, anchor: box(100, 600, 500, 640) }).above).toBe(true);
  });

  it("sits right below its anchor, or right above it", () => {
    expect(place(base).top).toBe(234);
    expect(place({ ...base, anchor: box(100, 600, 500, 640) }).top).toBe(600 - 4 - 100);
  });

  it("is never taller than half the viewport", () => {
    expect(place({ ...base, anchor: box(100, 20, 500, 40) }).maxHeight).toBe(400);
  });

  it("on opening, is also no taller than its side has room for", () => {
    const p = place({ ...base, anchor: box(100, 300, 500, 380) });
    expect(p.above).toBe(false);
    expect(p.maxHeight).toBe(800 - 30 - 8 - 380 - 4);
  });

  it("keeps the side it opened on", () => {
    expect(place({ ...base, anchor: box(100, 600, 500, 640), locked: false }).above).toBe(false);
  });

  it("stops at the viewport's edges when its anchor scrolls away", () => {
    const gone = box(100, -500, 500, -460);
    expect(place({ ...base, anchor: gone, locked: false }).top).toBe(8);
    const below = box(100, 1500, 500, 1540);
    expect(place({ ...base, anchor: below, locked: true }).top).toBe(800 - 30 - 8 - 100);
  });

  it("puts a confirmation above, even high on the page, as long as it fits there", () => {
    expect(place({ ...base, vertical: "prefer-above" }).above).toBe(true);
  });

  it("puts it below only where it doesn't fit above and its anchor sits high", () => {
    const high = box(100, 60, 500, 100);
    expect(place({ ...base, vertical: "prefer-above", anchor: high }).above).toBe(false);
    const lowButCramped = { ...base, vertical: "prefer-above" as const, anchor: box(100, 600, 500, 640), size: { width: 150, height: 700 } };
    expect(place(lowButCramped).above).toBe(true);
  });

  it("always opens a header menu below", () => {
    expect(place({ ...base, vertical: "below", anchor: box(100, 600, 500, 640) }).above).toBe(false);
  });
});
