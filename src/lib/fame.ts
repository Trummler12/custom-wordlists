// Geometry of the per-group fame-depth slider. A native <input range> can't put
// snap markers on its rail or space them by tier size, so the track is custom and
// the maths lives here — pure, and returning a depth rather than setting one.

import type { Group, LocalizedString, TierNote } from "./types";

// Snap spacing: a non-empty tier gets at least this fraction of an equal step (of
// the non-empty tiers), and the rest of the travel is distributed among them by
// size. Lower = more size-faithful spacing; higher = more even. Range (0, 1).
const MIN_GAP_RATIO = 0.4;

// An empty tier between two full ones gets this fraction of the travel — near
// zero, so its two stops almost touch and the reader sees there is a band with
// nothing in it, without it claiming room a full tier would. Leading and trailing
// empties get nothing at all (they collapse onto an end); see `snapPositions`.
const INTERIOR_EMPTY_GAP = 0.02;
// …but never more than this much of the rail for all interior empties together,
// so a freak list of many empty bands can't crowd out the real ones.
const INTERIOR_EMPTY_BUDGET = 0.2;

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

/** The note this ruler position has earned, or none.
 *
 *  The deepest of those that apply, not all of them: two notes on one row would
 *  be two glyphs the reader has to open in turn to find out they overlap, and a
 *  note written for tier 4 already knows what tier 2's said. */
export function tierNoteAt(g: Group, depth: number): TierNote | undefined {
  let best: TierNote | undefined;
  for (const n of g.tierNotes ?? []) {
    if (n.fromTier <= depth && (!best || n.fromTier > best.fromTier)) best = n;
  }
  return best;
}

/** Snap positions (fractions 0…1 of the thumb travel): one per step boundary,
 *  including both ends.
 *
 *  An empty tier is spaced by where it sits, because that is what the reader needs
 *  to see. Empty bands at the famous (left) or least-famous (right) end collapse
 *  onto that end — their first perceptible stop is the one that brings in real
 *  entries — while an empty band between two full ones keeps a hair of travel, so
 *  the reader can tell one stop carries two condition steps with nothing between.
 *  The collapsed end stops are still returned (and rendered); `nearestIndex`'s
 *  low-index tie-break keeps a pointer from ever landing on one. */
export function snapPositions(g: Group): number[] {
  const sizes = tierSizes(g);
  const n = sizes.length;
  // No steps, no travel — and the divisions below would be by zero.
  if (n === 0) return [0];

  const isEmpty = sizes.map((s) => s === 0);
  let lead = 0;
  while (lead < n && isEmpty[lead]) lead++;
  let trail = n;
  while (trail > lead && isEmpty[trail - 1]) trail--;
  // Between the collapsed ends: the tiers that get room. Empty ones there take a
  // sliver each; full ones share the rest by size.
  const interior: number[] = [];
  const full: number[] = [];
  for (let i = lead; i < trail; i++) (isEmpty[i] ? interior : full).push(i);

  const gaps = new Array(n).fill(0);
  const eps = interior.length
    ? Math.min(INTERIOR_EMPTY_GAP, INTERIOR_EMPTY_BUDGET / interior.length)
    : 0;
  for (const i of interior) gaps[i] = eps;

  if (full.length === 0) {
    // Nothing but empty tiers (or only leading/trailing runs): no size to weigh,
    // so spread the stops evenly rather than piling them on one end.
    for (let i = 0; i < n; i++) gaps[i] = 1 / n;
  } else {
    const travel = 1 - eps * interior.length; // what the full tiers divide up
    const total = full.reduce((a, i) => a + sizes[i], 0) || 1;
    const base = (MIN_GAP_RATIO / full.length) * travel;
    const scale = travel - base * full.length; // distributed by tier size
    for (const i of full) gaps[i] = base + scale * (sizes[i] / total);
  }

  const pos = [0];
  let acc = 0;
  for (let i = 0; i < n; i++) pos.push((acc += gaps[i]));
  pos[n] = 1; // guard against float drift
  return pos;
}

/** Move a keyboard step past any stops collapsed onto the current pixel, so an
 *  arrow press shifts the thumb whenever it can. Leading and trailing empty tiers
 *  share a position with an end (`snapPositions`), and stepping onto one would
 *  look like nothing happened. `target` is what a plain ±1 (or Home/End) landed
 *  on; the result keeps its direction and stays in range. */
export function skipCollapsed(pos: number[], current: number, target: number): number {
  if (target === current) return target;
  const dir = target > current ? 1 : -1;
  let d = target;
  while (d > 0 && d < pos.length - 1 && pos[d] === pos[current]) d += dir;
  return d;
}

/** The ruler's hover text at a given depth, when the list declares one — the
 *  condition it has just brought in, or, at its leftmost stop, what it is ordered
 *  by. `resolve` renders a localized string in the interface language; `prefix` is
 *  the locale's "Selected:" (or "Mostly selected:") that opens the non-empty text.
 *  Returns undefined for a list with no `rulerTooltip`, so the caller can fall back. */
export function rulerTip(
  g: Group,
  depth: number,
  resolve: (s: LocalizedString) => string,
  prefix: string,
): string | undefined {
  const rt = g.rulerTooltip;
  if (!rt) return undefined;
  // At rest nothing is selected, so the ordering line stands on its own — no prefix.
  if (depth <= 0) return resolve(rt.empty);
  const cond = g.tierConditions?.[depth - 1];
  const body = resolve(rt.text).replace("{condition}", cond ? resolve(cond) : "");
  return `${prefix} ${body}`;
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
