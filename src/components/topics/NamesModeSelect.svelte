<script lang="ts">
  import type { Group, NamesMode } from "../../lib/types";
  import { groupHasNames } from "../../lib/words";
  import { lang } from "../../state/lang.svelte";
  import { selection } from "../../state/selection.svelte";

  // `label` rather than the group's own title: on a single-group topic the group
  // isn't named anywhere on screen, so the row's topic title is what a screen
  // reader has to hear.
  let { tid, group, label }: { tid: string; group: Group; label: string } = $props();

  const k = $derived(selection.key(tid, group.id));
</script>

{#if groupHasNames(group, lang.current)}
  <select
    class="names-mode"
    aria-label={lang.ui.nameFormLabel(label)}
    value={selection.modeOf(k)}
    onchange={(e) => selection.setMode(k, e.currentTarget.value as NamesMode)}
  >
    <option value="short">{lang.ui.nameForm.short}</option>
    <option value="long">{lang.ui.nameForm.long}</option>
    <option value="both">{lang.ui.nameForm.both}</option>
  </select>
{/if}
