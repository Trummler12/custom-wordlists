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
  // Layout headroom kept ahead of the clip point, so the title never overflow-hides in the
  // frame before the fit lands. `transfer` is the slice of it the reader never sees: banked
  // as gutter and undone by a transform, so the count rests at its natural gap and every
  // visible relief starts only where the title actually meets it. Tune either term.
  const transfer = 1.0 * rem;
  const buffer = 0.0 * rem + transfer;

  // Back to the rest state (full blank, no gutter) so the measure reads the real free space.
  for (const it of items) {
    if (it.total) it.total.style.minWidth = "";
    if (it.meta) {
      it.meta.style.marginRight = "";
      it.meta.style.transform = "";
    }
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
  // Only the part past the buffer (`seen`) is relief the reader should see: the blank first,
  // then the gutter, and the title clips for whatever is left over.
  for (const { it, totalW, free, deficit } of rest) {
    const pressure = buffer - free + deficit;
    const seen = pressure - transfer;
    const blankBudget = it.total ? Math.max(0, totalW - (digit.get(it.total) ?? totalW)) : 0;
    const blank = Math.min(Math.max(seen, 0), blankBudget);
    if (it.total) it.total.style.minWidth = blank > 0 ? `${totalW - blank}px` : "";
    const slide = Math.min(Math.max(seen - blank, 0), gutterMax);
    if (!it.meta) continue;
    // The hidden headroom is banked as extra gutter, never as blank: a transform can undo a
    // shift of the whole count but not a narrowing inside it, so taking it from the blank
    // showed the blank shrinking a whole `transfer` early. Skipped once the title clips
    // anyway, where there is no room to bank and the transform would ride onto the title.
    const clipping = seen - blank - slide > 0;
    const hidden = clipping ? 0 : Math.min(Math.max(pressure, 0), transfer);
    const margin = slide + hidden;
    it.meta.style.marginRight = margin > 0 ? `${-margin}px` : "";
    it.meta.style.transform = hidden > 0 ? `translateX(${-hidden}px)` : "";
  }
}
