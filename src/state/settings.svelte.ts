// View preferences: what the tree offers, as opposed to what the user has picked
// in it. Kept apart from `selection` because none of this is part of a word list —
// it survives a reload and says nothing about what is selected.
//
// One instance, reached through property access (see state/lang.svelte.ts for why).

import { FLAG_TYPES, type FlagType } from "../locale/flags";

/** The one key this store persists under — exported so `reset` can clear exactly the
 *  selection settings without wiping the reader's custom lists alongside them. */
export const SETTINGS_STORAGE_KEY = "wordlists:settings";

class SettingsState {
  /** Whether topic and category rows offer the switch to the secondary language's
   *  entries. Off by default: almost every row qualifies for it, and a control that
   *  useful to a few is still clutter to everyone else. */
  showSecondaryToggle = $state(false);

  /** Which kind of flag that switch wears, where its language has more than one. */
  flagType = $state<FlagType>("country");

  /** Omission rules the reader has flipped away from their default — keyed
   *  `${topicId}:${groupId}:${ruleId}`. One set covers both directions: an
   *  `omitted` rule listed here is switched off, an `omittable` one switched on.
   *  Only deviations are stored, so the common case is an empty record. */
  toggledOmissions = $state<Record<string, boolean>>({});

  init(): void {
    const stored = read();
    if (!stored) return;
    // Read under its old name too: it was the English-only switch before LB3.
    this.showSecondaryToggle = !!(stored.showSecondaryToggle ?? stored.showEnglishToggle);
    if (stored.flagType && FLAG_TYPES.includes(stored.flagType)) this.flagType = stored.flagType;
    this.toggledOmissions = stored.toggledOmissions ?? {};
  }

  setShowSecondaryToggle(on: boolean): void {
    this.showSecondaryToggle = on;
    this.save();
  }
  setFlagType(type: FlagType): void {
    this.flagType = type;
    this.save();
  }

  key(tid: string, gid: string, ruleId: string): string {
    return `${tid}:${gid}:${ruleId}`;
  }

  /** The rule ids flipped for this group — what `visibleGroup` takes. */
  toggledFor(tid: string, gid: string, ruleIds: string[]): string[] {
    return ruleIds.filter((id) => this.toggledOmissions[this.key(tid, gid, id)]);
  }
  isToggled(tid: string, gid: string, ruleId: string): boolean {
    return !!this.toggledOmissions[this.key(tid, gid, ruleId)];
  }
  toggleOmission(tid: string, gid: string, ruleId: string): void {
    const k = this.key(tid, gid, ruleId);
    if (this.toggledOmissions[k]) delete this.toggledOmissions[k];
    else this.toggledOmissions[k] = true;
    this.save();
  }

  private save(): void {
    write({
      showSecondaryToggle: this.showSecondaryToggle,
      flagType: this.flagType,
      toggledOmissions: this.toggledOmissions,
    });
  }
}

// localStorage throws in a few real setups (private mode, blocked storage), and a
// missing preference is never worth an error.
type Stored = {
  showSecondaryToggle?: boolean;
  /** The pre-LB3 name of `showSecondaryToggle`, only ever read. */
  showEnglishToggle?: boolean;
  flagType?: FlagType;
  toggledOmissions?: Record<string, boolean>;
};

function read(): Stored | null {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function write(value: Stored): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable — the choice just won't survive a reload */
  }
}

export const settings = new SettingsState();
