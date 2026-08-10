<script lang="ts">
  import { plain } from "../../locale/html/plain";
  import { overlays } from "../../state/overlays.svelte";

  // The trigger half of a tooltip: a small glyph that opens `tipId`. The caller
  // renders the matching TipNote, and picks the glyph — ⚠️ where something is
  // unconfirmed, ℹ️ where it is deliberate.
  let { tipId, icon, text }: { tipId: string; icon: string; text: string } = $props();
</script>

<!-- A button, not a bare span: a `title` tooltip needs a hover, which touch
     devices don't have. -->
<button
  type="button"
  class="tip-marker tip-trigger"
  aria-expanded={overlays.tip === tipId}
  aria-controls={tipId}
  aria-label={plain(text)}
  onpointerenter={(e) => overlays.tipEnter(e, tipId)}
  onpointerleave={(e) => overlays.tipLeave(e)}
  onfocus={(e) => overlays.openTip(tipId, e.currentTarget)}
  onblur={overlays.closeTip}
  onclick={(e) => overlays.tipClick(e, tipId)}>{icon}</button
>
