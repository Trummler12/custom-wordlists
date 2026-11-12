// The app's adjustable settings — the numbers a maintainer tweaks — gathered in one
// discoverable place. The leading underscore sorts this file to the top of lib/. Values
// are UPPER_SNAKE; each says what it tunes and, where it matters, what it must stay in
// step with. Pure per-component geometry (pixel gaps, grid dimensions) stays at its
// component; the "Elsewhere" signpost at the foot points to the tunables that live by
// their logic.

/** How many of an omission rule's matched names are kept, and shown, in its hover excerpt:
 *  long enough to be useful (and a little funny) without listing a hundred countries. The
 *  three collection sites (lib/omitted, lib/custom, lib/tree) all fill up to this many, and
 *  the panel (components/topics/OmittedPanel) shows up to this many — one constant so the
 *  display can never ask for more than was collected. */
export const OMISSION_SAMPLE_CAP = 50;

/** Custom-list editor — the paste area's height cap in rows: the default and the range the
 *  − / + controls step through (§X2). Consumed in state/custom.svelte.ts. */
export const MIN_ROWS = 5;
export const MAX_ROWS = 40;
export const ROW_STEP = 5;

/** The most characters a list name a reader types may hold (a `maxlength` on the rename
 *  fields). Names that arrive from an import may be longer and are kept as-is — the tiles
 *  ellipsize an over-long name rather than the store shortening it. */
export const NAME_MAX = 32;

/** The reader-set caps for the content previews (the ⚙️ Custom settings): how many items a
 *  preview lists and how long it may run, each with its range and default. `previewText`
 *  (lib/custom) applies them; the panels reach them through `custom.preview`. */
export const PREVIEW_ITEMS_MIN = 1;
export const PREVIEW_ITEMS_MAX = 420;
export const PREVIEW_ITEMS_DEFAULT = 69;
export const PREVIEW_CHARS_MIN = 10;
export const PREVIEW_CHARS_MAX = 1337;
export const PREVIEW_CHARS_DEFAULT = 420;

/** Coverage table — rows shown per page (a size control is a later batch). */
export const PAGE_SIZE = 100;

// ── Elsewhere ────────────────────────────────────────────────────────────────────────
// Tunables kept with the logic they belong to, listed here so this file is still the one
// place to start looking:
//   ./fame.ts                 MIN_GAP_RATIO, INTERIOR_EMPTY_GAP, INTERIOR_EMPTY_BUDGET
//                             — the fame-grouping gap heuristics
//   ../state/topics.svelte.ts LENGTH_DECAY — the length-score decay
// Pure per-component geometry, each at its only user:
//   ../components/shared/placement.ts        GAP, GUTTER
//   ../components/topics/CustomTopic.svelte  GROUP_GAP
//   ./fame.ts                                INSET_PX
//   ../components/topics/SovereigntyMatrix.svelte  ROWS, COLS
