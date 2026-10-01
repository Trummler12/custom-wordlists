<script lang="ts">
  import { SEPARATORS, separatorLabel, type Separator } from "../../lib/custom";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import { resetSelectionSettings } from "../../state/reset";
  import { settings } from "../../state/settings.svelte";
  import Msg from "../../locale/html/Msg.svelte";
  import { pinBox } from "../common/pinBox";
  import TipMarker from "../common/TipMarker.svelte";
  import TipNote from "../common/TipNote.svelte";

  // Two instances, like the 🌐 panel it sits beside: one per layout, each
  // with its own open state.
  let { id }: { id: string } = $props();

  // Reset is destructive and irreversible, so it takes two clicks: the first arms
  // the button, the second fires. It disarms itself on a short timeout and whenever
  // the menu closes, so a stray arm never lingers to catch the next open.
  let armed = $state(false);
  let disarmTimer: ReturnType<typeof setTimeout> | undefined;
  function arm(): void {
    armed = true;
    clearTimeout(disarmTimer);
    disarmTimer = setTimeout(() => (armed = false), 4000);
  }
  function disarm(): void {
    armed = false;
    clearTimeout(disarmTimer);
  }
  $effect(() => {
    if (overlays.settingsMenu !== id) disarm();
  });
</script>

<div class="settings-picker">
  <!-- `aria-haspopup="true"`, not `"dialog"`: what opens is a group of controls
       that never takes the focus and traps nothing, and claiming a dialog
       promises both. -->
  <button
    type="button"
    class="lang-btn"
    aria-haspopup="true"
    aria-expanded={overlays.settingsMenu === id}
    aria-label={lang.ui.settings.label}
    onclick={(e) => overlays.toggleSettingsMenu(id, e.currentTarget)}
  >⚙️</button>
  {#if overlays.settingsMenu === id}
    <div class="settings-menu" role="group" aria-label={lang.ui.settings.label} use:pinBox>
      <div class="setting-row">
        <!-- A caption, not a <label>: a label hands its hover to the dropdown, which
             then lights up under a pointer that can't open it. -->
        <span id={`${id}-out-sep`}>{lang.ui.settings.outputSeparator}</span>
        <select
          aria-labelledby={`${id}-out-sep`}
          value={settings.outputSeparator}
          onchange={(e) => settings.setOutputSeparator(e.currentTarget.value as Separator)}
        >
          {#each SEPARATORS as s (s)}<option value={s}>{separatorLabel(s)}</option>{/each}
        </select>
        <TipMarker tipId={`${id}-out-sep-hint`} icon="ℹ️" text={lang.ui.settings.outputSeparatorHint} />
        <TipNote id={`${id}-out-sep-hint`} text={lang.ui.settings.outputSeparatorHint} />
      </div>
      <!-- Destructive, so it sits apart from the preferences above it and is armed
           before it fires. -->
      <div class="reset-row">
        {#if armed}
          <button type="button" class="reset-btn armed" onclick={resetSelectionSettings}>
            {lang.ui.settings.resetConfirm}
          </button>
          <button
            type="button"
            class="reset-cancel"
            aria-label={lang.ui.settings.resetCancel}
            onclick={disarm}>✕</button
          >
        {:else}
          <button type="button" class="reset-btn" onclick={arm}>
            <Msg text={lang.ui.settings.reset} />
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .settings-picker {
    position: relative;
  }
  /* Same box as the 🌐 panel beside it. Preferences are unrelated, so they need air
     between them — a checkbox and a dropdown read as one control otherwise. */
  .settings-menu {
    position: absolute;
    top: calc(100% + 0.25rem);
    right: 0;
    z-index: 10;
    width: max-content;
    max-width: min(20rem, 80vw);
    padding: 0.5rem 0.6rem;
    background: var(--chip-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  /* One preference and whatever has to be said about it. Positioned, so its note spans
     this row rather than the whole popover. */
  .setting-row {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
  }
  .setting-row select {
    font: inherit;
    cursor: pointer;
  }
  /* Reset stands apart from the preferences above (a rule over it) and wears the danger
     colour instead of the neutral chrome the rest of the menu uses. */
  .reset-row {
    margin-top: 0.15rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--panel-border);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .reset-btn {
    flex: 1;
    background: none;
    border: 1px solid var(--danger);
    border-radius: var(--radius-sm);
    padding: 0.3rem 0.5rem;
    color: var(--danger);
    font: inherit;
    line-height: 1.15;
    text-align: center;
    cursor: pointer;
  }
  .reset-btn:hover,
  .reset-btn:focus-visible,
  .reset-btn.armed {
    background: var(--danger);
    color: #fff;
  }
  .reset-cancel {
    background: none;
    border: none;
    padding: 0 0.25rem;
    color: var(--muted);
    font-size: 1rem;
    line-height: 1;
    opacity: 0.7;
    cursor: pointer;
  }
  .reset-cancel:hover,
  .reset-cancel:focus-visible {
    opacity: 1;
  }
</style>
