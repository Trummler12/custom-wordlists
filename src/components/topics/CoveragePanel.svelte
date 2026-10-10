<script lang="ts">
  import { placement, rowPopup } from "../shared/placement";
  import Msg from "../../locale/html/Msg.svelte";
  import { plain } from "../../locale/html/plain";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import { settings } from "../../state/settings.svelte";
  import pegman from "../../../assets/GeoguessrIcon.png";

  // The Geoguessr / Street View coverage filter: one radio ladder driving a set of
  // leaf topics at once. Each `target` is a topic id and the ladder rules it holds
  // — some continents have only `no-coverage`, some also `rare-coverage`, so a leaf
  // votes on and is commanded for only the rules it actually carries. Targets are
  // `[self]` for a plain row, the contributors for a synthesized one, and every
  // icon-carrying descendant for a category row. All from the manifest — no load.
  let { id, targets }: { id: string; targets: { tid: string; rules: string[] }[] } = $props();

  const open = $derived(overlays.coveragePanel === id);

  // The full ladder is the union of the targets' rules, in first-seen order — every
  // list names `no-coverage` before `rare-coverage`, so the order is stable.
  const ladder = $derived.by(() => {
    const seen: string[] = [];
    for (const t of targets) for (const r of t.rules) if (!seen.includes(r)) seen.push(r);
    return seen;
  });

  // A coverage rule is omittable and unlocked, so "in force" is just its stored
  // flip; a flat topic's group id equals its topic id, so the key is (tid, tid, rule).
  const on = (tid: string, ruleId: string) => settings.isToggled(tid, tid, ruleId);
  // Majority among the targets that actually carry the rule — a leaf without it
  // (no sparse countries) neither votes nor is counted for that step.
  const majorityOn = (ruleId: string) => {
    const holders = targets.filter((t) => t.rules.includes(ruleId));
    return holders.length > 0 && holders.filter((t) => on(t.tid, ruleId)).length * 2 >= holders.length;
  };

  // The level is how many leading ladder rules a majority holds — a radio only ever
  // sets a prefix, so a split rounds to the longest prefix that is majority-on.
  const level = $derived.by(() => {
    let n = 0;
    for (const r of ladder) {
      if (majorityOn(r)) n++;
      else break;
    }
    return n;
  });

  // One radio per level, loosest first; a two-rule ladder gives three levels, a
  // one-rule ladder two — the third label then simply isn't shown.
  const levels = $derived([...Array(ladder.length + 1).keys()]);
  const labels = $derived([
    lang.ui.coverage.all,
    lang.ui.coverage.withCoverage,
    lang.ui.coverage.reliable,
  ]);

  function setLevel(n: number): void {
    for (const t of targets) {
      for (const r of t.rules) {
        const want = ladder.indexOf(r) < n;
        if (on(t.tid, r) !== want) settings.toggleOmission(t.tid, t.tid, r);
      }
    }
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
      aria-label={plain(lang.ui.coverage.label)}
      title={plain(lang.ui.coverage.label)}
      onclick={(e) => overlays.toggleCoveragePanel(id, e.currentTarget)}
    >
      <img src={pegman} alt="" />
    </button>
    {#if open}
      <div
        class="popup coverage-panel"
        use:placement={rowPopup(overlays.opener("coverage"))}
        role="radiogroup"
        aria-label={plain(lang.ui.coverage.label)}
      >
        <p class="coverage-title"><Msg text={lang.ui.coverage.label} /></p>
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
  /* ~0.8rem so the Pegman sits about the size of the toggle emojis beside it. */
  .coverage-btn img {
    width: 0.8rem;
    height: 0.8rem;
    display: block;
  }
  .coverage-panel {
    font-size: 0.8rem;
    font-weight: 400;
    line-height: 1.35;
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
    display: inline-flex;
    align-items: baseline;
    gap: 0.45rem;
    cursor: pointer;
  }
</style>
