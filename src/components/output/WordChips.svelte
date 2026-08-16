<script lang="ts">
  import { selectAll } from "../../lib/dom";
  import { lang } from "../../state/lang.svelte";
  import { output } from "../../state/output.svelte";

  let node: HTMLDivElement;

  /** Select the whole list from outside — what the Copy button falls back to when
   *  the clipboard turns it down, so the reader is one keystroke from the list
   *  rather than back at square one. */
  export function select(): void {
    node?.focus();
    if (node) selectAll(node);
  }
</script>

<!-- Read-only per-word chips rather than a textarea, so M2 can colour words. It
     still behaves like one to select from: click or Enter/Space takes the lot. -->
<div
  bind:this={node}
  class="chips"
  role="textbox"
  aria-readonly="true"
  aria-label={lang.ui.output.generatedList}
  tabindex="0"
  onclick={(e) => selectAll(e.currentTarget)}
  onkeydown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectAll(e.currentTarget);
    }
  }}
>
  {#each output.included as w (w)}<span class="chip">{w}</span>{/each}
</div>
