// Clearing the stored preferences and reloading — the "reset to default" the
// settings menu offers, and the way to see a changed default take effect without
// opening a fresh browser profile.
//
// Every key the app writes is under the `wordlists:` prefix (see settings.svelte
// and lang.svelte), so clearing by prefix stays correct as new keys are added and
// touches nothing another page on the origin stored — every key but the reset
// exceptions (`PRESERVED_KEYS`). The reload is the reset's second half: it drops the
// in-memory state and lets every store re-initialize from storage, which is a first
// visit but for the preferences that were spared.

import { LANGUAGE_STORAGE_KEYS } from "./lang.svelte";

const PREFIX = "wordlists:";

/** The stored keys a reset preserves rather than clears — the reset exceptions.
 *  The language choices are the whole of it today: a reader's content and interface
 *  language are who they are, not a preference they tuned, so a reset leaves them as
 *  they were. Deliberately an open list, not a fixed pair — a later preference that
 *  should outlive a reset joins here. (The script variant is not one of them: it
 *  returns to its default like the rest.) */
const PRESERVED_KEYS: readonly string[] = [...LANGUAGE_STORAGE_KEYS];

/** Drop every stored preference but the reset exceptions, and reload into the
 *  shipped defaults. */
export function resetAllToDefault(): void {
  const keep = new Set<string>(PRESERVED_KEYS);
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX) && !keep.has(k)) keys.push(k);
    }
    for (const k of keys) localStorage.removeItem(k);
  } catch {
    // localStorage throws in a few real setups (private mode, blocked storage);
    // the reload still drops the in-memory state, which is the visible half.
  }
  location.reload();
}
