<script lang="ts">
  import { localNote, placement, rowPopup } from "./placement";
  import Msg from "../../locale/html/Msg.svelte";
  import { plain } from "../../locale/html/plain";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";

  // The note half of a tooltip; the trigger is whatever element carries the
  // matching `tip-trigger` class and opens `id`. Its parent has to be positioned,
  // since the note stretches across it — see the CSS for why it can't hang off the
  // trigger itself. A `local` note instead pins to its trigger's own place (overlays
  // computes the fixed style), for a trigger sitting inside a scrolling popup. `literal`
  // shows the text as it is, for a reader's own words that must not be read as markup.
  let {
    id,
    text,
    local = false,
    literal = false,
  }: { id: string; text: string; local?: boolean; literal?: boolean } = $props();
</script>

{#if overlays.tip === id}
  <!-- `tooltip`, not `status`: help text the reader asked for, not a live update
       that should interrupt whatever is being read. An unranked ruler points its
       aria-describedby at this note; the language warning instead carries the text
       in its own aria-label, where the note is a visual echo. -->
  <p
    class="popup tip-note"
    use:placement={local ? localNote(overlays.opener("tip")) : rowPopup(overlays.opener("tip"))}
    class:local
    {id}
    role="tooltip"
    onpointerdown={overlays.tipNotePress}
    onpointerleave={overlays.tipNoteLeave}
  >
    <!-- Says the note is staying, which is otherwise only discoverable by moving
         the cursor away and seeing what happens, and is the way to let it go again. -->
    {#if overlays.tipPinned}
      <button
        type="button"
        class="tip-pin"
        aria-label={plain(lang.ui.tip.unpin)}
        title={plain(lang.ui.tip.unpin)}
        onclick={overlays.unpinTip}>📌</button
      >
    {/if}
    {#if literal}{text}{:else}<Msg text={text} />{/if}
  </p>
{/if}

<style>
  /* A row's note is placed like a row's panels (shared/placement, inline); a local note by
     overlays (fixed, from its trigger's rect). */
  .tip-note {
    margin: 0;
    padding: 0.4rem 0.55rem;
    font-size: 0.8rem;
    font-weight: 400;
    line-height: 1.35;
  }
  /* Floated into the text flow rather than set off by padding, so only the line or two beside
     it make room; the rest of the note keeps its full width. */
  .tip-pin {
    float: right;
    margin: -0.3rem -0.35rem 0 0.25rem;
    padding: 0.15rem;
    background: none;
    border: none;
    font: inherit;
    font-size: 0.65rem;
    line-height: 1;
    opacity: 0.75;
    cursor: pointer;
  }
  .tip-pin:hover,
  .tip-pin:focus-visible {
    opacity: 1;
  }
  /* Fixed, so the scrolling panel it belongs to doesn't clip it, and above that panel. */
  .tip-note.local {
    position: fixed;
    z-index: 30;
  }
</style>
