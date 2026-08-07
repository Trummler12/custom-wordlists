<script lang="ts">
  import { setIndeterminate } from "../../lib/dom";
  import type { TopicSummary } from "../../lib/types";
  import { langWarning } from "../../locale";
  import { lang } from "../../state/lang.svelte";
  import { selection } from "../../state/selection.svelte";
  import { topics } from "../../state/topics.svelte";
  import TipNote from "../common/TipNote.svelte";
  import GroupRow from "./GroupRow.svelte";
  import LanguageWarning from "./LanguageWarning.svelte";

  let { topic }: { topic: TopicSummary } = $props();

  const open = $derived(!!selection.expanded[topic.id]);
  const warnId = $derived(`warn-${topic.id}`);
</script>

<div class="topic-item">
  <div class="topic-row">
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
      <span class="meta">
        {#if topics.isLoading(topic)}{lang.ui.loadingShort}{:else}{lang.ui.wordsOf(
            selection.topicSelCount(topic),
            selection.topicTotal(topic),
          )}{/if}
      </span>
    </label>
  </div>
  <!-- The warning's note, outside the <label> above: inside it, a click on the
       note would count as ticking the topic. -->
  <TipNote id={warnId} text={langWarning(lang.ui, lang.current, lang.name(lang.current))} />

  {#if open && topics.data[topic.id]}
    <ul class="groups" id={`groups-${topic.id}`}>
      {#each topics.groupsOf(topic) as g (g.id)}
        <GroupRow tid={topic.id} group={g} />
      {/each}
    </ul>
  {/if}
</div>
