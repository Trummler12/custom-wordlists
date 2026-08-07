// The generated word list. Everything here is derived from the selection — there
// is no state to keep beyond the "Copied!" flash, which is why this module is the
// short one despite being the point of the whole app.

import { SKRIBBL } from "../lib/skribbl";
import { renderEntry } from "../lib/words";
import { lang } from "./lang.svelte";
import { selection } from "./selection.svelte";
import { topics } from "./topics.svelte";

class OutputState {
  /** Every selected group's words, de-duplicated, in manifest order. */
  readonly merged: string[] = $derived.by(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of topics.all) {
      const data = topics.data[t.id];
      if (!data) continue;
      for (const g of data.groups) {
        const mode = selection.modeOf(selection.key(t.id, g.id));
        for (const e of selection.entriesOf(t.id, g)) {
          for (const w of renderEntry(e, mode, lang.current)) {
            if (!seen.has(w)) {
              seen.add(w);
              out.push(w);
            }
          }
        }
      }
    }
    return out;
  });

  readonly included: string[] = $derived(
    this.merged.filter((w) => w.length <= SKRIBBL.maxWordLen),
  );
  readonly excluded: string[] = $derived(
    this.merged.filter((w) => w.length > SKRIBBL.maxWordLen),
  );
  readonly text: string = $derived(this.included.join(SKRIBBL.separator));
  readonly charCount: number = $derived(this.text.length);

  // The counter only renders when merged is non-empty, so these need no guard.
  readonly belowMin: boolean = $derived(this.included.length < SKRIBBL.minWords);
  readonly overMax: boolean = $derived(this.charCount > SKRIBBL.maxTotal);

  /** True for a moment after a successful copy, for the button's label. */
  copied = $state(false);

  copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(this.text);
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    } catch {
      /* clipboard unavailable (e.g. insecure context) — ignore */
    }
  };
}

export const output = new OutputState();
