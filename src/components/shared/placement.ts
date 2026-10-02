// Where a popup goes: one rule set for the tree's panels and notes, the Custom row's
// panels, the local notes and confirms inside them, and the header menus. `place` is
// the geometry, pure and tested; `placement` is the action that measures the page,
// asks `place`, and writes the answer onto the popup.
//
// Horizontally a popup either starts at its frame's left edge (a row's panels and notes:
// the frame is the Topics column, so a box covers the column's content completely or not
// at all) and keeps its right edge from ending left of its trigger, or it hangs leftward
// from its trigger's right edge (a note inside a panel, a header menu). Either way it is
// as wide as its content, up to a cap, and stays inside the viewport. Vertically it opens
// towards the larger half of the viewport, or prefers above (confirmations, which want to
// hold still), or always below (the header menus), and its height is capped to the room
// on that side so it scrolls inside rather than off-screen.

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export type Horizontal = "frame-left" | "trigger-right";
export type Vertical = "half" | "prefer-above" | "below";

export interface PlaceInput {
  /** The popup's horizontal bounds; its width also caps the popup's. */
  frame?: { left: number; right: number };
  /** Horizontal reference: the control that opened the popup. */
  trigger: Box;
  /** Vertical reference: what the popup opens above or below. A row's popups open off
   *  the whole row item; a note off its marker. */
  anchor: Box;
  /** The popup's own size, as wide as its content. */
  size: { width: number; height: number };
  viewport: { width: number; height: number; bottomInset: number };
  horizontal: Horizontal;
  vertical: Vertical;
  /** An extra width cap, for a popup that has no frame. */
  maxWidth?: number;
  /** Space between the popup and its anchor, and kept to the viewport's edges. */
  gap: number;
  gutter: number;
}

export interface Placement {
  /** Viewport x of the popup's left edge, and the width it may take. */
  left: number;
  maxWidth: number;
  above: boolean;
  /** Viewport y of the edge that faces the anchor: the top when below, the bottom when
   *  above. */
  edge: number;
  maxHeight: number;
}

export function place(input: PlaceInput): Placement {
  const { frame, trigger, anchor, size, viewport: vp, gap, gutter } = input;

  const caps = [vp.width - 2 * gutter];
  if (frame) caps.push(frame.right - frame.left);
  if (input.maxWidth !== undefined) caps.push(input.maxWidth);
  const maxWidth = Math.max(0, Math.min(...caps));
  const width = Math.min(size.width, maxWidth);
  let left =
    input.horizontal === "frame-left" && frame
      ? Math.max(frame.left, trigger.right - width)
      : trigger.right - width;
  left = Math.max(gutter, Math.min(left, vp.width - gutter - width));

  const below = vp.height - vp.bottomInset - anchor.bottom - gap - gutter;
  const above = anchor.top - gap - gutter;
  const up =
    input.vertical === "below"
      ? false
      : input.vertical === "prefer-above"
        ? size.height <= above || above >= below
        : anchor.bottom > vp.height / 2;

  return {
    left,
    maxWidth,
    above: up,
    edge: up ? anchor.top - gap : anchor.bottom + gap,
    maxHeight: Math.max(0, up ? above : below),
  };
}

export interface PlacementOptions {
  /** The control that opened the popup. */
  trigger: Element | null | undefined;
  /** What it opens above or below: the trigger when left out, or `"container"` for the
   *  positioned element it lives in (a tree row's item). */
  anchor?: Element | null | "container";
  /** The element bounding it horizontally; none for a header menu. `"auto"`: the menu it
   *  sits in, if it marks itself `data-popup-frame`, else the Topics column. */
  frame?: Element | null | "auto";
  horizontal: Horizontal;
  vertical: Vertical;
  maxWidth?: number;
  /** Told where it went, for a popup whose look depends on the side (an arrow, a margin). */
  onPlace?: (p: Placement) => void;
}

const GAP = 4;
const GUTTER = 8;

/** A box that opens off a tree row: framed by the Topics column (or by the menu it sits
 *  in), opening above or below the whole row item, towards the larger half. */
export function rowPopup(trigger: Element | null | undefined): PlacementOptions {
  return { trigger, anchor: "container", frame: "auto", horizontal: "frame-left", vertical: "half" };
}

/** Place a popup and keep it placed while it is open: on mount, whenever it, its frame or
 *  its anchor changes size, and on a window resize — not on a page scroll, which an
 *  absolute popup rides along with anyway. Works for `position: absolute` (coordinates
 *  relative to its containing block) and `position: fixed` (relative to the viewport). */
export function placement(node: HTMLElement, options: PlacementOptions) {
  let opts = options;
  let raf = 0;

  const rect = (el: Element): Box => el.getBoundingClientRect();
  const run = () => {
    raf = 0;
    const trigger = opts.trigger;
    if (!trigger) return;
    const fixed = getComputedStyle(node).position === "fixed";
    const anchor = opts.anchor === "container" ? (node.offsetParent ?? trigger) : (opts.anchor ?? trigger);
    const frameEl =
      opts.frame === "auto"
        ? (node.parentElement?.closest("[data-popup-frame]") ?? document.querySelector(".col-topics"))
        : opts.frame;
    const footer = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--footer-h")) || 0;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const input: PlaceInput = {
      frame: frameEl ? rect(frameEl) : undefined,
      trigger: rect(trigger),
      anchor: rect(anchor),
      size: { width: 0, height: 0 },
      viewport: { width: window.innerWidth, height: window.innerHeight, bottomInset: footer * rem },
      horizontal: opts.horizontal,
      vertical: opts.vertical,
      maxWidth: opts.maxWidth,
      gap: GAP,
      gutter: GUTTER,
    };
    // The cap first, since it doesn't depend on the size; then the size the content takes
    // under that cap, unclipped; then everything else.
    const cap = place(input).maxWidth;
    Object.assign(node.style, {
      width: "max-content",
      maxWidth: `${cap}px`,
      maxHeight: "none",
      left: "0px",
      right: "auto",
    });
    const own = node.getBoundingClientRect();
    const p = place({ ...input, size: { width: own.width, height: own.height } });

    // Into the containing block's coordinates: the viewport for a fixed popup, else the
    // positioned ancestor's padding box.
    const cb = fixed ? null : (node.offsetParent as HTMLElement | null);
    const cbBox = cb ? cb.getBoundingClientRect() : { left: 0, top: 0, bottom: window.innerHeight };
    const inset = cb ? { left: cb.clientLeft, top: cb.clientTop } : { left: 0, top: 0 };
    const cbHeight = cb ? cb.clientHeight : window.innerHeight;
    Object.assign(node.style, {
      left: `${Math.round(p.left - cbBox.left - inset.left)}px`,
      top: p.above ? "auto" : `${Math.round(p.edge - cbBox.top - inset.top)}px`,
      bottom: p.above ? `${Math.round(cbHeight - (p.edge - cbBox.top - inset.top))}px` : "auto",
      maxHeight: `${Math.floor(p.maxHeight)}px`,
      overflowY: "auto",
    });
    opts.onPlace?.(p);
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(run);
  };

  // Placed at once, before the first paint, so it never shows where it isn't going to be.
  run();
  const ro = new ResizeObserver(schedule);
  // The popup's own size and the column's: a resize of either moves it. The anchor's is
  // covered by the window resize and by the popup re-rendering.
  const observe = () => {
    ro.disconnect();
    ro.observe(node);
    const col = document.querySelector(".col-topics");
    if (col) ro.observe(col);
  };
  observe();
  window.addEventListener("resize", schedule);

  return {
    update(next: PlacementOptions) {
      opts = next;
      observe();
      schedule();
    },
    destroy() {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    },
  };
}
