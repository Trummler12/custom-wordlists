<script lang="ts">
  import { setIndeterminate } from "../../lib/dom";
  import type { Group } from "../../lib/types";
  import { lang } from "../../state/lang.svelte";
  import { selection } from "../../state/selection.svelte";
  import { topics } from "../../state/topics.svelte";
  import FameDepthSlider from "./FameDepthSlider.svelte";
  import NamesModeSelect from "./NamesModeSelect.svelte";

  let { tid, group }: { tid: string; group: Group } = $props();

  const name = $derived(topics.groupName(group));
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
      <span class="title" title={name.short !== name.long ? name.long : undefined}>
        {name.short}
      </span>
    </label>
    <NamesModeSelect {tid} {group} label={name.long} />
    <span
      class="meta"
      title={lang.ui.wordsOf(selection.groupSelCount(tid, group), selection.groupTotal(tid, group))}
    >
      {selection.groupSelCount(tid, group)}/<span class="total"
        >{selection.groupTotal(tid, group)}</span
      >
    </span>
  </div>
  <FameDepthSlider {tid} {group} />
</li>
