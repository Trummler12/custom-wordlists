<script lang="ts">
  import { fameGroups, rulerTip, snapPositions } from "../../lib/fame";
  import type { Group, LocalizedString } from "../../lib/types";
  import { resolveStr } from "../../lib/words";
  import { resolveCondition, resolveProse } from "../../locale/topics";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import { selection } from "../../state/selection.svelte";
  import { topics } from "../../state/topics.svelte";
  import TipNote from "../common/TipNote.svelte";

  let { tid, group }: { tid: string; group: Group } = $props();

  const depth = $derived(selection.depthOf(tid, group));
  const pos = $derived(snapPositions(group));
  // What the thumb, the fill and the dots actually render at: the stored depth can
  // outrun the visible tiers when a fame cap hides the tail (the languages "< 1M"
  // box, unchecked), and `pos[depth]` would then be undefined — a thumb snapped to
  // the far left. Clamped, it sits at the floor the cap allows, where the selection
  // (correctly counted from the capped tiers) already is.
  const shownDepth = $derived(Math.min(depth, pos.length - 1));
  const fame = $derived(fameGroups(group));
  // The full, uncapped conditions, so the tooltip can name the deeper stored setting.
  const rawGroup = $derived(topics.rawGroups(tid)[0]);
  // A ranked list can say so in a plain `title`: reading it means hovering, which
  // means a mouse. The invitation an unranked list carries is the one that has to
  // reach a phone, so that one gets the custom note.
  const ranked = $derived(fame > 1);
  // What the ruler says on hover: the list's own line where it declares one (the
  // condition just brought in, moving with the thumb), else the bare tier count.
  // The prefix comes from the locale, and turns to "Mostly selected" when a merged
  // topic's contributors don't all sit at this position.
  const prefix = $derived(
    selection.depthMixed(tid) ? lang.ui.fame.mostlySelected : lang.ui.fame.selected,
  );
  // The tooltip frame (`text`/`empty`) resolves as a prose id; the tier conditions as
  // band-key / prose-id tokens. A literal language map (should any topic still carry one)
  // still resolves through resolveStr, so the resolvers accept either form.
  const asText = (s: LocalizedString) =>
    typeof s === "string" ? resolveProse(s, lang.uiLang) : resolveStr(s, lang.uiLang);
  const asCond = (s: LocalizedString) =>
    typeof s === "string" ? resolveCondition(s, lang.uiLang) : resolveStr(s, lang.uiLang);
  const tip = $derived(
    rulerTip(group, depth, asText, asCond, prefix, {
      conditions: rawGroup?.tierConditions,
      wrap: lang.ui.fame.stored,
    }) ?? lang.ui.fame.groupsDefined(fame),
  );
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
    aria-valuenow={shownDepth}
    aria-valuetext={lang.ui.fame.valueText(shownDepth, pos.length - 1)}
    aria-label={lang.ui.fame.depthLabel(topics.groupName(group).long)}
    aria-describedby={ranked ? undefined : tipId}
    title={ranked ? tip : undefined}
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
    onfocus={(e) => !ranked && overlays.tipFocus(e, tipId)}
    onblur={() => !ranked && overlays.releaseTip()}
    onkeydown={(e) => selection.keyDepth(e, tid, group)}
  >
    <span class="depth-rail"></span>
    <span class="depth-fill" style="width: calc({pos[shownDepth]} * (100% - 2 * var(--inset)))"
    ></span>
    {#each pos as p, i (i)}
      <span
        class="depth-dot"
        class:on={i > shownDepth}
        style="left: calc(var(--inset) + {p} * (100% - 2 * var(--inset)))"
      ></span>
    {/each}
    <span
      class="depth-thumb"
      style="left: calc(var(--inset) + {pos[shownDepth]} * (100% - 2 * var(--inset)))"
    ></span>
  </div>
  <TipNote id={tipId} text={lang.ui.fame.none} />
</div>

<style>
  /* Per-group fame-depth slider — a custom track so the snap markers can sit on the rail
     and their spacing can mirror tier sizes (a native <input range> can do neither). Colours
     come from the shared --range-* vars in themes.css. The thumb/fill/dot positions are set
     inline (computed from the snap positions), so only the static chrome lives here. */
  .group-depth {
    position: relative; /* anchor for this ruler's .tip-note */
    margin: 0.45rem 0 0.7rem 1.75rem;
    width: 100%;
    max-width: 16rem;
  }
  /* On the topic row itself, one level less of nesting than a group's ruler, so it lines
     up under the topic title rather than under a group name that isn't there. Reaches up to
     the parent TopicRow's .topic-item. */
  :global(.topic-item) > .group-depth {
    margin-left: 2.85rem;
  }
  .depth-track {
    --inset: 8px; /* keeps the end dots off the rail edges; matches INSET_PX in App.svelte */
    position: relative;
    /* Own stacking context, so the dots/thumb z-indexes below stack only against each other
       and can't escape to the root context (where they would paint over the fixed footer).
       The ruler's tip-note is a sibling of the track, not a child, so it stays free to span rows. */
    isolation: isolate;
    height: 1rem; /* hit area; the visible rail is thinner */
    cursor: pointer;
    touch-action: none; /* let pointer drag work without scrolling */
  }
  .depth-rail,
  .depth-fill {
    position: absolute;
    top: 50%;
    height: 0.3rem;
    border-radius: 999px;
    transform: translateY(-50%);
    pointer-events: none;
  }
  .depth-rail {
    left: var(--inset);
    right: var(--inset);
    background: var(--range-track);
  }
  .depth-fill {
    left: var(--inset);
    background: var(--range-fill);
  }
  /* Inverted contrast on purpose: a dot on the blue fill is light, a dot on the grey track
     is blue — so a marker stays visible on either side of the thumb. */
  .depth-dot {
    position: absolute;
    top: 50%;
    width: 0.34rem;
    height: 0.34rem;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: var(--range-dot); /* left of the thumb, on the blue fill → light */
    pointer-events: none;
    z-index: 1;
  }
  .depth-dot.on {
    background: var(--range-fill); /* right of the thumb, on the grey track → blue */
  }
  .depth-thumb {
    position: absolute;
    top: 50%;
    width: 0.85rem;
    height: 0.85rem;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: var(--range-fill);
    border: 2px solid var(--range-thumb-ring);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
    pointer-events: none;
    z-index: 2;
  }
  .depth-track:focus-visible {
    outline: none;
  }
  .depth-track:focus-visible .depth-thumb {
    outline: 2px solid var(--range-fill);
    outline-offset: 2px;
  }
</style>
