// Where a popup goes: one rule set for the tree's panels and notes, the Custom row's
// panels, the local notes and confirms inside them, and the header menus. `place` is
// the geometry, pure and tested; `placement` is the action that measures the page,
// asks `place`, and writes the answer onto the popup.
//
// Horizontally a popup either starts at its frame's left edge (a row's panels and notes:
// the frame is the Topics column, so a box covers the column's content completely or not
// at all) and keeps its right edge from ending left of its trigger, or it hangs leftward
// from its trigger's right edge (a note inside a panel, a header menu). Either way it is
// as wide as its content, up to a cap, and stays inside the viewport; a scrollbar is
// added to that width rather than taken from the content.
//
// Vertically it opens towards the side with more room, or prefers above (confirmations,
// which want to hold still), or always below (the header menus), and keeps that side
// until it closes. It is as tall as its content, up to half the viewport, and scrolls
// inside beyond that. While the page scrolls it rides along with its anchor but stops at
// the viewport's edges, so it never leaves the screen while open.

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export type Horizontal = "frame-left" | "trigger-right";
export type Vertical = "more-room" | "prefer-above" | "below";

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
  /** Width beyond the cap, for a scrollbar: it widens the popup to the right. */
  extraWidth?: number;
  /** The side chosen when it opened; once set, kept. */
  locked?: boolean;
  /** Space between the popup and its anchor, and kept to the viewport's edges. */
  gap: number;
  gutter: number;
}

export interface Placement {
  /** Viewport x of the popup's left edge, and the width it may take. */
  left: number;
  maxWidth: number;
  above: boolean;
  /** Viewport y of the popup's top edge, kept inside the viewport. */
  top: number;
  maxHeight: number;
}

export function place(input: PlaceInput): Placement {
  const { frame, trigger, anchor, size, viewport: vp, gap, gutter } = input;

  const caps = [vp.width - 2 * gutter];
  if (frame) caps.push(frame.right - frame.left);
  if (input.maxWidth !== undefined) caps.push(input.maxWidth);
  const maxWidth = Math.max(0, Math.min(...caps)) + (input.extraWidth ?? 0);
  const width = Math.min(size.width, maxWidth);
  // Placed by its content's width: a scrollbar is added on the right, so the content
  // stays where it was when one appears.
  const content = width - Math.min(input.extraWidth ?? 0, width);
  let left =
    input.horizontal === "frame-left" && frame
      ? Math.max(frame.left, trigger.right - content)
      : trigger.right - content;
  left = Math.max(gutter, Math.min(left, vp.width - gutter - width));

  const floor = vp.height - vp.bottomInset - gutter;
  const roomBelow = floor - anchor.bottom - gap;
  const roomAbove = anchor.top - gap - gutter;
  let up: boolean;
  if (input.locked !== undefined) up = input.locked;
  else if (input.vertical === "below") up = false;
  else if (input.vertical === "prefer-above") {
    // Above unless it doesn't fit there while its anchor sits high on the screen.
    const high = (anchor.top + anchor.bottom) / 2 < vp.height / 2;
    up = !(size.height > roomAbove && high);
  } else up = roomAbove > roomBelow;

  // On opening, also no taller than its side has room for, so it doesn't cover its anchor.
  // Once open it rides the page scroll and stops at the edges, so half the viewport is
  // the only cap left.
  const half = vp.height / 2;
  const room = up ? roomAbove : roomBelow;
  const maxHeight = Math.max(0, input.locked === undefined ? Math.min(half, room) : half);

  const height = Math.min(size.height, maxHeight);
  const natural = up ? anchor.top - gap - height : anchor.bottom + gap;
  const top = Math.max(gutter, Math.min(natural, floor - height));

  return { left, maxWidth, above: up, top, maxHeight };
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
  /** A width cap in px, for a popup that has no frame. */
  maxWidth?: number;
  /** Keep the width it opened with while it is open. Switching the interface language
   *  rewrites a menu's labels, and a box sized to them would jump under the cursor using
   *  it; a resize of the viewport releases it, since that is a real layout change. */
  holdWidth?: boolean;
  /** Whether it scrolls inside past half the viewport. A header menu doesn't: what it
   *  holds (a dropdown list, a note, the ⚠️ tab) reaches out of it, and a scroll area
   *  would clip all of that. */
  scroll?: boolean;
  /** Told where it went, for a popup whose look depends on the side (an arrow, a margin). */
  onPlace?: (p: Placement) => void;
}

const GAP = 4;
const GUTTER = 8;

/** A box that opens off a tree row: framed by the Topics column (or by the menu it sits
 *  in), opening above or below the whole row item, towards the side with more room. */
export function rowPopup(trigger: Element | null | undefined): PlacementOptions {
  return { trigger, anchor: "container", frame: "auto", horizontal: "frame-left", vertical: "more-room" };
}

/** A panel opened by a button on the Custom row: framed by the Topics column like a
 *  row's, but opening off the button itself. */
export function controlPopup(trigger: Element | null | undefined): PlacementOptions {
  return { trigger, frame: "auto", horizontal: "frame-left", vertical: "more-room" };
}

/** A note inside a panel (a 🔍, a 👎): hung leftward from its marker, as wide as the
 *  Topics column at most, towards the side with more room. Fixed, so a scrolling panel
 *  doesn't clip it. */
export function localNote(trigger: Element | null | undefined): PlacementOptions {
  return { trigger, frame: "auto", horizontal: "trigger-right", vertical: "more-room" };
}

/** A confirmation: like a local note, but above its button unless that fails high on the
 *  page — it carries consequences, so it holds as still as it can. */
export function confirmPopup(trigger: Element | null | undefined): PlacementOptions {
  return { ...localNote(trigger), vertical: "prefer-above" };
}

/** A header menu or the list a field in it opens: hung leftward from its button, always
 *  below it, `maxWidthRem` wide at most. */
export function menuPopup(
  trigger: Element | null | undefined,
  { maxWidthRem, menu = false }: { maxWidthRem?: number; menu?: boolean } = {},
): PlacementOptions {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return {
    trigger,
    horizontal: "trigger-right",
    vertical: "below",
    maxWidth: maxWidthRem === undefined ? undefined : maxWidthRem * rem,
    holdWidth: menu,
    scroll: !menu,
  };
}

/** Place a popup and keep it placed while it is open: in full on mount, whenever it or
 *  the Topics column changes size, and on a window resize; on a page scroll only its
 *  vertical position, to keep it on screen. Works for `position: absolute` (coordinates
 *  relative to its containing block) and `position: fixed` (relative to the viewport). */
export function placement(node: HTMLElement, options: PlacementOptions) {
  let opts = options;
  let raf = 0;
  let scrollRaf = 0;
  /** The side it opened on, kept until it closes. */
  let locked: boolean | undefined;
  /** Whether a scrollbar has shown up: its room stays reserved (`scrollbar-gutter`) so
   *  the content doesn't rewrap as it comes and goes. Released on a change of the
   *  viewport's width while there's nothing to scroll. */
  let gutter = false;
  let viewportWidth = window.innerWidth;
  let last: Placement | null = null;
  /** The size `run` left the popup at, so the observer can tell its own doing apart. */
  let settled = { width: -1, height: -1 };
  /** The width a `holdWidth` popup opened with; null until it has opened. */
  let held: number | null = null;

  const rect = (el: Element): Box => el.getBoundingClientRect();
  const env = () => {
    const root = getComputedStyle(document.documentElement);
    const rem = parseFloat(root.fontSize) || 16;
    const footer = (parseFloat(root.getPropertyValue("--footer-h")) || 0) * rem;
    return { width: window.innerWidth, height: window.innerHeight, bottomInset: footer };
  };
  const anchorOf = (trigger: Element) =>
    opts.anchor === "container" ? (node.offsetParent ?? trigger) : (opts.anchor ?? trigger);

  // Into the containing block's coordinates: the viewport for a fixed popup, else the
  // positioned ancestor's padding box. A side that opened above is held by its bottom, so
  // the box grows away from its anchor as content arrives.
  const writeVertical = (p: Placement, height: number) => {
    const fixed = getComputedStyle(node).position === "fixed";
    const cb = fixed ? null : (node.offsetParent as HTMLElement | null);
    const cbTop = cb ? cb.getBoundingClientRect().top + cb.clientTop : 0;
    const cbHeight = cb ? cb.clientHeight : window.innerHeight;
    const top = p.top - cbTop;
    node.style.top = p.above ? "auto" : `${Math.round(top)}px`;
    node.style.bottom = p.above ? `${Math.round(cbHeight - top - height)}px` : "auto";
  };

  const run = () => {
    raf = 0;
    const trigger = opts.trigger;
    if (!trigger) return;
    const frameEl =
      opts.frame === "auto"
        ? (node.parentElement?.closest("[data-popup-frame]") ?? document.querySelector(".col-topics"))
        : opts.frame;
    const vp = env();
    if (vp.width !== viewportWidth) {
      viewportWidth = vp.width;
      held = null;
      if (gutter && node.scrollHeight <= node.clientHeight + 1) gutter = false;
    }
    const scroll = opts.scroll ?? true;
    node.style.scrollbarGutter = gutter ? "stable" : "";
    const input: PlaceInput = {
      frame: frameEl ? rect(frameEl) : undefined,
      trigger: rect(trigger),
      anchor: rect(anchorOf(trigger)),
      size: { width: 0, height: 0 },
      viewport: vp,
      horizontal: opts.horizontal,
      vertical: opts.vertical,
      maxWidth: opts.maxWidth,
      locked,
      gap: GAP,
      gutter: GUTTER,
    };
    // The cap first, since it doesn't depend on the size, widened by the scrollbar's room
    // where there is one; then the size the content takes under it; then the rest.
    Object.assign(node.style, {
      width: held === null ? "max-content" : `${held}px`,
      maxHeight: "none",
      left: "0px",
      right: "auto",
    });
    const cs = getComputedStyle(node);
    const bar = gutter
      ? node.offsetWidth - node.clientWidth - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth)
      : 0;
    input.extraWidth = bar;
    node.style.maxWidth = `${place(input).maxWidth}px`;
    const own = node.getBoundingClientRect();
    if (opts.holdWidth && held === null) held = own.width;
    const p = place({ ...input, size: { width: own.width, height: own.height } });
    locked = p.above;
    last = p;

    const fixed = cs.position === "fixed";
    const cb = fixed ? null : (node.offsetParent as HTMLElement | null);
    const cbLeft = cb ? cb.getBoundingClientRect().left + cb.clientLeft : 0;
    node.style.left = `${Math.round(p.left - cbLeft)}px`;
    node.style.maxHeight = scroll ? `${Math.floor(p.maxHeight)}px` : "";
    node.style.overflowY = scroll ? "auto" : "";
    writeVertical(p, scroll ? Math.min(own.height, p.maxHeight) : own.height);
    opts.onPlace?.(p);

    // A scrollbar that just appeared gets its room in this same pass, before anything
    // is painted without it.
    if (scroll && !gutter && node.scrollHeight > node.clientHeight + 1) {
      gutter = true;
      run();
      return;
    }
    settled = { width: node.offsetWidth, height: node.offsetHeight };
  };

  // A page scroll moves the anchor; only the vertical position follows, clamped to the
  // viewport by `place`. Nothing about the size changes, so nothing is re-measured.
  const follow = () => {
    scrollRaf = 0;
    const trigger = opts.trigger;
    if (!trigger || !last) return;
    const height = node.getBoundingClientRect().height;
    const p = place({
      trigger: rect(trigger),
      anchor: rect(anchorOf(trigger)),
      size: { width: 0, height },
      viewport: env(),
      horizontal: opts.horizontal,
      vertical: opts.vertical,
      locked,
      gap: GAP,
      gutter: GUTTER,
    });
    writeVertical({ ...last, top: p.top }, height);
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(run);
  };
  const onScroll = () => {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(follow);
  };

  // Placed at once, before the first paint, so it never shows where it isn't going to be.
  run();
  // Resize notes arrive after layout but before paint, so placing right there means a
  // change of content (a scrollbar appearing, new options) is never shown unplaced. The
  // popup's own settled size is skipped: that is `run`'s doing, not a change.
  const ro = new ResizeObserver((entries) => {
    const own = entries.every(
      (e) => e.target === node && node.offsetWidth === settled.width && node.offsetHeight === settled.height,
    );
    if (!own) run();
  });
  const observe = () => {
    ro.disconnect();
    ro.observe(node);
    const col = document.querySelector(".col-topics");
    if (col) ro.observe(col);
    // A held menu stays under its button when the button moves: the Copy button beside
    // the ⚙️ changes width with its "Copied!", which shifts the ⚙️ and the 🌐 with it.
    const around = opts.holdWidth ? opts.trigger?.parentElement?.parentElement : null;
    if (around) ro.observe(around);
  };
  observe();
  window.addEventListener("resize", schedule);
  window.addEventListener("scroll", onScroll, { passive: true });

  return {
    update(next: PlacementOptions) {
      // A different trigger is a different opening: it chooses its side afresh.
      if (next.trigger !== opts.trigger) {
        locked = undefined;
        gutter = false;
        held = null;
      }
      opts = next;
      observe();
      schedule();
    },
    destroy() {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
    },
  };
}
