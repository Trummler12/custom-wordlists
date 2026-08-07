<script lang="ts">
  import { langWarning } from "../../locale";
  import { plain } from "../../locale/html/plain";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";

  // The marker only — TopicRow renders the note, for the reason given there.
  let { tipId }: { tipId: string } = $props();

  const text = $derived(langWarning(lang.ui, lang.current, lang.name(lang.current)));
</script>

<!-- A button, not a bare span: a `title` tooltip needs a hover, which touch
     devices don't have. -->
<button
  type="button"
  class="lang-warning tip-trigger"
  aria-expanded={overlays.tip === tipId}
  aria-controls={tipId}
  aria-label={plain(text)}
  onpointerenter={(e) => overlays.tipEnter(e, tipId)}
  onpointerleave={(e) => overlays.tipLeave(e)}
  onfocus={(e) => overlays.openTip(tipId, e.currentTarget)}
  onblur={overlays.closeTip}
  onclick={(e) => overlays.tipClick(e, tipId)}>⚠️</button
>
