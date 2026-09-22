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

/** Occurrences of each separator in the raw text, counted OUTSIDE quoted spans —
 *  a comma inside `"a, b"` is part of an item, not a boundary, so it must not vote
 *  for the comma separator. */
export function separatorCounts(raw: string): Record<Separator, number> {
  const counts = Object.fromEntries(SEPARATORS.map((s) => [s, 0])) as Record<Separator, number>;
  let inQuotes = false;
  for (const ch of raw) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && (SEPARATORS as readonly string[]).includes(ch)) counts[ch as Separator]++;
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

/** Split the raw text into trimmed, non-empty items on `sep`, honoring `"quotes"`:
 *  a `sep` inside a quoted span is kept as part of the item, and the quote marks
 *  themselves are stripped. An unterminated quote runs to the end of the input.
 *
 *  Deliberately small: a doubled `""` is two toggles (an empty quoted span), not an
 *  escaped quote — skribbl names don't carry quote characters, and the elaborate
 *  CSV rule would be machinery for a case that doesn't arise here. */
export function parseItems(raw: string, sep: string): string[] {
  const items: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (const ch of raw) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === sep && !inQuotes) {
      const t = cur.trim();
      if (t) items.push(t);
      cur = "";
      continue;
    }
    cur += ch;
  }
  const last = cur.trim();
  if (last) items.push(last);
  return items;
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

/** Serialize items back into an input string on `sep` — the inverse of `parseItems`,
 *  for loading a saved list into the field (📥). An item that contains the separator
 *  is wrapped in quotes, exactly as the reader would have had to type it. */
export function serializeItems(items: readonly string[], sep: string): string {
  return items.map((it) => (it.includes(sep) ? `"${it}"` : it)).join(sep);
}
