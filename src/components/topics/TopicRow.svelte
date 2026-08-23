<script lang="ts">
  import { onMount } from "svelte";
  import { setIndeterminate } from "../../lib/dom";
  import { canForceEnglish } from "../../lib/english";
  import { tierNoteAt } from "../../lib/fame";
  import { baseTag, langSupport, splitName } from "../../lib/languages";
  import { rulerControl, rulerHidden } from "../../lib/rulers";
  import type { TopicSummary } from "../../lib/types";
  import { resolveStr } from "../../lib/words";
  import { langWarning } from "../../locale";
  import { lang } from "../../state/lang.svelte";
  import { selection } from "../../state/selection.svelte";
  import { settings } from "../../state/settings.svelte";
  import { topics } from "../../state/topics.svelte";
  import TipMarker from "../common/TipMarker.svelte";
  import TipNote from "../common/TipNote.svelte";
  import CoveragePanel from "./CoveragePanel.svelte";
  import FameDepthSlider from "./FameDepthSlider.svelte";
  import NamesModeSelect from "./NamesModeSelect.svelte";
  import OmittedPanel from "./OmittedPanel.svelte";
  import VariantPanel from "./VariantPanel.svelte";

  let { topic }: { topic: TopicSummary } = $props();

  // A topic is its own single group — rendered on this row, ruler and all. Undefined
  // until the file loads, which the guards below wait on.
  const sole = $derived(topics.groupsOf(topic)[0]);

  // No ruler at all where a node on the path says so — no toggle, no slider.
  // Stronger than the opt-in below, so it gates it.
  const rulerGone = $derived(rulerHidden(topic, topics.categories));
  // A topic in a subtree that opted into ruler visibility gets a toggle to
  // show/hide its inline ruler; absent = no control, the ruler is always shown.
  const rulerOptIn = $derived(!rulerGone && rulerControl(topic, topics.categories) !== null);
  const rulerShown = $derived(selection.isRulerVisible(topic));

  // Behind a preference, and only where the switch would change something: not in
  // English, and not for a list whose names in this language are the English ones
  // anyway. Nearly every row qualifies, which is why it is off by default.
  const englishOptIn = $derived(settings.showEnglishToggle && canForceEnglish(topic, lang.current));
  const forcedEnglish = $derived(lang.isForcedEnglish(topic));

  const name = $derived(topics.topicName(topic));
  // The long form on hover, and its hitbox spans the icon too — so a topic with an
  // empty row label (the Antarctica cricket, icon only) still reveals it.
  const titleTip = $derived(name.short !== name.long ? name.long : undefined);

  // The ruler a tier note talks about is the one on this row.
  const tierTipId = $derived(`tier-${topic.id}`);
  const tierNote = $derived(sole ? tierNoteAt(sole, selection.depthOf(topic.id, sole)) : undefined);
  const tierText = $derived(tierNote ? resolveStr(tierNote.text, lang.uiLang) : "");

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
    // A transliterated reading is right as a reading and may still not be how the
    // name is written in practice, which only the reader can tell us. The store
    // owns that question — asking it here as "the tag isn't the language" would
    // also catch `es-419`, which is a spelling of Spanish and not a reading.
    if (lang.derivesRomaji(topic.id)) {
      return { icon: "ℹ️", text: lang.ui.language.generatedRomaji };
    }
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
  onMount(() => topics.ensure(topic));
</script>

<div class="topic-item">
  <div class="topic-row">
    <!-- Keeps the checkbox column straight: the placeholder holds the width a
         category's expander occupies, so topic checkboxes line up under it. -->
    <span class="expander placeholder" aria-hidden="true">▸</span>
    <label class="topic">
      <input
        type="checkbox"
        checked={selection.topicFull(topic)}
        use:setIndeterminate={selection.topicPartial(topic)}
        onchange={() => selection.toggleTopic(topic)}
      />
      <span class="icon" aria-hidden="true" title={titleTip}>{topic.icon ?? "•"}</span>
      <span class="title" title={titleTip}>
        {name.short}
      </span>
      {#if langNote}
        <TipMarker tipId={langTipId} icon={langNote.icon} text={langNote.text} />
      {/if}
    </label>
    {#if tierNote}
      <TipMarker tipId={tierTipId} icon={tierNote.icon ?? "ℹ️"} text={tierText} />
    {/if}
    <!-- Both outside the <label>: a second form control inside it would leave the
         checkbox it names ambiguous, and the count isn't a name for anything. -->
    {#if sole}
      <NamesModeSelect tid={topic.id} group={sole} label={name.long} />
    {/if}
    {#if sole}
      <OmittedPanel tid={topic.id} group={sole} />
    {/if}
    {#if sole}
      <CoveragePanel tid={topic.id} group={sole} />
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
  {#if tierNote}
    <TipNote id={tierTipId} text={tierText} />
  {/if}

  {#if sole && rulerShown && !rulerGone}
    <FameDepthSlider tid={topic.id} group={sole} />
  {/if}
</div>
