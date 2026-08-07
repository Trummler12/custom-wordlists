<script lang="ts">
  import { snapPositions } from "../../lib/fame";
  import type { Group } from "../../lib/types";
  import { lang } from "../../state/lang.svelte";
  import { selection } from "../../state/selection.svelte";
  import { topics } from "../../state/topics.svelte";

  let { tid, group }: { tid: string; group: Group } = $props();

  const k = $derived(selection.key(tid, group.id));
  const depth = $derived(selection.depth(k));
  const pos = $derived(snapPositions(group));
  const tiers = $derived(group.tiers?.length ?? 0);
</script>

<!-- A custom track rather than an <input range>: neither snap markers on the rail
     nor spacing that mirrors tier sizes are things the native control can do. -->
<div class="group-depth">
  <div
    class="depth-track"
    role="slider"
    tabindex="0"
    aria-valuemin="0"
    aria-valuemax={tiers}
    aria-valuenow={depth}
    aria-valuetext={lang.ui.tiersValueText(depth, tiers)}
    aria-label={lang.ui.fameDepthLabel(topics.groupTitle(group))}
    onpointerdown={(e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      selection.dragDepth(e, k, group);
    }}
    onpointermove={(e) => {
      if (e.buttons & 1) selection.dragDepth(e, k, group);
    }}
    onkeydown={(e) => selection.keyDepth(e, k, group)}
  >
    <span class="depth-rail"></span>
    <span class="depth-fill" style="width: calc({pos[depth]} * (100% - 2 * var(--inset)))"
    ></span>
    {#each pos as p, i (i)}
      <span
        class="depth-dot"
        class:on={i > depth}
        style="left: calc(var(--inset) + {p} * (100% - 2 * var(--inset)))"
      ></span>
    {/each}
    <span
      class="depth-thumb"
      style="left: calc(var(--inset) + {pos[depth]} * (100% - 2 * var(--inset)))"
    ></span>
  </div>
</div>
