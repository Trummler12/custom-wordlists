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
      // Through groupsOf, not data.groups: it is what applies each list's
      // omissions, and the output must agree with the counts beside it.
      for (const g of topics.groupsOf(t)) {
        const mode = selection.modeOf(t.id, g);
        // Per topic, not per app: a topic switched to English emits English here
        // while the rest of the list follows the interface language.
        const code = lang.contentLang(t.id);
        const derived = lang.derivesRomaji(t.id);
        for (const e of selection.entriesOf(t.id, g)) {
          for (const w of renderEntry(e, mode, code, derived)) {
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

  /** What the last copy attempt came to, for a moment afterwards. Three states
   *  rather than a boolean, because a copy that doesn't happen has to look
   *  different from one that hasn't been asked for. */
  copyState = $state<"idle" | "copied" | "failed">("idle");

  /** Copy the list, reporting whether it worked so the caller can offer the
   *  manual route.
   *
   *  It really does fail: `navigator.clipboard` is undefined on any origin that
   *  isn't secure, and `writeText` rejects when the document has lost focus or
   *  permission is refused. All of that used to be swallowed, leaving the one
   *  action the app exists for indistinguishable from a dead button. */
  copy = async (): Promise<boolean> => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(this.text);
      ok = true;
    } catch {
      /* reported through the return value and copyState, not hidden */
    }
    this.copyState = ok ? "copied" : "failed";
    // A failure has something to read and something to do about it, so it stays
    // up longer than the confirmation does. Cleared first: without that, a second
    // click inherits the first click's timer and its message vanishes early.
    clearTimeout(this.#reset);
    this.#reset = setTimeout(() => (this.copyState = "idle"), ok ? 1500 : 5000);
    return ok;
  };

  #reset: ReturnType<typeof setTimeout> | undefined;
}

export const output = new OutputState();
