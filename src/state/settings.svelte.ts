// View preferences: what the tree offers, as opposed to what the user has picked
// in it. Kept apart from `selection` because none of this is part of a word list —
// it survives a reload and says nothing about what is selected.
//
// One instance, reached through property access (see state/lang.svelte.ts for why).

const STORAGE_KEY = "wordlists:settings";

class SettingsState {
  /** Whether topic and category rows offer the switch to English entries. Off by
   *  default: almost every row qualifies for it, and a control that useful to a
   *  few is still clutter to everyone else. */
  showEnglishToggle = $state(false);

  init(): void {
    const stored = read();
    if (stored) this.showEnglishToggle = !!stored.showEnglishToggle;
  }

  setShowEnglishToggle(on: boolean): void {
    this.showEnglishToggle = on;
    write({ showEnglishToggle: on });
  }
}

// localStorage throws in a few real setups (private mode, blocked storage), and a
// missing preference is never worth an error.
function read(): { showEnglishToggle?: boolean } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function write(value: { showEnglishToggle: boolean }): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable — the choice just won't survive a reload */
  }
}

export const settings = new SettingsState();
