<script lang="ts">
  import { plain } from "../../locale/html/plain";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";

  // The marker only — TopicRow renders the note, for the reason given there.
  let { topicId }: { topicId: string } = $props();
</script>

<!-- A button, not a bare span: a `title` tooltip needs a hover, which touch
     devices don't have. -->
<button
  type="button"
  class="lang-warning"
  aria-expanded={overlays.warnTopic === topicId}
  aria-controls={`lang-note-${topicId}`}
  aria-label={plain(lang.ui.langUnsupported(lang.name(lang.current)))}
  onpointerenter={(e) => overlays.warnEnter(e, topicId)}
  onpointerleave={(e) => overlays.warnLeave(e)}
  onfocus={(e) => overlays.openWarn(topicId, e.currentTarget)}
  onblur={overlays.closeWarn}
  onclick={(e) => overlays.warnClick(e, topicId)}>⚠️</button
>
