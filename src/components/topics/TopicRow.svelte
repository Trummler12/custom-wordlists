<script lang="ts">
  import { onMount } from "svelte";
  import { setIndeterminate } from "../../lib/dom";
  import { langSupport } from "../../lib/languages";
  import { rulerControl } from "../../lib/rulers";
  import type { TopicSummary } from "../../lib/types";
  import { langWarning } from "../../locale";
  import { lang } from "../../state/lang.svelte";
  import { selection } from "../../state/selection.svelte";
  import { topics } from "../../state/topics.svelte";
  import TipNote from "../common/TipNote.svelte";
  import FameDepthSlider from "./FameDepthSlider.svelte";
  import GroupRow from "./GroupRow.svelte";
  import LanguageMarker from "./LanguageMarker.svelte";
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

  // A solo topic in a subtree that opted into ruler visibility gets a toggle to
  // show/hide its inline ruler; absent = no control, the ruler is always shown.
  const rulerOptIn = $derived(solo && rulerControl(topic, topics.categories) !== null);
  const rulerShown = $derived(selection.isRulerVisible(topic));

  const open = $derived(!!selection.expanded[topic.id]);

  // Null for a language the list carries: nothing to say. Composed once here rather
  // than in the marker, which needs the same text flattened for its aria-label.
  const langTipId = $derived(`lang-${topic.id}`);
  const langNote = $derived.by(() => {
    const name = lang.name(lang.current);
    switch (langSupport(topic, lang.current)) {
      case "declared":
        return null;
      case "english":
        return { icon: "ℹ️", text: lang.ui.langUsesEnglish(name) };
      case "undeclared":
        return { icon: "⚠️", text: langWarning(lang.ui, lang.current, name) };
    }
  });

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
      {#if langNote}
        <LanguageMarker tipId={langTipId} icon={langNote.icon} text={langNote.text} />
      {/if}
    </label>
    <!-- Both outside the <label>: a second form control inside it would leave the
         checkbox it names ambiguous, and the count isn't a name for anything. -->
    {#if sole}
      <NamesModeSelect tid={topic.id} group={sole} label={topics.topicTitle(topic)} />
    {/if}
    {#if rulerOptIn}
      <button
        type="button"
        class="ruler-toggle"
        class:shown={rulerShown}
        aria-pressed={rulerShown}
        aria-label={lang.ui.rulerToggle(rulerShown)}
        title={lang.ui.rulerToggle(rulerShown)}
        onclick={() => selection.toggleRuler(topic)}
      >📏</button>
    {/if}
    <!-- The ratio alone, since it reads the same in every language; the sentence it
         stands for is a hover away. The row needs the width for its controls. -->
    <span
      class="meta"
      title={lang.ui.wordsOf(selection.topicSelCount(topic), selection.topicTotal(topic))}
    >
      {#if topics.isLoading(topic)}{lang.ui.loadingShort}{:else}{selection.topicSelCount(
          topic,
        )}/{selection.topicTotal(topic)}{/if}
    </span>
  </div>
  <!-- The marker's note, outside the <label> above: inside it, a click on the note
       would count as ticking the topic. -->
  {#if langNote}
    <TipNote id={langTipId} text={langNote.text} />
  {/if}

  {#if sole && rulerShown}
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
