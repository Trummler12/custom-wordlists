<script lang="ts">
  import { tagChip } from "../../lib/languages";
  import Msg from "../../locale/html/Msg.svelte";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";

  // One language choice in the 🌐 panel: a field showing the current pick, opening
  // the list the 🌐 button used to open. Not a native <select>: an <option> can
  // hold neither the two columns (code, endonym) nor markup.
  let {
    id,
    value,
    onpick,
    labelledby,
    lead,
  }: {
    id: string;
    value: string;
    onpick: (l: string) => void;
    /** The id of the caption naming this choice. */
    labelledby: string;
    /** An option above the languages, e.g. "follow Primary", and the language it
     *  currently amounts to (shown in the field while it is the pick). */
    lead?: { value: string; label: string; resolves: string };
  } = $props();

  const open = $derived(overlays.langSelect === id);
  const leading = $derived(lead !== undefined && value === lead.value);

  function pick(l: string): void {
    overlays.closeLangSelect();
    onpick(l);
  }
</script>

<div class="lang-select">
  <button
    type="button"
    class="lang-field"
    aria-haspopup="true"
    aria-expanded={open}
    aria-labelledby={labelledby}
    onclick={(e) => overlays.toggleLangSelect(id, e.currentTarget)}
  >
    {#if lead && leading}
      <span class="lang-name"><Msg text={lead.label} /></span>
      <span class="lang-code">{tagChip(lead.resolves, lang.available)}</span>
    {:else}
      <span class="lang-code">{tagChip(value, lang.available)}</span>
      <span class="lang-name">{lang.name(value)}</span>
    {/if}
    <span class="caret" aria-hidden="true">▾</span>
  </button>
  {#if open}
    <!-- A list of buttons in a popover, and nothing more. `role="menu"` promises
         the WAI-ARIA menu pattern — arrow keys between items, Home/End, focus
         moving in as it opens — and none of that is implemented here: the
         buttons are reached with Tab, like the buttons they are. Announcing a
         menu and then behaving otherwise is worse for a screen-reader user than
         announcing nothing, so the roles are gone rather than half-kept. -->
    <ul class="lang-menu" aria-labelledby={labelledby}>
      {#if lead}
        <li>
          <button
            type="button"
            aria-current={leading ? "true" : undefined}
            class:selected={leading}
            onclick={() => pick(lead.value)}
          >
            <span class="lang-code"></span>
            <span class="lang-name"><Msg text={lead.label} /></span>
          </button>
        </li>
      {/if}
      {#each lang.available as l (l)}
        <li>
          <button
            type="button"
            aria-current={!leading && l === value ? "true" : undefined}
            class:selected={!leading && l === value}
            onclick={() => pick(l)}
            title={l}
          >
            <span class="lang-code">{tagChip(l, lang.available)}</span>
            <span class="lang-name">{lang.name(l)}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .lang-select {
    position: relative;
    display: inline-block;
  }
  /* Looks like the native dropdowns elsewhere: a bordered field with a caret. */
  .lang-field {
    display: inline-flex;
    align-items: baseline;
    gap: 0.4rem;
    padding: 0.15rem 0.4rem;
    background: var(--panel-bg, transparent);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius-sm);
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  .caret {
    color: var(--muted-2);
    font-size: 0.75em;
  }
  /* The list the 🌐 button used to open, unchanged but for hanging flush under its field. */
  .lang-menu {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 11;
    margin: 0;
    padding: 0.25rem;
    min-width: 9rem;
    list-style: none;
    background: var(--chip-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
    font-size: 1rem;
  }
  .lang-menu button {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    width: 100%;
    padding: 0.3rem 0.5rem;
    background: none;
    border: none;
    border-radius: var(--radius-sm);
    color: inherit;
    text-align: left;
    cursor: pointer;
  }
  .lang-menu button:hover {
    background: rgba(128, 128, 128, 0.18);
  }
  .lang-menu button.selected {
    font-weight: 600;
  }
  .lang-code {
    min-width: 1.7rem;
    color: var(--muted-2);
    font-size: 0.8rem;
  }
  .lang-field .lang-code {
    min-width: 0;
  }
  .lang-name {
    flex: 1;
    white-space: nowrap;
  }
</style>
