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
  {#each output.merged as w (w)}<span class="chip">{w}</span>{/each}
</div>

<style>
  .chips {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start; /* pack chip rows at the top, don't spread them */
    align-items: flex-start; /* keep each chip its natural height, not stretched */
    gap: 0.35rem;
    padding: 0.6rem;
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    /* Grow to fill the output panel; min-height:0 lets the chips scroll inside the flex
       column instead of stretching it. The counter below stays visible. */
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    /* The chips box is the one area whose wheel must NOT chain to the page scroll. */
    overscroll-behavior: contain;
    cursor: text;
  }
  /* Stacked layout: the box no longer fills a sticky column, so cap it and let it size to
     content instead of growing (matches the .output un-pinning in OutputPanel). */
  @media (max-width: 50rem) {
    .chips {
      flex: none;
      max-height: min(24rem, calc(100vh - 6rem));
    }
  }
  .chip {
    background: var(--chip-bg);
    color: var(--chip-fg);
    border-radius: var(--radius-sm);
    padding: 0.1rem 0.45rem;
    font-size: 0.9rem;
  }
</style>
