<script lang="ts">
  import { plain } from "../../locale/html/plain";
  import { overlays } from "../../state/overlays.svelte";

  // The trigger half of a tooltip: a small glyph that opens `tipId`. The caller
  // renders the matching TipNote, and picks the glyph — ⚠️ where something is
  // unconfirmed, ℹ️ where it is deliberate.
  let { tipId, icon, text }: { tipId: string; icon: string; text: string } = $props();
</script>

<!-- A button, not a bare span: a `title` tooltip needs a hover, which touch
     devices don't have — and a click has to be able to pin the note, since a note
     holding a link is one the reader has to be able to walk the cursor into.
     `releaseTip` on blur rather than `closeTip` for the same reason: clicking a
     link inside the note blurs this button, and closing on that would delete the
     link before the click landed on it. -->
<button
  type="button"
  class="tip-marker tip-trigger"
  aria-expanded={overlays.tip === tipId}
  aria-controls={tipId}
  aria-label={plain(text)}
  onpointerenter={(e) => overlays.tipEnter(e, tipId)}
  onpointerleave={(e) => overlays.tipLeave(e)}
  onfocus={(e) => overlays.tipFocus(e, tipId)}
  onblur={overlays.releaseTip}
  onclick={(e) => overlays.tipClick(e, tipId)}>{icon}</button
>
