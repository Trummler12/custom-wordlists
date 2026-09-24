// Graduated overflow relief for a tree row (§ topic-row layout). CSS alone can't do it: the
// count's alignment blank is a hard `min-width` (so it reliably reserves and lines the column
// up), which by definition can't also shrink; and sliding the count into the column gutter
// "only when tight" is conditional on measured space. So the relief is driven off the row's
// free space — the gap the count's `margin-left: auto` absorbs — and kicks in a little before
// the title would have to clip, giving room back in order:
//   1. shrink the count's blank (down to its digits),
//   2. slide the count into the column gutter, up to the output column's edge,
//   3. (CSS) the title ellipsises with whatever is still missing.
// Reading free space (not just the title's overflow) is what lets step 1 start before the
// title clips at all, and keeps the order blank-then-gutter.
//
// Callers (the row components) schedule a fit on mount, on resize (a ResizeObserver on the
// row), and when content that changes the widths shifts (the count, the name, the language).
// Neither relief touches the row's own border box, so the observer never sees its own effect.

const pending = new Map<HTMLElement, string>(); // row => a selector for its title element
let raf = 0;

/** Queue `row` (whose title matches `titleSelector`) for a fit on the next frame. Fits are
 *  batched so a burst — every row on a resize, say — costs one measure pass, not one each. */
export function scheduleFit(row: HTMLElement, titleSelector: string): void {
  pending.set(row, titleSelector);
  if (!raf) raf = requestAnimationFrame(run);
}

/** Drop a row from the queue (its component is unmounting). */
export function cancelFit(row: HTMLElement): void {
  pending.delete(row);
}

function run(): void {
  raf = 0;
  const rows = [...pending];
  pending.clear();

  const items: { title: HTMLElement; total: HTMLElement | null; meta: HTMLElement | null }[] = [];
  for (const [row, sel] of rows) {
    const title = row.querySelector<HTMLElement>(sel);
    if (title) items.push({ title, total: row.querySelector(".total"), meta: row.querySelector(".meta") });
  }
  if (items.length === 0) return;

  const root = getComputedStyle(document.documentElement);
  const rem = parseFloat(root.fontSize) || 16;
  // The gutter the count may slide into (the layout gap) — only in the two-column layout;
  // stacked there is none, so the title ellipsis carries the shortfall alone.
  const single = window.matchMedia("(max-width: 50rem)").matches;
  const gutterMax = single ? 0 : (parseFloat(root.getPropertyValue("--layout-gap")) || 1.5) * rem;
  // Headroom kept ahead of the clip point, so the title never overflow-hides in the frame
  // before the fit lands. Small — it only has to cover a frame's worth of narrowing.
  const buffer = 0.5 * rem;

  // Back to the rest state (full blank, no gutter) so the measure reads the real free space.
  for (const it of items) {
    if (it.total) it.total.style.minWidth = "";
    if (it.meta) it.meta.style.marginRight = "";
  }
  // Measure at rest: the count's reserve width, the free space ahead of it (its resolved
  // auto-margin), and how far the title already overflows if it does.
  const rest = items.map((it) => ({
    it,
    totalW: it.total ? it.total.clientWidth : 0,
    free: it.meta ? parseFloat(getComputedStyle(it.meta).marginLeft) || 0 : 0,
    deficit: it.title.scrollWidth - it.title.clientWidth,
  }));
  // Each reserve's own digit width — its collapsible blank is the rest width minus this.
  const digit = new Map<HTMLElement, number>();
  for (const it of items) if (it.total) it.total.style.minWidth = "0";
  for (const it of items) if (it.total) digit.set(it.total, it.total.clientWidth);

  // Pressure = how far into the buffer the free space has been eaten, plus any real overflow.
  // Spend it on the blank first, then the gutter; the title clips for whatever is left over.
  for (const { it, totalW, free, deficit } of rest) {
    const pressure = buffer - free + deficit;
    const blankBudget = it.total ? Math.max(0, totalW - (digit.get(it.total) ?? totalW)) : 0;
    const blank = pressure > 0 ? Math.min(pressure, blankBudget) : 0;
    if (it.total) it.total.style.minWidth = blank > 0 ? `${totalW - blank}px` : "";
    const gutter = pressure > 0 ? Math.min(pressure - blank, gutterMax) : 0;
    if (it.meta) it.meta.style.marginRight = gutter > 0 ? `${-gutter}px` : "";
  }
}
