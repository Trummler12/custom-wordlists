<script lang="ts">
  import Msg from "../../locale/html/Msg.svelte";
  import { plain } from "../../locale/html/plain";
  import { lang } from "../../state/lang.svelte";
  import { output } from "../../state/output.svelte";
  import LanguagePicker from "../layout/LanguagePicker.svelte";
  import SettingsMenu from "../layout/SettingsMenu.svelte";
  import OutputCounter from "./OutputCounter.svelte";
  import WordChips from "./WordChips.svelte";

  let chips = $state<ReturnType<typeof WordChips>>();

  // A clipboard that refuses leaves the reader with the list still on screen, so
  // the fallback is to hand them the selection and let them press the shortcut
  // themselves. Nothing else about the button changes: it is the same action,
  // finished by hand.
  async function copy(): Promise<void> {
    if (!(await output.copy())) chips?.select();
  }

</script>

<section class="output" aria-label={plain(lang.ui.output.label)}>
  <div class="output-head">
    <h2><Msg text={lang.ui.output.label} /></h2>
    <div class="head-actions">
      <SettingsMenu id="output" />
      <LanguagePicker id="output" />
      <!-- "Copy" and "Copied!" share one grid cell, only the current one visible, so the
           button is as wide as the longer of the two from the start. -->
      <button type="button" class="copy-btn" onclick={copy} disabled={output.merged.length === 0}>
        <span class="copy-label" class:shown={output.copyState === "idle"}><Msg text={lang.ui.output.copy} /></span>
        <span class="copy-label" class:shown={output.copyState === "copied"}><Msg text={lang.ui.output.copied} /></span>
        {#if output.copyState === "failed"}<span class="copy-label shown"><Msg text={lang.ui.output.copyFailed} /></span>{/if}
      </button>
    </div>
  </div>

  {#if output.merged.length === 0}
    <p class="status"><Msg text={lang.ui.output.empty} /></p>
  {:else}
    <!-- `assertive`, unlike everything else here: it interrupts because the
         reader has just pressed a button and is owed an answer about it. -->
    {#if output.copyState === "failed"}
      <p class="status" role="alert"><Msg text={lang.ui.output.copyManual} /></p>
    {/if}
    <WordChips bind:this={chips} />
    <OutputCounter />
  {/if}
</section>

<style>
  /* Sticky and always full viewport height (minus --output-gap top + bottom and the pinned
     footer), independent of the word count. As App.svelte's second grid column, the tall left
     column keeps it pinned through the whole page scroll. Flex column — the chips grow and
     scroll inside, the counter stays at the bottom. */
  .output {
    position: sticky;
    top: var(--output-gap);
    align-self: start;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 2 * var(--output-gap) - var(--footer-h));
    min-height: 0;
  }
  @media (max-width: 50rem) {
    /* Stacked: don't pin the output; size it to its content. */
    .output {
      position: static;
      height: auto;
    }
  }
  .output-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .head-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .head-actions > button {
    padding: 0.35rem 0.9rem;
    cursor: pointer;
  }
  .copy-btn {
    display: inline-grid;
    justify-items: center;
  }
  /* Hidden, not removed: a hidden label still takes its width, and isn't read out. */
  .copy-label {
    grid-area: 1 / 1;
    visibility: hidden;
  }
  .copy-label.shown {
    visibility: visible;
  }
</style>
