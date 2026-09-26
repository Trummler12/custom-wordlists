// The pure core behind the Custom word-list input row (§X1). The row's UI,
// persistence and output wiring live elsewhere (state/custom, components/topics/
// CustomTopic); everything here is a pure function of the raw text and the chosen
// separator, so it is unit-tested in isolation.
//
// A reader pastes a list of their own — comma-, newline- or otherwise-separated —
// and it joins the output after every real topic. What that costs them in dropped
// items (too long for the game, or duplicated) is reported the same way a curated
// list reports its omissions, so the numbers here feed a panel, not a filter that
// hides its work.

/** The separator characters the input offers, in menu order. A list is split on
 *  exactly one of them; `\n` / `\t` cover the paste-a-column case. */
export const SEPARATORS = [",", ";", ":", "|", "\n", "\t"] as const;
export type Separator = (typeof SEPARATORS)[number];

/** The fallback when nothing in the input votes for a separator (empty, a single
 *  item, or a tie): the game's own list separator, and the most common typed one. */
export const DEFAULT_SEPARATOR: Separator = ",";

/** How many matched names a tier keeps for its hover — enough to fill the panel's
 *  excerpt, capped so a huge paste doesn't stash thousands. Mirrors lib/omitted. */
const SAMPLE_CAP = 50;

/** Occurrences of each separator in the raw text. Every occurrence counts: a quote
 *  mark is an ordinary character here, since skribbl.io and its kind have no quoting
 *  either — an item simply can't contain the separator. */
export function separatorCounts(raw: string): Record<Separator, number> {
  const counts = Object.fromEntries(SEPARATORS.map((s) => [s, 0])) as Record<Separator, number>;
  for (const ch of raw) {
    if ((SEPARATORS as readonly string[]).includes(ch)) counts[ch as Separator]++;
  }
  return counts;
}

/** The separator the input auto-selects: the most common one. A tie at the top, or
 *  none present at all, falls back to `,` — an arbitrary winner would flip the split
 *  under the reader as they type. */
export function detectSeparator(raw: string): Separator {
  const counts = separatorCounts(raw);
  const max = Math.max(...SEPARATORS.map((s) => counts[s]));
  if (max === 0) return DEFAULT_SEPARATOR;
  const top = SEPARATORS.filter((s) => counts[s] === max);
  return top.length === 1 ? top[0] : DEFAULT_SEPARATOR;
}

/** The separators the dropdown may switch to: those that occur at least once — or,
 *  when none does, all of them (so an empty field can still be re-pointed). */
export function availableSeparators(raw: string): Separator[] {
  const counts = separatorCounts(raw);
  const present = SEPARATORS.filter((s) => counts[s] > 0);
  return present.length ? present : [...SEPARATORS];
}

/** Split the raw text into trimmed, non-empty items on `sep`. No quoting: the game the
 *  list is for has none, so honouring `"a, b"` here would build an item it can't take. */
export function parseItems(raw: string, sep: string): string[] {
  return raw
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** One reported omission group: how many items it caught and a sample of them. */
export interface OmissionTier {
  count: number;
  samples: string[];
}

/** The Custom channel's contribution and what it left out, in the panel's terms.
 *  `kept` are the survivors in first-seen order — what the output actually adds. */
export interface CustomBreakdown {
  kept: string[];
  /** Items longer than the game's cap. Counted always; kept only when the reader
   *  switches the rule off (`keepTooLong`), mirroring the topics' ✂️ rule. */
  tooLong: OmissionTier;
  /** Duplicates within this one source. */
  internal: OmissionTier;
  /** Duplicates against the other active custom sources (X3; empty until then). */
  local: OmissionTier;
  /** Duplicates against the non-custom output already emitted (the `seen` set). */
  global: OmissionTier;
  /** Every parsed item, for the `n/m` counter (kept.length / total). */
  total: number;
}

function emptyTier(): OmissionTier {
  return { count: 0, samples: [] };
}
function record(tier: OmissionTier, item: string): void {
  tier.count++;
  if (tier.samples.length < SAMPLE_CAP) tier.samples.push(item);
}

/** Classify the active custom sources — the input field and/or the activated saved
 *  lists, in the order they contribute — into what the Custom channel keeps and what
 *  it drops, in the fixed precedence `>cap` => internal => local => global (each item
 *  counted once, under the first tier that catches it, the "first rule wins" the
 *  curated lists' `omissionSummary` uses).
 *
 *  - `cap` is the game's max word length; `keepTooLong` reflects the reader's ✂️
 *    toggle (default off = drop the over-long ones).
 *  - `internal` = a duplicate within one source; `local` = a duplicate against an
 *    earlier active source; `global` = a duplicate against `seen`, the words the
 *    non-custom output already holds (reusing that set makes global-dedup free).
 *
 *  A single source (the input field alone) never fills the `local` tier — it is
 *  what X1/X2 pass. */
export function classifyCustom(
  sources: readonly (readonly string[])[],
  opts: { cap: number; keepTooLong: boolean; seen: ReadonlySet<string> },
): CustomBreakdown {
  const { cap, keepTooLong, seen } = opts;
  const out: CustomBreakdown = {
    kept: [],
    tooLong: emptyTier(),
    internal: emptyTier(),
    local: emptyTier(),
    global: emptyTier(),
    total: 0,
  };
  const keptSet = new Set<string>(); // across all sources — the local (cross-source) tier
  for (const source of sources) {
    const mine = new Set<string>(); // within this source — the internal tier
    for (const item of source) {
      out.total++;
      if (item.length > cap) {
        record(out.tooLong, item);
        if (!keepTooLong) continue;
      }
      if (mine.has(item)) {
        record(out.internal, item);
        continue;
      }
      if (keptSet.has(item)) {
        record(out.local, item);
        continue;
      }
      if (seen.has(item)) {
        record(out.global, item);
        continue;
      }
      mine.add(item);
      keptSet.add(item);
      out.kept.push(item);
    }
  }
  return out;
}

/** Serialize items back into an input string on `sep`, for loading a saved list into
 *  the field (📥). The inverse of `parseItems` for any item free of `sep`; one that
 *  contains it splits on the way back, as it would in the game. */
export function serializeItems(items: readonly string[], sep: string): string {
  return items.join(sep);
}

// --- Import / export (§X4) ---------------------------------------------------
// Saved lists move between browsers/devices as a JSON file: local storage is
// per-browser, so this is the only bridge. The payload carries a version and the
// bare lists (name / separator / items) — no ids, which are per-store and reassigned
// on import.

/** A saved list as it travels in an export file — the durable fields only. */
export interface PortableList {
  name: string;
  separator: Separator;
  items: string[];
}

const EXPORT_VERSION = 1;

/** Serialize lists into the download payload. Pretty-printed: a reader may open the
 *  file, and the size cost is nothing next to being legible. */
export function exportLists(lists: readonly PortableList[]): string {
  const payload = {
    version: EXPORT_VERSION,
    lists: lists.map((l) => ({ name: l.name, separator: l.separator, items: l.items })),
  };
  return JSON.stringify(payload, null, 2);
}

function isPortable(l: unknown): l is PortableList {
  if (!l || typeof l !== "object") return false;
  const r = l as Record<string, unknown>;
  return (
    typeof r.name === "string" &&
    typeof r.separator === "string" &&
    (SEPARATORS as readonly string[]).includes(r.separator) &&
    Array.isArray(r.items) &&
    r.items.every((it) => typeof it === "string")
  );
}

/** Parse an import file back into lists, keeping only well-formed entries. Tolerant:
 *  the file is user-supplied and may be truncated or hand-edited, so a bad blob or a
 *  malformed entry is dropped rather than thrown. */
export function parseImport(text: string): PortableList[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return [];
  }
  const lists = (data as Record<string, unknown> | null)?.lists;
  return Array.isArray(lists) ? lists.filter(isPortable) : [];
}

/** The distinct-item overlap between two lists: how many items they share, and each
 *  one's distinct size — enough for the import table's "Dupes %" (`shared / smaller`)
 *  and its reverse-direction hover (`shared / larger`). */
export function overlapStats(
  a: readonly string[],
  b: readonly string[],
): { shared: number; sizeA: number; sizeB: number } {
  const setA = new Set(a);
  const setB = new Set(b);
  let shared = 0;
  for (const x of setA) if (setB.has(x)) shared++;
  return { shared, sizeA: setA.size, sizeB: setB.size };
}

/** A list's content preview for the persistent tooltips: the first `maxItems` items joined
 *  by ", ", trimmed to `maxChars`, with a trailing ", …" when anything was left out. Both
 *  caps are reader-set (the ⚙️ Custom settings). The character cut backs off to the last
 *  whole item where it can, so the preview doesn't end mid-word; a single item longer than
 *  the budget is hard-cut with a bare "…". */
export function previewText(items: readonly string[], maxItems: number, maxChars: number): string {
  const shown = items.slice(0, Math.max(1, maxItems));
  const text = shown.join(", ");
  if (text.length > maxChars) {
    const cut = text.slice(0, maxChars);
    const lastSep = cut.lastIndexOf(", ");
    return lastSep > 0 ? `${cut.slice(0, lastSep)}, …` : `${cut.trimEnd()}…`;
  }
  return shown.length < items.length ? `${text}, …` : text;
}
