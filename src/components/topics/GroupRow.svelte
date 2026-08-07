<script lang="ts">
  import { setIndeterminate } from "../../lib/dom";
  import { groupHasNames } from "../../lib/words";
  import type { Group, NamesMode } from "../../lib/types";
  import { lang } from "../../state/lang.svelte";
  import { selection } from "../../state/selection.svelte";
  import { topics } from "../../state/topics.svelte";
  import FameDepthSlider from "./FameDepthSlider.svelte";

  let { tid, group }: { tid: string; group: Group } = $props();

  const k = $derived(selection.key(tid, group.id));
</script>

<li>
  <div class="group">
    <label class="group-label">
      <input
        type="checkbox"
        checked={selection.groupFull(tid, group)}
        use:setIndeterminate={selection.groupPartial(tid, group)}
        onchange={() => selection.toggleGroup(tid, group)}
      />
      <span class="title">{topics.groupTitle(group)}</span>
    </label>
    {#if groupHasNames(group, lang.current)}
      <select
        class="names-mode"
        aria-label={lang.ui.nameFormLabel(topics.groupTitle(group))}
        value={selection.modeOf(k)}
        onchange={(e) => selection.setMode(k, e.currentTarget.value as NamesMode)}
      >
        <option value="short">{lang.ui.nameForm.short}</option>
        <option value="long">{lang.ui.nameForm.long}</option>
        <option value="both">{lang.ui.nameForm.both}</option>
      </select>
    {/if}
    <span class="meta"
      >{lang.ui.wordsOf(selection.groupSelCount(tid, group), selection.groupTotal(tid, group))}</span
    >
  </div>
  <!-- A single tier has nothing to slide between. -->
  {#if group.tiers && group.tiers.length > 1}
    <FameDepthSlider {tid} {group} />
  {/if}
</li>
