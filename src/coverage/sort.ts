// Ordering the coverage rows. The default order surfaces the gaps a contributor came for —
// the URL language's missing labels first — and clicking a column header re-sorts by it.
// Pure and tested; the page just holds the SortState and renders sortItems' output.

export interface SortableItem {
  qid: string;
  /** Absent when Wikidata has no label in any covered language — such rows sort as "". */
  name?: string;
  num?: number;
  miss?: string[];
}

/** A sortable column: the name column, the numeric column, or a language code. */
export type SortKey = "name" | "num" | (string & {});
export type SortDir = "asc" | "desc";
export interface SortState {
  /** null is the initial, no-column-clicked state (most-gaps order). */
  key: SortKey | null;
  dir: SortDir;
}

const missingCount = (it: SortableItem) => it.miss?.length ?? 0;
const isMissing = (it: SortableItem, lang: string) => it.miss?.includes(lang) ?? false;

/** The direction a column takes on its first click: names A→Z, everything else "most
 *  first" — the largest number, or the missing labels on top. */
export function firstDir(key: SortKey): SortDir {
  return key === "name" ? "asc" : "desc";
}

interface Criterion {
  of: (it: SortableItem) => number | string;
  dir: SortDir;
}

// The ordered criteria for a sort state. The clicked column leads; shared tie-breakers —
// fewest gaps, then largest number, then name, then id — follow so the order is total and
// stable regardless of the input order. Fewest-gaps-first means that under an active
// language column the "easy wins" rise: entities missing that language but otherwise well
// covered sit above ones missing many.
function criteria(state: SortState): Criterion[] {
  const name = (i: SortableItem) => (i.name ?? "").toLowerCase();
  const byName: Criterion = { of: name, dir: "asc" };
  const byNum: Criterion = { of: (i) => i.num ?? -Infinity, dir: "desc" };
  const byGaps: Criterion = { of: missingCount, dir: "asc" };
  const byId: Criterion = { of: (i) => i.qid, dir: "asc" };
  if (state.key === "name") return [{ of: name, dir: state.dir }, byId];
  if (state.key === "num") return [{ of: (i) => i.num ?? -Infinity, dir: state.dir }, byName, byId];
  if (state.key === null) return [byGaps, byNum, byName, byId];
  const lang = state.key;
  return [{ of: (i) => (isMissing(i, lang) ? 1 : 0), dir: state.dir }, byGaps, byNum, byName, byId];
}

const cmp = (a: number | string, b: number | string): number =>
  typeof a === "string" || typeof b === "string" ? String(a).localeCompare(String(b)) : a - b;

/** A stable, total ordering of the items for the given sort state. */
export function sortItems<T extends SortableItem>(items: readonly T[], state: SortState): T[] {
  const crit = criteria(state);
  return [...items].sort((a, b) => {
    for (const { of, dir } of crit) {
      const d = cmp(of(a), of(b)) * (dir === "desc" ? -1 : 1);
      if (d) return d;
    }
    return 0;
  });
}
