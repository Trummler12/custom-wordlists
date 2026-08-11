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

  /** Omission rules the reader has switched off, so their entries come back —
   *  keyed `${topicId}:${groupId}:${ruleId}`. Only the switched-off ones are
   *  stored: the default is that everything a list omits stays omitted. */
  includedOmissions = $state<Record<string, boolean>>({});

  init(): void {
    const stored = read();
    if (!stored) return;
    this.showEnglishToggle = !!stored.showEnglishToggle;
    this.includedOmissions = stored.includedOmissions ?? {};
  }

  setShowEnglishToggle(on: boolean): void {
    this.showEnglishToggle = on;
    this.save();
  }

  key(tid: string, gid: string, ruleId: string): string {
    return `${tid}:${gid}:${ruleId}`;
  }

  /** The rule ids switched off for this group — what `visibleGroup` takes. */
  includedFor(tid: string, gid: string, ruleIds: string[]): string[] {
    return ruleIds.filter((id) => this.includedOmissions[this.key(tid, gid, id)]);
  }
  isIncluded(tid: string, gid: string, ruleId: string): boolean {
    return !!this.includedOmissions[this.key(tid, gid, ruleId)];
  }
  toggleOmission(tid: string, gid: string, ruleId: string): void {
    const k = this.key(tid, gid, ruleId);
    if (this.includedOmissions[k]) delete this.includedOmissions[k];
    else this.includedOmissions[k] = true;
    this.save();
  }

  private save(): void {
    write({
      showEnglishToggle: this.showEnglishToggle,
      includedOmissions: this.includedOmissions,
    });
  }
}

// localStorage throws in a few real setups (private mode, blocked storage), and a
// missing preference is never worth an error.
type Stored = { showEnglishToggle?: boolean; includedOmissions?: Record<string, boolean> };

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
