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

  /** Omission rules the reader has flipped away from their default — keyed
   *  `${topicId}:${groupId}:${ruleId}`. One set covers both directions: an
   *  `omitted` rule listed here is switched off, an `omittable` one switched on.
   *  Only deviations are stored, so the common case is an empty record. */
  toggledOmissions = $state<Record<string, boolean>>({});

  init(): void {
    const stored = read();
    if (!stored) return;
    this.showEnglishToggle = !!stored.showEnglishToggle;
    this.toggledOmissions = stored.toggledOmissions ?? {};
  }

  setShowEnglishToggle(on: boolean): void {
    this.showEnglishToggle = on;
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
      showEnglishToggle: this.showEnglishToggle,
      toggledOmissions: this.toggledOmissions,
    });
  }
}

// localStorage throws in a few real setups (private mode, blocked storage), and a
// missing preference is never worth an error.
type Stored = { showEnglishToggle?: boolean; toggledOmissions?: Record<string, boolean> };

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
    /* storage unavailable — the choice just won't survive a reload */
  }
}

export const settings = new SettingsState();
