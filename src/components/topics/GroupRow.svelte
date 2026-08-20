<script lang="ts">
  import { setIndeterminate } from "../../lib/dom";
  import { tierNoteAt } from "../../lib/fame";
  import type { Group } from "../../lib/types";
  import { resolveStr } from "../../lib/words";
  import { lang } from "../../state/lang.svelte";
  import { selection } from "../../state/selection.svelte";
  import { topics } from "../../state/topics.svelte";
  import TipMarker from "../common/TipMarker.svelte";
  import TipNote from "../common/TipNote.svelte";
  import FameDepthSlider from "./FameDepthSlider.svelte";
  import NamesModeSelect from "./NamesModeSelect.svelte";
  import OmittedPanel from "./OmittedPanel.svelte";

  // `hideRuler` comes from the topic: a node on its path declared `hideRulers`, so
  // this group's slider is suppressed like the solo one on TopicRow.
  let { tid, group, hideRuler = false }: { tid: string; group: Group; hideRuler?: boolean } =
    $props();

  const name = $derived(topics.groupName(group));

  // In the interface language, not the list's: it is the app talking about the
  // list, the same way every other note on this row is.
  const tipId = $derived(`tier-${tid}-${group.id}`);
  const note = $derived(tierNoteAt(group, selection.depthOf(tid, group)));
  const noteText = $derived(note ? resolveStr(note.text, lang.uiLang) : "");
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
    <!-- Outside the label: a click on a marker inside it would tick the group. -->
    {#if note}
      <TipMarker {tipId} icon={note.icon ?? "ℹ️"} text={noteText} />
    {/if}
    <NamesModeSelect {tid} {group} label={name.long} />
    <OmittedPanel {tid} {group} />
    <span
      class="meta"
      title={lang.ui.tree.wordsOf(selection.groupSelCount(tid, group), selection.groupTotal(tid, group))}
    >
      {selection.groupSelCount(tid, group)}/<span class="total"
        >{selection.groupTotal(tid, group)}</span
      >
    </span>
  </div>
  {#if note}
    <TipNote id={tipId} text={noteText} />
  {/if}
  {#if !hideRuler}
    <FameDepthSlider {tid} {group} />
  {/if}
</li>
