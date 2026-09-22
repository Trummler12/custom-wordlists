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
  type PortableList,
  type Separator,
  SEPARATORS,
  serializeItems,
} from "../lib/custom";
import { SKRIBBL } from "../lib/skribbl";

const STORAGE_KEY = "wordlists:custom";
const LISTS_KEY = "wordlists:customLists";

/** A word list the reader saved for reuse (§X3). Stored as one ordered array under
 *  `wordlists:customLists`; the order IS the display order (reorder swaps elements,
 *  delete splices), so there is no gapless-id bookkeeping. `id` is a stable key. */
export interface SavedList {
  id: number;
  name: string;
  separator: Separator;
  items: string[];
}

/** The input's height cap, in rows before it scrolls: the default and the range the
 *  − / + controls step through (§X2). */
export const MIN_ROWS = 5;
export const MAX_ROWS = 40;
export const ROW_STEP = 5;

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
  /** The reader's saved lists (§X3), in display order. */
  savedLists = $state<SavedList[]>([]);
  /** Which saved lists are active — contributing to the output beside the field. */
  activeIds = $state<number[]>([]);
  /** When true the input field is left out of the effective sources: its text was
   *  just saved as, or loaded from, an active list, so counting it too would double
   *  every word. Cleared by a manual edit or any change to the active selection. */
  inputSuperseded = $state(false);
  #nextId = 1;

  constructor() {
    const s = read();
    if (s) {
      this.input = s.input ?? "";
      this.manualSeparator = isSeparator(s.separator) ? s.separator : null;
      this.keepTooLong = !!s.keepTooLong;
      if (typeof s.maxRows === "number") this.maxRows = clampRows(s.maxRows);
      this.fitContent = !!s.fitContent;
      this.inputSuperseded = !!s.inputSuperseded;
    }
    const ls = readLists();
    if (ls) {
      this.savedLists = (ls.lists ?? []).filter(isValidList);
      this.activeIds = (ls.active ?? []).filter((id) => this.savedLists.some((l) => l.id === id));
      this.#nextId = this.savedLists.reduce((m, l) => Math.max(m, l.id), 0) + 1;
    }
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
    this.inputSuperseded = false; // and re-admits the field to the sources
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
    this.inputSuperseded = false;
    this.save();
  }

  // --- Saved lists (§X3) -----------------------------------------------------
  // One ordered array; the order is the display order. Every mutation reassigns the
  // array (so Svelte sees it) and persists.

  toggleActive(id: number): void {
    this.activeIds = this.isActive(id) ? this.activeIds.filter((x) => x !== id) : [...this.activeIds, id];
    this.inputSuperseded = false; // any selection change re-admits the input field
    this.saveLists();
  }

  /** The default name a new tile takes: "Custom List <n>", n being the next slot. */
  private placeholderName(): string {
    return `Custom List ${this.savedLists.length + 1}`;
  }

  /** Save the current input as a new list and activate it; the field then mirrors it,
   *  so it is superseded until edited. */
  saveNew(): void {
    const list: SavedList = {
      id: this.#nextId++,
      name: this.placeholderName(),
      separator: this.separator,
      items: [...this.items],
    };
    this.savedLists = [...this.savedLists, list];
    this.activeIds = [...this.activeIds, list.id];
    this.inputSuperseded = true;
    this.saveLists();
    this.save();
  }
  /** Overwrite an existing list with the current input. */
  replaceList(id: number): void {
    this.savedLists = this.savedLists.map((l) =>
      l.id === id ? { ...l, separator: this.separator, items: [...this.items] } : l,
    );
    this.saveLists();
  }
  renameList(id: number, name: string): void {
    this.savedLists = this.savedLists.map((l) => (l.id === id ? { ...l, name } : l));
    this.saveLists();
  }
  deleteList(id: number): void {
    this.savedLists = this.savedLists.filter((l) => l.id !== id);
    this.activeIds = this.activeIds.filter((x) => x !== id);
    this.saveLists();
  }
  /** Swap a list with its neighbour (▲ = -1, ▼ = +1); a no-op at the ends. */
  moveList(id: number, dir: -1 | 1): void {
    const i = this.savedLists.findIndex((l) => l.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= this.savedLists.length) return;
    const next = [...this.savedLists];
    [next[i], next[j]] = [next[j], next[i]];
    this.savedLists = next;
    this.saveLists();
  }
  setListSeparator(id: number, sep: Separator): void {
    this.savedLists = this.savedLists.map((l) => (l.id === id ? { ...l, separator: sep } : l));
    this.saveLists();
  }
  /** Append imported lists, each with a fresh id (ids are per-store, so an import
   *  never collides with or overwrites an existing list). */
  importLists(lists: readonly PortableList[]): void {
    const added = lists.map((l) => ({
      id: this.#nextId++,
      name: l.name,
      separator: l.separator,
      items: [...l.items],
    }));
    this.savedLists = [...this.savedLists, ...added];
    this.saveLists();
  }
  /** Load a saved list back into the input field. The field is superseded only when
   *  the source list is *active*: then the field mirrors a source already contributing,
   *  so counting it too would double every word. Loading from an inactive list is just
   *  a fresh copy to edit, and the field stays a source in its own right. */
  loadIntoInput(id: number): void {
    const l = this.savedLists.find((x) => x.id === id);
    if (!l) return;
    this.input = serializeItems(l.items, l.separator);
    this.manualSeparator = l.separator;
    this.inputSuperseded = this.isActive(id);
    this.save();
  }

  isActive(id: number): boolean {
    return this.activeIds.includes(id);
  }

  /** The sources the channel classifies, in order: the active saved lists (in list
   *  order), then the input field unless it has been superseded. */
  readonly effectiveSources: string[][] = $derived.by(() => {
    const out: string[][] = [];
    for (const l of this.savedLists) if (this.isActive(l.id)) out.push(l.items);
    if (!this.inputSuperseded) out.push(this.items);
    return out;
  });

  /** What the Custom channel contributes and drops, against the words the rest of
   *  the output already holds (`seen`). Called by `output`, which owns that set. */
  classify(seen: ReadonlySet<string>): CustomBreakdown {
    return classifyCustom(this.effectiveSources, {
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
      inputSuperseded: this.inputSuperseded,
    });
  }
  private saveLists(): void {
    writeLists({ lists: this.savedLists, active: this.activeIds });
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
  inputSuperseded?: boolean;
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

type StoredLists = { lists?: SavedList[]; active?: number[] };
/** A stored list is trusted only when its shape holds — localStorage is editable and
 *  shared across app versions, so a malformed entry is dropped rather than trusted. */
function isValidList(l: unknown): l is SavedList {
  if (!l || typeof l !== "object") return false;
  const r = l as Record<string, unknown>;
  return (
    typeof r.id === "number" &&
    typeof r.name === "string" &&
    isSeparator(r.separator) &&
    Array.isArray(r.items) &&
    r.items.every((it) => typeof it === "string")
  );
}
function readLists(): StoredLists | null {
  try {
    const raw = localStorage.getItem(LISTS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeLists(value: StoredLists): void {
  try {
    localStorage.setItem(LISTS_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable — the saved lists just won't survive a reload */
  }
}

export const custom = new CustomState();
