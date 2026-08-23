<script lang="ts">
  import { allRules } from "../../lib/omitted";
  import type { Group } from "../../lib/types";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import { selection } from "../../state/selection.svelte";
  import pegman from "../../../assets/GeoguessrIcon.png";

  let { tid, group }: { tid: string; group: Group } = $props();

  // The coverage rules form one strictness ladder, in array order (no-coverage then
  // rare-coverage): each level switches on a prefix of them. Not checkboxes, because
  // hiding the sparse while showing the uncovered is nonsense — a radio rules it out.
  const ladder = $derived(allRules(group).filter((r) => r.icon === "geoguessr"));
  const id = $derived(`coverage-${tid}-${group.id}`);
  const open = $derived(overlays.coveragePanel === id);

  // One radio per level, loosest first; with one rule (no sparse ones here) the
  // ladder has two levels and the third label simply isn't shown.
  const levels = $derived([...Array(ladder.length + 1).keys()]);
  const labels = $derived([
    lang.ui.coverage.all,
    lang.ui.coverage.withCoverage,
    lang.ui.coverage.reliable,
  ]);

  // The current level is how many leading rules are in force. A radio only ever sets
  // a prefix, so a partial state — from the old checkboxes, or a merged split across
  // continents — rounds to the longest prefix that is fully on.
  const level = $derived.by(() => {
    let n = 0;
    for (const r of ladder) {
      if (selection.omitting(tid, group, r.id)) n++;
      else break;
    }
    return n;
  });

  function setLevel(n: number): void {
    ladder.forEach((r, i) => {
      const want = i < n;
      if (selection.omitting(tid, group, r.id) !== want) selection.toggleOmission(tid, group, r.id);
    });
  }
</script>

{#if ladder.length > 0}
  <div class="coverage-host">
    <button
      type="button"
      class="coverage-btn"
      class:on={level > 0}
      aria-haspopup="true"
      aria-expanded={open}
      aria-label={lang.ui.coverage.label}
      title={lang.ui.coverage.label}
      onclick={(e) => overlays.toggleCoveragePanel(id, e.currentTarget)}
    >
      <img src={pegman} alt="" />
    </button>
    {#if open}
      <div
        class="coverage-panel"
        class:above={overlays.coverageAbove}
        role="radiogroup"
        aria-label={lang.ui.coverage.label}
      >
        <p class="coverage-title">{lang.ui.coverage.label}</p>
        <ul>
          {#each levels as n (n)}
            <li>
              <label>
                <input type="radio" name={id} checked={level === n} onchange={() => setLevel(n)} />
                <span>{labels[n]}</span>
              </label>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* The button sits in the row directly, like the 🚫 host it mirrors. */
  .coverage-host {
    display: contents;
  }
  .coverage-btn {
    display: inline-flex;
    align-items: center;
    background: none;
    border: none;
    padding: 0 0.2rem;
    line-height: 1;
    cursor: pointer;
    opacity: 0.45;
  }
  /* On when the filter is doing something, so the row doesn't change width — the
     same opacity-as-state the 📏 and 🇬🇧 toggles use. */
  .coverage-btn.on,
  .coverage-btn:hover,
  .coverage-btn:focus-visible {
    opacity: 1;
  }
  .coverage-btn img {
    width: 1rem;
    height: 1rem;
    display: block;
  }
  /* Stretched across the row rather than hung off the button, as .omitted-panel is,
     and for the same reason: the trigger sits at an unknown offset. */
  .coverage-panel {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 10;
    max-height: clamp(9rem, calc(40vh - var(--footer-h)), 24rem);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0.5rem 0.6rem;
    background: var(--chip-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
    font-size: 0.8rem;
    font-weight: 400;
    line-height: 1.35;
    text-align: left;
    cursor: auto;
  }
  .coverage-panel.above {
    top: auto;
    bottom: 100%;
  }
  .coverage-title {
    margin: 0 0 0.35rem;
  }
  .coverage-panel ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .coverage-panel label {
    display: flex;
    align-items: baseline;
    gap: 0.45rem;
    cursor: pointer;
  }
</style>
