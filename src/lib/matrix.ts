// The staircase maths behind the sovereignty matrix. A cell is `[row, col]`,
// 1-based, row 1 = most recognized on top, col 1 = most independent on the left.
// The reader includes a top-left-anchored order ideal (a "staircase"): turning a
// cell on pulls in everything up-and-left of it, turning one off drops everything
// down-and-right, so the included region is always connected and anchored at the
// always-on top-left `Reguläre Staaten`.
//
// Kept apart from the component and pure, so the invariant that keeps the region a
// legal staircase is a thing tests can hold onto rather than a thing buried in a
// click handler.

import type { IconControl } from "./types";

export type Cell = [number, number];

/** A stable string key for a cell, for set membership. */
export const cellKey = (c: Cell): string => `${c[0]},${c[1]}`;

/** The matrix rules of a manifest control, each paired with its cell, the names it
 *  matches and whether it hides by default (`omit`) — dropping any rule without a
 *  cell, since the grid is placed by coordinate. `omit` decides which way a cell's
 *  toggle reads: a hide-by-default cell is shown when toggled, a shown-by-default
 *  one when untoggled. */
export function sovRules(
  control: IconControl[] | undefined,
): { id: string; cell: Cell; names: string[]; omit: boolean }[] {
  return (control ?? []).flatMap((r) =>
    r.cell ? [{ id: r.id, cell: r.cell, names: r.names ?? [], omit: !!r.omit }] : [],
  );
}

/** Whether `a` is up-and-left of (or equal to) `b` — at least as recognized and at
 *  least as independent. This is the partial order the staircase is an ideal of. */
export const dominates = (a: Cell, b: Cell): boolean => a[0] <= b[0] && a[1] <= b[1];

/** Whether cell `x` is included after the reader clicks `clicked`.
 *
 *  Clicking an excluded cell turns it on and fills in everything up-and-left;
 *  clicking an included cell turns it off and clears everything down-and-right.
 *  Every cell the click doesn't reach keeps its current state `was`. Applied to
 *  each cell, this always yields a legal order ideal from a legal one. */
export function includedAfterClick(
  x: Cell,
  clicked: Cell,
  clickedIncluded: boolean,
  was: boolean,
): boolean {
  if (!clickedIncluded && dominates(x, clicked)) return true; // fill up-and-left
  if (clickedIncluded && dominates(clicked, x)) return false; // clear down-and-right
  return was;
}
