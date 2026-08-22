<script lang="ts">
  import type { Group, NamesMode } from "../../lib/types";
  import { groupHasNames } from "../../lib/words";
  import { lang } from "../../state/lang.svelte";
  import { selection } from "../../state/selection.svelte";

  // `label` rather than the group's own title: on a single-group topic the group
  // isn't named anywhere on screen, so the row's topic title is what a screen
  // reader has to hear.
  let { tid, group, label }: { tid: string; group: Group; label: string } = $props();
</script>

{#if groupHasNames(group, lang.current)}
  <select
    class="names-mode"
    aria-label={lang.ui.names.formLabel(label)}
    value={selection.modeOf(tid, group)}
    onchange={(e) => selection.setMode(tid, group, e.currentTarget.value as NamesMode)}
  >
    <option value="short">{lang.ui.names.form.short}</option>
    <option value="long">{lang.ui.names.form.long}</option>
    <option value="both">{lang.ui.names.form.both}</option>
  </select>
{/if}
