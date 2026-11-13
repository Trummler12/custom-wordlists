// The pager's jump field: what the reader typed, and where in the table it lands.
// Pure and tested; the page decides what to do with the answer (switch page, re-sort,
// or say the table has no numeric column).

import type { SortableItem } from "./sort";

export type JumpTarget = { kind: "number"; value: number } | { kind: "name"; text: string };

/** A number (thousands separators and spaces allowed: "1'000", "1,000", "1 000") or
 *  else a name. Null for nothing at all. */
export function parseJump(input: string): JumpTarget | null {
  const text = input.trim();
  if (!text) return null;
  if (/^[\d\s'’.,_]+$/.test(text) && /\d/.test(text)) {
    return { kind: "number", value: Number(text.replace(/\D/g, "")) };
  }
  return { kind: "name", text };
}

/** Where a name would sort among items ordered by name A→Z: the index of the first
 *  item that doesn't come before it (the item itself, if it is there). */
export function nameLanding(items: readonly SortableItem[], text: string): number {
  const q = text.toLowerCase();
  const i = items.findIndex((it) => (it.name ?? "").toLowerCase().localeCompare(q) >= 0);
  return i < 0 ? Math.max(0, items.length - 1) : i;
}

/** Where a value would sort among items ordered by their number, largest first: the
 *  first item at or below it. */
export function numberLanding(items: readonly SortableItem[], value: number): number {
  const i = items.findIndex((it) => (it.num ?? -Infinity) <= value);
  return i < 0 ? Math.max(0, items.length - 1) : i;
}
