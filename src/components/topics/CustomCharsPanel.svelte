<script lang="ts">
  import { oddChars, type OddChar } from "../../lib/custom";
  import { custom } from "../../state/custom.svelte";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import TipMarker from "../common/TipMarker.svelte";
  import TipNote from "../common/TipNote.svelte";

  // The Custom row's character panel (§F2): every character beyond letters, digits and
  // spaces in the sources that reach the output. The marker is ⚠️ only while one of them
  // is worth removing; ordinary name punctuation alone gets a quiet ℹ️, so the warning
  // keeps its meaning on the many real lists that carry a hyphen or an apostrophe.
  //
  // Shares the `omitted` slot and `.omitted-*` classes with the 🚫 beside it, so the two
  // open, flip and dismiss alike and only one is open at a time. The per-character ℹ️
  // notes are `local` tips and siblings of the panel (as in LanguageTypePanel), so the
  // panel's own scroll can't clip them.
  const id = "custom-chars";
  const open = $derived(overlays.omittedPanel === id);

  const sources = $derived(custom.effectiveNamed);
  const chars = $derived(oddChars(sources.map((s) => s.items)));
  const ignored = $derived(chars.filter((c) => !c.tolerated));
  const tolerated = $derived(chars.filter((c) => c.tolerated));

  const tipId = (c: OddChar): string => `custom-char-${c.char.codePointAt(0)!.toString(16)}`;
  /** The ℹ️ note: the removal advice (not for a tolerated character), then each source that
   *  holds the character, with how often. */
  function note(c: OddChar): string {
    const lists = sources
      .map((s, i) => ({ name: s.list?.name ?? lang.ui.custom.inputName, n: c.perSource[i] }))
      .filter((x) => x.n > 0)
      .map((x) => `- ${x.name} (${x.n})`);
    const advice = c.tolerated ? [] : [lang.ui.custom.charsRemove];
    return [...advice, lang.ui.custom.charsLists, ...lists].join("{br}");
  }
</script>

{#snippet row(c: OddChar)}
  <li>
    <code>{c.label}</code>
    <span class="count">x{c.count}</span>
    <TipMarker tipId={tipId(c)} icon="ℹ️" text={note(c)} local />
  </li>
{/snippet}

{#if chars.length}
  <div class="omitted-host">
    <button
      type="button"
      class="omitted-btn"
      class:warn={ignored.length > 0}
      aria-haspopup="true"
      aria-expanded={open}
      aria-label={lang.ui.custom.charsLabel}
      title={lang.ui.custom.charsLabel}
      onclick={(e) => overlays.toggleOmittedPanel(id, e.currentTarget)}>{ignored.length ? "⚠️" : "ℹ️"}</button
    >
    {#if open}
      <div
        class="omitted-panel"
        class:above={overlays.omittedAbove}
        role="group"
        aria-label={lang.ui.custom.charsLabel}
      >
        {#if ignored.length}
          <p class="omitted-title">{lang.ui.custom.charsIgnored}</p>
          <ul class="chars">
            {#each ignored as c (c.char)}{@render row(c)}{/each}
          </ul>
        {/if}
        {#if ignored.length && tolerated.length}<hr />{/if}
        {#if tolerated.length}
          <p class="omitted-title">{lang.ui.custom.charsTolerated}</p>
          <ul class="chars">
            {#each tolerated as c (c.char)}{@render row(c)}{/each}
          </ul>
        {/if}
      </div>
    {/if}
    {#each chars as c (c.char)}
      <TipNote id={tipId(c)} text={note(c)} local />
    {/each}
  </div>
{/if}

<style>
  /* A warning reads at full strength; the shared button is dimmed for the quiet ℹ️. */
  .omitted-btn.warn {
    opacity: 1;
  }
  .chars li {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    padding: 0.1rem 0;
  }
  /* The character itself, boxed so a lone "." or "'" is still findable. */
  .chars code {
    min-width: 1.4em;
    padding: 0 0.25rem;
    text-align: center;
    font-size: 0.85rem;
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
  }
  .count {
    color: var(--muted-2);
    font-variant-numeric: tabular-nums;
  }
  hr {
    border: none;
    border-top: 1px solid var(--panel-border);
    margin: 0.45rem 0;
  }
</style>
