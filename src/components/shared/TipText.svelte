<script lang="ts">
  import { overlays } from "../../state/overlays.svelte";
  import TipNote from "./TipNote.svelte";

  // A run of text that doubles as a persistent-tooltip trigger: hovering or tapping it
  // opens a `local` note (position owned by overlays) that shows `text`. Used for the
  // saved-lists / import / export content previews, where a touch reader has no hover
  // `title` to fall back on and needs a tap target to see what a list holds. The label
  // ellipsizes; `maxWidth` caps how wide it grows before it does.
  let {
    id,
    text,
    label,
    maxWidth = "12rem",
  }: { id: string; text: string; label: string; maxWidth?: string } = $props();
</script>

<button
  type="button"
  class="tip-text tip-trigger"
  style:max-width={maxWidth}
  aria-expanded={overlays.tip === id}
  aria-controls={id}
  onpointerenter={(e) => overlays.tipEnter(e, id, true)}
  onpointerleave={(e) => overlays.tipLeave(e)}
  onfocus={(e) => overlays.tipFocus(e, id, true)}
  onblur={overlays.releaseTip}
  onclick={(e) => overlays.tipClick(e, id, true)}>{label}</button
>
<TipNote {id} {text} local />

<style>
  /* Reads as the text it sits among, not a control — but it is a button so a touch
     device, which has no hover, can still open the note. Ellipsizes a label too long
     for the width it is given. */
  .tip-text {
    max-width: 12rem;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: help;
  }
</style>
