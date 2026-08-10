<script lang="ts">
  import { plain } from "../../locale/html/plain";
  import { overlays } from "../../state/overlays.svelte";

  // The marker only — TopicRow renders the note, for the reason given there, and
  // decides which of the two this is: ⚠️ for a language nobody has confirmed, ℹ️ for
  // one whose names are English on purpose.
  let { tipId, icon, text }: { tipId: string; icon: string; text: string } = $props();
</script>

<!-- A button, not a bare span: a `title` tooltip needs a hover, which touch
     devices don't have. -->
<button
  type="button"
  class="lang-marker tip-trigger"
  aria-expanded={overlays.tip === tipId}
  aria-controls={tipId}
  aria-label={plain(text)}
  onpointerenter={(e) => overlays.tipEnter(e, tipId)}
  onpointerleave={(e) => overlays.tipLeave(e)}
  onfocus={(e) => overlays.openTip(tipId, e.currentTarget)}
  onblur={overlays.closeTip}
  onclick={(e) => overlays.tipClick(e, tipId)}>{icon}</button
>
