<script lang="ts">
  import type { Group, NamesMode } from "../../lib/types";
  import { groupHasNames, groupHasPref, groupHasVariants } from "../../lib/words";
  import { lang } from "../../state/lang.svelte";
  import { selection } from "../../state/selection.svelte";

  // `label` rather than the group's own title: on a single-group topic the group
  // isn't named anywhere on screen, so the row's topic title is what a screen
  // reader has to hear.
  let { tid, group, label }: { tid: string; group: Group; label: string } = $props();

  const mode = $derived(selection.modeOf(tid, group));
  // When a synthesized topic's contributors disagree, the select shows the common
  // mode through a hidden sentinel value rather than the real one — so re-picking
  // that same mode is still a change the browser reports, and it unifies the lot.
  // A native <select> fires no event when the already-selected option is chosen.
  const mixed = $derived(selection.modeMixed(tid));
</script>

{#if groupHasNames(group, lang.current)}
  <select
    class="names-mode"
    aria-label={lang.ui.names.formLabel(label)}
    value={mixed ? "" : mode}
    onchange={(e) => selection.setMode(tid, group, e.currentTarget.value as NamesMode)}
  >
    {#if mixed}<option value="" hidden>{lang.ui.names.form[mode]}</option>{/if}
    <option value="short">{lang.ui.names.form.short}</option>
    <option value="long">{lang.ui.names.form.long}</option>
    <option value="both">{lang.ui.names.form.both}</option>
    <!-- `pref` sits below `both`, so the order reads that both and pref alike build on
         short/long — pref not above, where it would read as "even more than both". -->
    {#if groupHasPref(group, lang.current)}
      <option value="pref">{lang.ui.names.form.pref}</option>
    {/if}
    {#if groupHasVariants(group, lang.current)}
      <option value="all">{lang.ui.names.form.all}</option>
    {/if}
  </select>
{/if}
