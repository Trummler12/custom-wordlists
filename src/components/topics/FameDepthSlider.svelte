<script lang="ts">
  import { fameGroups, snapPositions } from "../../lib/fame";
  import type { Group } from "../../lib/types";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import { selection } from "../../state/selection.svelte";
  import { topics } from "../../state/topics.svelte";
  import TipNote from "../common/TipNote.svelte";

  let { tid, group }: { tid: string; group: Group } = $props();

  const depth = $derived(selection.depthOf(tid, group));
  const pos = $derived(snapPositions(group));
  const fame = $derived(fameGroups(group));
  // A ranked list can say so in a plain `title`: reading it means hovering, which
  // means a mouse. The invitation an unranked list carries is the one that has to
  // reach a phone, so that one gets the custom note.
  const ranked = $derived(fame > 1);
  const tipId = $derived(`fame-${tid}-${group.id}`);
</script>

<!-- A custom track rather than an <input range>: neither snap markers on the rail
     nor spacing that mirrors tier sizes are things the native control can do. -->
<div class="group-depth">
  <div
    class="depth-track"
    class:tip-trigger={!ranked}
    role="slider"
    tabindex="0"
    aria-valuemin="0"
    aria-valuemax={pos.length - 1}
    aria-valuenow={depth}
    aria-valuetext={lang.ui.tiersValueText(depth, pos.length - 1)}
    aria-label={lang.ui.fameDepthLabel(topics.groupName(group).long)}
    aria-describedby={ranked ? undefined : tipId}
    title={ranked ? lang.ui.fameGroupsDefined(fame) : undefined}
    onpointerdown={(e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      selection.dragDepth(e, tid, group);
      // Also on touch, and also when the drag itself is what raised the question
      // of why the track has only the one step.
      if (!ranked) overlays.openTip(tipId, e.currentTarget);
    }}
    onpointermove={(e) => {
      if (e.buttons & 1) selection.dragDepth(e, tid, group);
    }}
    onpointerenter={(e) => !ranked && overlays.tipEnter(e, tipId)}
    onpointerleave={(e) => !ranked && overlays.tipLeave(e)}
    onfocus={(e) => !ranked && overlays.openTip(tipId, e.currentTarget)}
    onblur={() => !ranked && overlays.closeTip()}
    onkeydown={(e) => selection.keyDepth(e, tid, group)}
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
  <TipNote id={tipId} text={lang.ui.noFameGroups} />
</div>
