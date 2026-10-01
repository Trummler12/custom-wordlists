<script lang="ts">
  import { plain } from "../../locale/html/plain";
  import { SEPARATORS, separatorLabel, type Separator } from "../../lib/custom";
  import { SCRIPT_LANGS, type Limits } from "../../lib/lengths";
  import { LINE_SEPARATORS } from "../../lib/separator";
  import { SKRIBBL } from "../../lib/skribbl";
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

  // A row of limits of their own for each language in play that is written a
  // character per syllable: the primary one, and the secondary one while lists can
  // be switched to it. Rows not shown still apply (see custom.lengths).
  const scriptRows = $derived(
    [lang.current, ...(settings.showSecondaryToggle ? [lang.secondary] : [])].filter(
      (l, i, all) => SCRIPT_LANGS.includes(l) && all.indexOf(l) === i,
    ),
  );

  /** Let a marker that doesn't fit the menu's held width look like the menu reaching
   *  out for it, rather than resizing the menu or hanging in the air beside it: the
   *  tab around it wears the menu's background, and its border is drawn only where
   *  it sticks out (`--inside` is how much of it the menu already covers). */
  function extendPanel(node: HTMLElement) {
    const panel = node.closest<HTMLElement>(".settings-menu");
    if (!panel) return;
    const place = () => {
      const inside = panel.getBoundingClientRect().right - node.getBoundingClientRect().left;
      node.style.setProperty("--inside", `${Math.max(0, inside)}px`);
    };
    const ro = new ResizeObserver(place);
    ro.observe(panel);
    ro.observe(node);
    place();
    return { destroy: () => ro.disconnect() };
  }

  function setLimit(bound: keyof Limits, e: Event, tag?: string): void {
    const input = e.currentTarget as HTMLInputElement;
    settings.setLimit(bound, Number(input.value), tag);
    // Show what was actually kept: a rejected or clamped value would otherwise stay
    // in the field and disagree with the setting.
    const kept = tag ? settings.scriptLimitsFor(tag) : settings.charLimits;
    if (kept) input.value = String(kept[bound]);
  }
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
    aria-label={plain(lang.ui.settings.label)}
    onclick={(e) => overlays.toggleSettingsMenu(id, e.currentTarget)}
  >⚙️</button>
  {#if overlays.settingsMenu === id}
    <div class="settings-menu" role="group" aria-label={plain(lang.ui.settings.label)} use:pinBox>
      <div class="setting-row">
        <!-- A caption, not a <label>: a label hands its hover to the dropdown, which
             then lights up under a pointer that can't open it. -->
        <span id={`${id}-out-sep`}><Msg text={lang.ui.settings.outputSeparator} /></span>
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
      <!-- No name can hold a line break or a tab, so for those there is nothing to remove. -->
      {#if !LINE_SEPARATORS.includes(settings.outputSeparator)}
        <label class="setting-row check">
          <input
            type="checkbox"
            checked={settings.removeSeparator}
            onchange={(e) => settings.setRemoveSeparator(e.currentTarget.checked)}
          />
          <span><Msg text={lang.ui.settings.removeSeparator(settings.outputSeparator)} /></span>
        </label>
      {/if}
      <div class="limits">
        {#snippet bounds(l: Limits, tag?: string)}
          {#each ["min", "max"] as const as bound (bound)}
            <label class="bound">
              <span><Msg text={bound === "min" ? lang.ui.settings.minChars : lang.ui.settings.maxChars} /></span>
              <input
                type="number"
                min="1"
                value={l[bound]}
                onchange={(e) => setLimit(bound, e, tag)}
              />
            </label>
          {/each}
        {/snippet}
        <!-- Above skribbl.io's own maximum, for the general limits and a language's alike. -->
        {#snippet overGame(l: Limits, key: string)}
          {#if l.max > SKRIBBL.maxWordLen}
            <span class="over-slot">
              <span class="over-tab" use:extendPanel>
                <TipMarker tipId={`${id}-max-over-${key}`} icon="⚠️" text={lang.ui.settings.charMaxOver(SKRIBBL.maxWordLen)} />
              </span>
            </span>
            <TipNote id={`${id}-max-over-${key}`} text={lang.ui.settings.charMaxOver(SKRIBBL.maxWordLen)} />
          {/if}
        {/snippet}
        <div class="limit-row">
          <span><Msg text={lang.ui.settings.charLimits} /></span>
          {@render bounds(settings.charLimits)}
          {@render overGame(settings.charLimits, "all")}
        </div>
        {#each scriptRows as tag (tag)}
          {@const l = settings.scriptLimitsFor(tag)}
          {#if l}
            <div class="limit-row">
              <span
                ><span title={tag}>{lang.name(tag)}</span>
                <TipMarker tipId={`${id}-script-${tag}`} icon="ℹ️" text={lang.ui.settings.scriptLimitsHint} /></span
              >
              {@render bounds(l, tag)}
              {@render overGame(l, tag)}
              <TipNote id={`${id}-script-${tag}`} text={lang.ui.settings.scriptLimitsHint} />
            </div>
          {/if}
        {/each}
      </div>
      <!-- Destructive, so it sits apart from the preferences above it and is armed
           before it fires. -->
      <div class="reset-row">
        {#if armed}
          <button type="button" class="reset-btn armed" onclick={resetSelectionSettings}>
            <Msg text={lang.ui.settings.resetConfirm} />
          </button>
          <button
            type="button"
            class="reset-cancel"
            aria-label={plain(lang.ui.settings.resetCancel)}
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
  .setting-row.check {
    width: fit-content;
    cursor: pointer;
  }
  .setting-row select {
    font: inherit;
    cursor: pointer;
  }
  /* The limit rows share their columns, so the Min and Max fields line up under each
     other whatever the captions' lengths. Each row is still a box of its own (subgrid),
     which its note spans. */
  .limits {
    display: grid;
    grid-template-columns: max-content max-content max-content auto;
    align-items: center;
    column-gap: 0.5rem;
    row-gap: 0.35rem;
  }
  .limit-row {
    position: relative;
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    align-items: center;
  }
  .bound {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  .bound input {
    width: 3.2em;
    font: inherit;
  }
  /* The tab `extendPanel` places: the menu's own background and corner, with a border
     only along the part outside the menu. The background paints over the menu's own
     right border there, which is what makes the two read as one shape. */
  /* A cell of no width, so the marker never counts towards the menu's width: the menu
     sizes itself to the fields alone, whether or not the marker is there when it opens.
     The tab hangs out of it, centred on the row (an absolute child of a flex box keeps
     the box's alignment). */
  .over-slot {
    position: relative;
    display: flex;
    align-items: center;
    align-self: stretch;
    width: 0;
  }
  .over-tab {
    position: absolute;
    left: 0;
    display: inline-flex;
    padding: 0.2rem 0.2rem 0.4rem 0.0rem;
    background: var(--chip-bg);
    border-radius: 0 var(--radius) var(--radius) 0;
  }
  .over-tab::before {
    content: "";
    position: absolute;
    inset: -1px;
    border: 1px solid var(--panel-border);
    border-radius: inherit;
    clip-path: inset(0 0 0 calc(var(--inside, 100%) + 1px));
    pointer-events: none;
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
