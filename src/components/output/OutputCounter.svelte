<script lang="ts">
  import { SKRIBBL } from "../../lib/skribbl";
  import { lang } from "../../state/lang.svelte";
  import { output } from "../../state/output.svelte";
</script>

<!-- Only rendered with a non-empty list, so the limits need no empty-guard. -->
<p class="counter" class:warn={output.belowMin || output.overMax}>
  {lang.ui.wordsLabel}: {output.included.length} · {lang.ui.charsLabel}: {output.charCount.toLocaleString()}
  / {SKRIBBL.maxTotal.toLocaleString()}
  {#if output.belowMin}{lang.ui.belowMin(SKRIBBL.minWords)}{/if}
  {#if output.overMax}{lang.ui.overMax}{/if}
</p>

{#if output.excluded.length > 0}
  <p class="status warn">
    {lang.ui.excluded(output.excluded.length, SKRIBBL.maxWordLen, output.excluded.join(", "))}
  </p>
{/if}
