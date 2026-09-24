// Resetting the selection settings to their shipped defaults — the "reset" the settings
// menu offers. It clears an explicit allowlist of keys, not "everything but a few
// exceptions": the reader's saved custom lists and current input are their own data, not a
// setting, and a broad prefix-wipe used to take them out along with the settings. So this
// names exactly what it resets and spares the rest by default.
//
// What it resets: the stored view/omission preferences (`wordlists:settings`) and the
// script-variant picks (`wordlists:variants`). The reload is the reset's second half — the
// in-memory selection (which topics are ticked, name modes, fame depths, expansion, rulers)
// is never persisted, so clearing storage isn't what returns it to default; the reload is.
//
// What it keeps: the custom lists and input (`wordlists:custom*`) and the content /
// interface language (`wordlists:lang` / `:uiLang`) — data and identity, not settings.

import { SETTINGS_STORAGE_KEY } from "./settings.svelte";
import { VARIANT_STORAGE_KEY } from "./lang.svelte";

/** The stored keys a selection-settings reset clears — and only these. A new selection
 *  setting that should reset joins this list; a new store that holds the reader's own data
 *  is spared automatically by not being on it. */
const RESET_KEYS: readonly string[] = [SETTINGS_STORAGE_KEY, VARIANT_STORAGE_KEY];

/** Reset the selection settings to the shipped defaults: drop the stored view/omission
 *  preferences and script-variant picks, then reload so the in-memory selection returns to
 *  default too. The reader's custom lists, input and language are left untouched. */
export function resetSelectionSettings(): void {
  try {
    for (const k of RESET_KEYS) localStorage.removeItem(k);
  } catch {
    // localStorage throws in a few real setups (private mode, blocked storage); the reload
    // still drops the in-memory selection, which is the visible half.
  }
  location.reload();
}
