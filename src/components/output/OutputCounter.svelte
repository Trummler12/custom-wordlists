<script lang="ts">
  import { SKRIBBL } from "../../lib/skribbl";
  import { lang } from "../../state/lang.svelte";
  import { output } from "../../state/output.svelte";
</script>

<!-- Only rendered with a non-empty list, so the limits need no empty-guard. -->
<p class="counter" class:warn={output.belowMin || output.overMax}>
  {lang.ui.output.words}: {output.merged.length} · {lang.ui.output.chars}: {output.charCount.toLocaleString()}
  / {SKRIBBL.maxTotal.toLocaleString()}
  {#if output.belowMin}{lang.ui.output.belowMin(SKRIBBL.minWords)}{/if}
  {#if output.overMax}{lang.ui.output.overMax}{/if}
</p>

<!-- A count and a hover, not a list: these are in the output because someone asked
     for them, so this is a reminder of what they chose rather than a report of
     something that happened to them. -->
{#if output.overlong.length > 0}
  <p class="status warn" title={output.overlong.join(", ")}>
    {lang.ui.output.overLong(output.overlong.length, SKRIBBL.maxWordLen)}
  </p>
{/if}
