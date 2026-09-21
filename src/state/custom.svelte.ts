// The reader's own word list — the Custom input row at the foot of the topic tree
// (§X1). Holds only what the row edits: the raw text, the chosen separator, and
// whether over-long items are kept. Parsing and classification are pure
// (lib/custom); `output` reads `items`/`keepTooLong` and asks `classify(seen)` for
// what the channel contributes and what it drops. Saved lists and import/export
// arrive in X3/X4.
//
// One instance, reached through property access (see state/lang.svelte for why).

import {
  classifyCustom,
  type CustomBreakdown,
  detectSeparator,
  parseItems,
  type Separator,
  SEPARATORS,
} from "../lib/custom";
import { SKRIBBL } from "../lib/skribbl";

const STORAGE_KEY = "wordlists:custom";

/** The input's height cap, in rows before it scrolls: the default and the range the
 *  − / + controls step through (§X2). */
export const MIN_ROWS = 5;
export const MAX_ROWS = 20;
const ROW_STEP = 5;

class CustomState {
  /** The raw text in the input field. */
  input = $state("");
  /** A manual separator pick, cleared on the next edit so the field returns to
   *  auto-detection. Null = follow `detectSeparator(input)`. */
  manualSeparator = $state<Separator | null>(null);
  /** Whether over-long items are kept anyway — the ✂️ rule switched off. */
  keepTooLong = $state(false);
  /** How many rows the input grows to before it scrolls (§X2, the − / + controls). */
  maxRows = $state(MIN_ROWS);
  /** Whether the row cap is lifted and the input fits its whole content (↕️). */
  fitContent = $state(false);

  constructor() {
    const s = read();
    if (!s) return;
    this.input = s.input ?? "";
    this.manualSeparator = isSeparator(s.separator) ? s.separator : null;
    this.keepTooLong = !!s.keepTooLong;
    if (typeof s.maxRows === "number") this.maxRows = clampRows(s.maxRows);
    this.fitContent = !!s.fitContent;
  }

  /** Whether the − / + controls can still step (not at the range's end, and not
   *  while ↕️ has lifted the cap). */
  readonly canGrow: boolean = $derived(!this.fitContent && this.maxRows < MAX_ROWS);
  readonly canShrink: boolean = $derived(!this.fitContent && this.maxRows > MIN_ROWS);

  /** The separator in force: a manual pick, else the most common in the input. */
  readonly separator: Separator = $derived(this.manualSeparator ?? detectSeparator(this.input));
  /** The parsed, trimmed, non-empty items — before de-duplication. */
  readonly items: string[] = $derived(parseItems(this.input, this.separator));

  setInput(v: string): void {
    this.input = v;
    this.manualSeparator = null; // an edit hands the separator back to auto-detection
    this.save();
  }
  setSeparator(s: Separator): void {
    this.manualSeparator = s;
    this.save();
  }
  setKeepTooLong(on: boolean): void {
    this.keepTooLong = on;
    this.save();
  }
  growRows(): void {
    this.maxRows = clampRows(this.maxRows + ROW_STEP);
    this.save();
  }
  shrinkRows(): void {
    this.maxRows = clampRows(this.maxRows - ROW_STEP);
    this.save();
  }
  toggleFitContent(): void {
    this.fitContent = !this.fitContent;
    this.save();
  }
  clear(): void {
    this.input = "";
    this.manualSeparator = null;
    this.save();
  }

  /** What the Custom channel contributes and drops, against the words the rest of
   *  the output already holds (`seen`). Called by `output`, which owns that set. */
  classify(seen: ReadonlySet<string>): CustomBreakdown {
    return classifyCustom(this.items, {
      cap: SKRIBBL.maxWordLen,
      keepTooLong: this.keepTooLong,
      seen,
    });
  }

  private save(): void {
    write({
      input: this.input,
      separator: this.separator,
      keepTooLong: this.keepTooLong,
      maxRows: this.maxRows,
      fitContent: this.fitContent,
    });
  }
}

function isSeparator(s: unknown): s is Separator {
  return typeof s === "string" && (SEPARATORS as readonly string[]).includes(s);
}

/** Snap a stored/stepped row cap into the [MIN_ROWS, MAX_ROWS] range. */
function clampRows(n: number): number {
  return Math.min(MAX_ROWS, Math.max(MIN_ROWS, n));
}

// localStorage throws in a few real setups (private mode, blocked storage), and a
// lost custom input is never worth an error.
type Stored = {
  input?: string;
  separator?: string;
  keepTooLong?: boolean;
  maxRows?: number;
  fitContent?: boolean;
};
function read(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function write(value: Stored): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable — the input just won't survive a reload */
  }
}

export const custom = new CustomState();
