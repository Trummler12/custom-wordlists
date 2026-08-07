<script lang="ts">
  import { setIndeterminate } from "../../lib/dom";
  import type { Group } from "../../lib/types";
  import { lang } from "../../state/lang.svelte";
  import { selection } from "../../state/selection.svelte";
  import { topics } from "../../state/topics.svelte";
  import FameDepthSlider from "./FameDepthSlider.svelte";
  import NamesModeSelect from "./NamesModeSelect.svelte";

  let { tid, group }: { tid: string; group: Group } = $props();
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
    <NamesModeSelect {tid} {group} label={topics.groupTitle(group)} />
    <span class="meta"
      >{lang.ui.wordsOf(selection.groupSelCount(tid, group), selection.groupTotal(tid, group))}</span
    >
  </div>
  <!-- A single tier has nothing to slide between. -->
  {#if group.tiers && group.tiers.length > 1}
    <FameDepthSlider {tid} {group} />
  {/if}
</li>
