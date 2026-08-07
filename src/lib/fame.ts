// Geometry of the per-group fame-depth slider. A native <input range> can't put
// snap markers on its rail or space them by tier size, so the track is custom and
// the maths lives here — pure, and returning a depth rather than setting one.

import type { Group } from "./types";

// Snap spacing: every gap is at least this fraction of an equal step, and the
// remaining travel is distributed by tier size. Lower = more size-faithful
// spacing; higher = more even. Range (0, 1).
const MIN_GAP_RATIO = 0.4;

/** Horizontal inset (px) that keeps the slider's end dots off the rail edges.
 *  Must stay in sync with `--inset` in src/styles/app.css. */
export const INSET_PX = 8;

/** How many fame groups a list actually defines — 0 for a flat one. What the
 *  ruler's tooltip reports, and the difference between a ruler worth dragging and
 *  one that only says the list hasn't been ranked yet. */
export function fameGroups(g: Group): number {
  return g.tiers?.length ?? 0;
}

/** Sizes of the steps a ruler has. A flat group is one step holding everything,
 *  so every group gets a ruler and the geometry below needs no special case. */
export function tierSizes(g: Group): number[] {
  return g.tiers ? g.tiers.map((t) => t.length) : [(g.words ?? []).length];
}

/** Snap positions (fractions 0…1 of the thumb travel): one per step boundary,
 *  including both ends. */
export function snapPositions(g: Group): number[] {
  const sizes = tierSizes(g);
  const n = sizes.length;
  // No steps, no travel — and the divisions below would be by zero.
  if (n === 0) return [0];
  const total = sizes.reduce((a, s) => a + s, 0) || 1;
  const base = MIN_GAP_RATIO / n; // minimum gap, as a fraction of full travel
  const scale = 1 - n * base; // remaining travel distributed by tier size
  const pos = [0];
  let acc = 0;
  for (let i = 0; i < n; i++) {
    acc += base + scale * (sizes[i] / total);
    pos.push(acc);
  }
  pos[n] = 1; // guard against float drift
  return pos;
}

export function nearestIndex(pos: number[], frac: number): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < pos.length; i++) {
    const d = Math.abs(pos[i] - frac);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/** The depth a pointer at this position selects, snapped to a tier boundary. */
export function depthFromPointer(e: PointerEvent, g: Group): number {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const span = rect.width - 2 * INSET_PX;
  const frac = span > 0 ? (e.clientX - rect.left - INSET_PX) / span : 0;
  return nearestIndex(snapPositions(g), Math.min(1, Math.max(0, frac)));
}

/** The depth a key press moves to, or null when the key isn't one of ours (in
 *  which case the caller must not preventDefault). */
export function depthFromKey(e: KeyboardEvent, current: number, n: number): number | null {
  if (e.key === "ArrowRight" || e.key === "ArrowUp") return Math.min(n, current + 1);
  if (e.key === "ArrowLeft" || e.key === "ArrowDown") return Math.max(0, current - 1);
  if (e.key === "Home") return 0;
  if (e.key === "End") return n;
  return null;
}
