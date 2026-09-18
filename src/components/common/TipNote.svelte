<script lang="ts">
  import Msg from "../../locale/html/Msg.svelte";
  import { overlays } from "../../state/overlays.svelte";

  // The note half of a tooltip; the trigger is whatever element carries the
  // matching `tip-trigger` class and opens `id`. Its parent has to be positioned,
  // since the note stretches across it — see the CSS for why it can't hang off the
  // trigger itself. A `local` note instead pins to its trigger's own place (overlays
  // computes the fixed style), for a trigger sitting inside a scrolling popup.
  let { id, text, local = false }: { id: string; text: string; local?: boolean } = $props();
</script>

{#if overlays.tip === id}
  <!-- `tooltip`, not `status`: help text the reader asked for, not a live update
       that should interrupt whatever is being read. An unranked ruler points its
       aria-describedby at this note; the language warning instead carries the text
       in its own aria-label, where the note is a visual echo. -->
  <p
    class="tip-note"
    class:above={overlays.tipAbove && !local}
    class:pinned={overlays.tipPinned}
    class:local
    style={local ? overlays.tipStyle : ""}
    {id}
    role="tooltip"
  >
    <!-- Says the note is staying, which is otherwise only discoverable by moving
         the cursor away and seeing what happens. `aria-hidden`: it marks a
         pointer affordance, and the trigger's `aria-expanded` already carries the
         part that matters to a reader who has no pointer. -->
    {#if overlays.tipPinned}<span class="tip-pin" aria-hidden="true">📌</span>{/if}
    <Msg text={text} />
  </p>
{/if}

<style>
  /* Stretched across its positioned parent rather than hung off the trigger itself: a
     trigger sits somewhere in the middle of a row of unknown width, so any box anchored to
     it can leave the viewport on one side or the other. The parent that positions it belongs
     to whichever component renders this note. */
  .tip-note {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 10;
    margin: 0.15rem 0 0;
    padding: 0.4rem 0.55rem;
    font-size: 0.8rem;
    font-weight: 400;
    line-height: 1.35;
    color: var(--chip-fg);
    background: var(--chip-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  }
  /* Room for the 📌, so a first line can't run under it. Only while pinned: an unpinned note
     is the common case and shouldn't carry the gap for nothing. */
  .tip-note.pinned {
    padding-right: 1.5rem;
  }
  .tip-pin {
    position: absolute; /* .tip-note is the containing block */
    top: 0.25rem;
    right: 0.4rem;
    font-size: 0.65rem;
    line-height: 1;
    opacity: 0.75;
  }
  /* Set when the trigger sits low in the viewport, where a note below it would be cut off by
     the bottom edge — the vertical counterpart to the full-row stretch above. */
  .tip-note.above {
    top: auto;
    bottom: 100%;
    margin: 0 0 0.15rem;
  }
  /* A note anchored to a 👎 inside the scrolling language-type panel: overlays owns its
     position (fixed, from the trigger's rect, via the inline style), so here we only undo the
     full-row stretch, cap the width, and lift it above the panel. */
  .tip-note.local {
    left: auto;
    right: auto;
    top: auto;
    bottom: auto;
    margin: 0;
    max-width: min(18rem, 90vw);
    z-index: 30;
  }
</style>
