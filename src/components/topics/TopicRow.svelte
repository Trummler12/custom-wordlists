<script lang="ts">
  import { onMount } from "svelte";
  import { setIndeterminate } from "../../lib/dom";
  import { canForceEnglish } from "../../lib/english";
  import { baseTag, langSupport, splitName } from "../../lib/languages";
  import { rulerControl } from "../../lib/rulers";
  import type { TopicSummary } from "../../lib/types";
  import { langWarning } from "../../locale";
  import { lang } from "../../state/lang.svelte";
  import { selection } from "../../state/selection.svelte";
  import { settings } from "../../state/settings.svelte";
  import { topics } from "../../state/topics.svelte";
  import TipMarker from "../common/TipMarker.svelte";
  import TipNote from "../common/TipNote.svelte";
  import FameDepthSlider from "./FameDepthSlider.svelte";
  import GroupRow from "./GroupRow.svelte";
  import NamesModeSelect from "./NamesModeSelect.svelte";
  import OmittedPanel from "./OmittedPanel.svelte";
  import VariantPanel from "./VariantPanel.svelte";

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

  // Behind a preference, and only where the switch would change something: not in
  // English, and not for a list whose names in this language are the English ones
  // anyway. Nearly every row qualifies, which is why it is off by default.
  const englishOptIn = $derived(settings.showEnglishToggle && canForceEnglish(topic, lang.current));
  const forcedEnglish = $derived(lang.isForcedEnglish(topic));

  const open = $derived(!!selection.expanded[topic.id]);
  const name = $derived(topics.topicName(topic));

  // Null for a language the list carries: nothing to say. Composed once here rather
  // than in the marker, which needs the same text flattened for its aria-label.
  const langTipId = $derived(`lang-${topic.id}`);
  const langNote = $derived.by(() => {
    // The language this list is actually rendered in, which a forced-English topic
    // has of its own — warning about German names it is no longer showing would be
    // a warning about nothing. The note itself stays in the interface language.
    // The language, not the way it is written: a list carrying Japanese supports
    // Japanese whether or not it also carries romaji.
    const code = baseTag(lang.contentLang(topic.id));
    const name = lang.nameInUi(code);
    switch (langSupport(topic, code)) {
      case "declared":
        return null;
      case "english":
        return { icon: "ℹ️", text: lang.ui.language.usesEnglish(...splitName(name)) };
      case "undeclared":
        return { icon: "⚠️", text: langWarning(lang.ui, code, name) };
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
        aria-label={lang.ui.tree.toggle(open, name.long)}
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
      <span class="title" title={name.short !== name.long ? name.long : undefined}>
        {name.short}
      </span>
      {#if langNote}
        <TipMarker tipId={langTipId} icon={langNote.icon} text={langNote.text} />
      {/if}
    </label>
    <!-- Both outside the <label>: a second form control inside it would leave the
         checkbox it names ambiguous, and the count isn't a name for anything. -->
    {#if sole}
      <NamesModeSelect tid={topic.id} group={sole} label={name.long} />
    {/if}
    {#if sole}
      <OmittedPanel tid={topic.id} group={sole} />
    {/if}
    <!-- Per topic, not per group: how a language spells a name is the same question
         in every group of a list. Shows itself only where the answers differ. -->
    <VariantPanel tid={topic.id} />
    {#if englishOptIn}
      <button
        type="button"
        class="english-toggle"
        class:on={forcedEnglish}
        aria-pressed={forcedEnglish}
        aria-label={lang.ui.language.useEnglish(forcedEnglish)}
        title={lang.ui.language.useEnglish(forcedEnglish)}
        onclick={() => lang.toggleEnglish(topic)}>🇬🇧</button
      >
    {/if}
    {#if rulerOptIn}
      <button
        type="button"
        class="ruler-toggle"
        class:shown={rulerShown}
        aria-pressed={rulerShown}
        aria-label={lang.ui.fame.toggle(rulerShown)}
        title={lang.ui.fame.toggle(rulerShown)}
        onclick={() => selection.toggleRuler(topic)}
      >📏</button>
    {/if}
    <!-- The ratio alone, since it reads the same in every language; the sentence it
         stands for is a hover away. The row needs the width for its controls. -->
    <span
      class="meta"
      title={lang.ui.tree.wordsOf(selection.topicSelCount(topic), selection.topicTotal(topic))}
    >
      {#if topics.isLoading(topic)}{lang.ui.tree.loadingShort}{:else}{selection.topicSelCount(
          topic,
        )}/<span class="total">{selection.topicTotal(topic)}</span>{/if}
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
