<script lang="ts">
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";

  // The marker only. Its note is rendered by TopicRow, outside the row's <label>:
  // inside it, a click on the note counts as activating the label and would tick
  // the topic. The marker itself may stay — interactive content doesn't forward.
  let { topicId }: { topicId: string } = $props();
</script>

<!-- A button, not a bare span: a `title` tooltip needs a hover, which touch
     devices don't have. -->
<button
  type="button"
  class="lang-warning"
  aria-expanded={overlays.warnTopic === topicId}
  aria-controls={`lang-note-${topicId}`}
  aria-label={lang.ui.langUnsupported(lang.name(lang.current))}
  onpointerenter={(e) => overlays.warnEnter(e, topicId)}
  onpointerleave={(e) => overlays.warnLeave(e)}
  onfocus={(e) => overlays.openWarn(topicId, e.currentTarget)}
  onblur={overlays.closeWarn}
  onclick={(e) => overlays.warnClick(e, topicId)}>⚠️</button
>
