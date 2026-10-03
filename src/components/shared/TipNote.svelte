<script lang="ts">
  import { localNote, placement, rowPopup } from "./placement";
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
    use:placement={local ? localNote(overlays.opener("tip")) : rowPopup(overlays.opener("tip"))}
    class:local
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
  /* A row's note is placed like a row's panels (shared/placement, inline); a local note by
     overlays (fixed, from its trigger's rect). */
  .tip-note {
    position: absolute;
    z-index: 10;
    margin: 0;
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
  /* Floated into the text flow rather than set off by padding, so only the line or two beside
     it make room; the rest of the note keeps its full width. */
  .tip-pin {
    float: right;
    margin: -0.15rem -0.2rem 0 0.4rem;
    font-size: 0.65rem;
    line-height: 1;
    opacity: 0.75;
  }
  /* Fixed, so the scrolling panel it belongs to doesn't clip it, and above that panel. */
  .tip-note.local {
    position: fixed;
    z-index: 30;
  }
</style>
