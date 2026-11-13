<script lang="ts">
  import Msg from "../../locale/html/Msg.svelte";
  import { separatorLabel } from "../../lib/custom";
  import { SKRIBBL } from "../../lib/skribbl";
  import { settings } from "../../state/settings.svelte";
  import { lang } from "../../state/lang.svelte";
  import { output } from "../../state/output.svelte";
</script>

<!-- Only rendered with a non-empty list, so the limits need no empty-guard. -->
<p class="counter" class:warn={output.belowMin || output.overMax}>
  <Msg text={lang.ui.output.words} />: {output.merged.length} · <Msg text={lang.ui.output.chars} />: {output.charCount.toLocaleString()}
  / {SKRIBBL.maxTotal.toLocaleString()}
  {#if output.belowMin}<Msg text={lang.ui.output.belowMin(SKRIBBL.minWords)} />{/if}
  {#if output.overMax}<Msg text={lang.ui.output.overMax} />{/if}
</p>

<!-- A count and a hover, not a list: these are in the output because someone asked
     for them, so this is a reminder of what they chose rather than a report of
     something that happened to them. -->
{#if output.overlong.length > 0}
  <p class="status warn" title={output.overlong.join(", ")}>
    <Msg text={lang.ui.output.overLong(output.overlong.length, SKRIBBL.maxWordLen)} />
  </p>
{/if}
{#if output.splitting.length > 0}
  <p class="status warn" title={output.splitting.join(", ")}>
    <Msg text={lang.ui.output.splitting(output.splitting.length, separatorLabel(settings.outputSeparator))} />
  </p>
{/if}

<style>
  .counter {
    color: var(--muted);
    font-size: 0.85rem;
    margin: 0.6rem 0 0;
  }
  .counter.warn {
    font-weight: 600;
  }
</style>
