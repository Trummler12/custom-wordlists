<script lang="ts">
  import { lang } from "../../state/lang.svelte";
  import { output } from "../../state/output.svelte";
  import LanguagePicker from "../layout/LanguagePicker.svelte";
  import SettingsMenu from "../layout/SettingsMenu.svelte";
  import OutputCounter from "./OutputCounter.svelte";
  import WordChips from "./WordChips.svelte";
</script>

<section class="output" aria-label={lang.ui.output.label}>
  <div class="output-head">
    <h2>{lang.ui.output.label}</h2>
    <div class="head-actions">
      <SettingsMenu id="output" />
      <LanguagePicker id="output" />
      <button type="button" onclick={output.copy} disabled={output.included.length === 0}>
        {output.copied ? lang.ui.output.copied : lang.ui.output.copy}
      </button>
    </div>
  </div>

  {#if output.merged.length === 0}
    <p class="status">{lang.ui.output.empty}</p>
  {:else}
    <WordChips />
    <OutputCounter />
  {/if}
</section>
