<script lang="ts">
  import { onMount } from "svelte";
  import { setIndeterminate } from "../../lib/dom";
  import type { TopicSummary } from "../../lib/types";
  import { langWarning } from "../../locale";
  import { lang } from "../../state/lang.svelte";
  import { selection } from "../../state/selection.svelte";
  import { topics } from "../../state/topics.svelte";
  import TipNote from "../common/TipNote.svelte";
  import FameDepthSlider from "./FameDepthSlider.svelte";
  import GroupRow from "./GroupRow.svelte";
  import LanguageWarning from "./LanguageWarning.svelte";
  import NamesModeSelect from "./NamesModeSelect.svelte";

  let { topic }: { topic: TopicSummary } = $props();

  // A topic whose single group is the whole topic has nothing to expand into: the
  // level would repeat the topic's own name and hold one ruler. That group is
  // rendered on this row instead.
  //
  // Unless the topic owns a folder — that layout is how it says more subtopics are
  // planned there, and an expander that comes and goes as the first of them lands
  // would be worse than one that is briefly thin. Both facts come from the
  // manifest, so the row knows its shape before the topic file arrives.
  const solo = $derived(topic.groupCount === 1 && !topic.foldered);
  const sole = $derived(solo ? topics.groupsOf(topic)[0] : undefined);

  const open = $derived(!!selection.expanded[topic.id]);
  const warnId = $derived(`warn-${topic.id}`);

  // Nothing else will trigger the load: there is no expander to click, and the
  // ruler can't be drawn without the tiers it snaps to.
  onMount(() => {
    if (solo) topics.ensure(topic);
  });
</script>

<div class="topic-item">
  <div class="topic-row">
    {#if solo}
      <!-- Keeps the checkbox column straight: it is the anchor the eye follows
           down the tree, and it shouldn't shift by whether a topic has subgroups. -->
      <span class="expander placeholder" aria-hidden="true">▸</span>
    {:else}
      <button
        type="button"
        class="expander"
        aria-expanded={open}
        aria-controls={`groups-${topic.id}`}
        aria-label={lang.ui.toggle(open, topics.topicTitle(topic))}
        onclick={() => selection.toggleExpand(topic)}
      >
        {open ? "▾" : "▸"}
      </button>
    {/if}
    <label class="topic">
      <input
        type="checkbox"
        checked={selection.topicFull(topic)}
        use:setIndeterminate={selection.topicPartial(topic)}
        onchange={() => selection.toggleTopic(topic)}
      />
      <span class="icon" aria-hidden="true">{topic.icon ?? "•"}</span>
      <span class="title">{topics.topicTitle(topic)}</span>
      {#if !topic.languages?.includes(lang.current)}
        <LanguageWarning tipId={warnId} />
      {/if}
    </label>
    <!-- Both outside the <label>: a second form control inside it would leave the
         checkbox it names ambiguous, and the count isn't a name for anything. -->
    {#if sole}
      <NamesModeSelect tid={topic.id} group={sole} label={topics.topicTitle(topic)} />
    {/if}
    <span class="meta">
      {#if topics.isLoading(topic)}{lang.ui.loadingShort}{:else}{lang.ui.wordsOf(
          selection.topicSelCount(topic),
          selection.topicTotal(topic),
        )}{/if}
    </span>
  </div>
  <!-- The warning's note, outside the <label> above: inside it, a click on the
       note would count as ticking the topic. -->
  <TipNote id={warnId} text={langWarning(lang.ui, lang.current, lang.name(lang.current))} />

  {#if sole}
    <FameDepthSlider tid={topic.id} group={sole} />
  {/if}

  {#if open && topics.data[topic.id]}
    <ul class="groups" id={`groups-${topic.id}`}>
      {#each topics.groupsOf(topic) as g (g.id)}
        <GroupRow tid={topic.id} group={g} />
      {/each}
    </ul>
  {/if}
</div>
