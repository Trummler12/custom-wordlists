<script lang="ts">
  import { placement, rowPopup } from "../shared/placement";
  import Msg from "../../locale/html/Msg.svelte";
  import { plain } from "../../locale/html/plain";
  import { type Cell, cellKey, includedAfterClick } from "../../lib/matrix";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import { settings } from "../../state/settings.svelte";

  // The sovereignty & recognition matrix: one grid driving a set of leaf topics at
  // once. Each `target` is a topic id and the sovereignty rules it holds, each rule
  // carrying its `[row, col]` cell. Targets are `[self]` for a plain row, the
  // contributors for a synthesized one, and every rule-carrying descendant for a
  // category row — all from the manifest, no file load. The top-left cell (row 1,
  // col 1) is `Reguläre Staaten`: always in the list, never a rule.
  type Rule = { id: string; cell: Cell; names: string[]; omit: boolean };
  let { id, targets }: { id: string; targets: { tid: string; rules: Rule[] }[] } = $props();

  const ROWS = 4;
  const COLS = 2;
  const REGULAR: Cell = [1, 1];

  const open = $derived(overlays.sovereigntyPanel === id);

  // Whether a rule's cell is shown for a target; a flat topic's group id equals its
  // topic id, so the key is (tid, tid, ruleId). The toggle reads opposite ways by
  // default: a shown-by-default (`omittable`) rule is shown while untoggled and
  // hidden once toggled, a hide-by-default (`omit`) rule the reverse — so mixing
  // the two on one grid demands the rule's own default, not `!isToggled` for all.
  const shown = (tid: string, r: Rule): boolean => {
    const toggled = settings.isToggled(tid, tid, r.id);
    return r.omit ? toggled : !toggled;
  };

  // Every (target, rule) pair sitting on a given cell — a leaf votes on and is
  // commanded for only the cells it actually carries.
  const holdersAt = (c: Cell) =>
    targets.flatMap((t) => t.rules.filter((r) => cellKey(r.cell) === cellKey(c)).map((r) => ({ tid: t.tid, r })));

  // Regular states are always in; any other cell follows the majority of its
  // holders, and a cell no target carries (empty here) is neither in nor out.
  const cellState = (c: Cell): "regular" | "in" | "out" | "empty" => {
    if (cellKey(c) === cellKey(REGULAR)) return "regular";
    const holders = holdersAt(c);
    if (holders.length === 0) return "empty";
    const inCount = holders.filter((h) => shown(h.tid, h.r)).length;
    return inCount * 2 >= holders.length ? "in" : "out";
  };

  // Click a cell: turning it on fills the staircase up-and-left, turning it off
  // clears everything down-and-right — every rule across every target updated so the
  // included region stays one connected block. `toggleOmission` flips the raw
  // toggle, which flips `shown` whichever way the rule defaults, so the staircase
  // maths stays in terms of shown-state and needs no default of its own.
  function toggleCell(c: Cell): void {
    const state = cellState(c);
    if (state === "regular" || state === "empty") return;
    const clickedIncluded = state === "in";
    for (const t of targets) {
      for (const r of t.rules) {
        const want = includedAfterClick(r.cell, c, clickedIncluded, shown(t.tid, r));
        if (shown(t.tid, r) !== want) settings.toggleOmission(t.tid, t.tid, r.id);
      }
    }
  }

  const s = $derived(lang.ui.sovereignty);
  const rows = $derived(s.rows);
  const cols = $derived(s.cols);

  // The names a cell holds, union across the targets carrying a rule there.
  const namesAt = (c: Cell): string[] => {
    const set = new Set<string>();
    for (const t of targets) for (const r of t.rules) if (cellKey(r.cell) === cellKey(c)) for (const n of r.names) set.add(n);
    return [...set];
  };

  // The grid, row 1 on top. The visible hover of a cell is the list of territories
  // it holds — nothing else; the row×column meaning is the aria-label instead, for
  // a reader who can't see the axes.
  const grid = $derived(
    Array.from({ length: ROWS }, (_, ri) =>
      Array.from({ length: COLS }, (_, ci) => {
        const cell: Cell = [ri + 1, ci + 1];
        const state = cellState(cell);
        const names = state === "regular" || state === "empty" ? [] : namesAt(cell);
        const meaning = plain(state === "regular" ? s.regular : `${rows[ri]} · ${cols[ci]}`);
        return { cell, state, names, tip: names.join(", "), meaning };
      }),
    ),
  );

  // Whether the control has anything to show: at least one target carries a rule.
  const active = $derived(targets.some((t) => t.rules.length > 0));
</script>

{#if active}
  <div class="sovereignty-host">
    <button
      type="button"
      class="sovereignty-btn"
      aria-haspopup="true"
      aria-expanded={open}
      aria-label={plain(lang.ui.sovereignty.label)}
      title={plain(lang.ui.sovereignty.label)}
      onclick={(e) => overlays.toggleSovereigntyPanel(id, e.currentTarget)}>✅</button
    >
    {#if open}
      <div
        class="popup sovereignty-panel"
        use:placement={rowPopup(overlays.opener("sovereignty"))}
        role="group"
        aria-label={plain(lang.ui.sovereignty.label)}
      >
        <p class="sovereignty-title">
          <Msg text={s.label} /> (<a class="wiki" href={s.wiki} target="_blank" rel="noopener noreferrer">Wikipedia</a>)
        </p>
        <div class="sovereignty-grid" style="--cols:{COLS}">
          <!-- The corner names the two axes: de jure (▾) down the rows on the left,
               de facto (▸) across the columns on the right. -->
          <span class="corner">
            <span class="axis-row">▾ <Msg text={s.axisRow} /></span>
            <span class="axis-col"><Msg text={s.axisCol} /> ▸</span>
          </span>
          {#each cols as col, ci (col)}
            <span class="col-head" title={plain(s.colDefs[ci])}><Msg text={col} /></span>
          {/each}
          {#each grid as row, ri (ri)}
            <span class="row-head" title={plain(s.rowDefs[ri])}><Msg text={rows[ri]} /></span>
            {#each row as { cell, state, tip, meaning } (cellKey(cell))}
              <button
                type="button"
                class="sov-cell {state}"
                disabled={state === "regular" || state === "empty"}
                title={tip}
                aria-label={meaning}
                aria-pressed={state === "in" || state === "regular"}
                onclick={() => toggleCell(cell)}
              >{#if state === "in" || state === "regular"}✓{:else if state === "out"}✕{/if}</button>
            {/each}
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* The button sits in the row directly, like the 🚫 and Pegman hosts it mirrors. */
  .sovereignty-host {
    display: contents;
  }
  .sovereignty-btn {
    display: inline-flex;
    align-items: center;
    background: none;
    border: none;
    padding: 0 0.2rem;
    font-size: 0.8rem;
    line-height: 1;
    cursor: pointer;
    opacity: 0.45;
  }
  .sovereignty-btn:hover,
  .sovereignty-btn:focus-visible {
    opacity: 1;
  }
  .sovereignty-panel {
    font-size: 0.8rem;
    font-weight: 400;
    line-height: 1.3;
  }
  .sovereignty-title {
    margin: 0 0 0.4rem;
    font-weight: 600;
  }
  .sovereignty-grid {
    display: grid;
    /* The order things give way in a tight panel. The row-header column wants its full
       width, and grid sizing serves it before the flexible columns. The data columns
       share what is left evenly, never narrower than their longest header word
       ("independiente"); one that hits that floor leaves the rest to the other. Only
       once both sit at their floor does the row-header column shrink, wrapping its
       labels one by one, down to its own min-content (set by the corner's two axis
       strings, which keep their side-by-side room). */
    grid-template-columns: minmax(min-content, max-content) repeat(var(--cols), minmax(min-content, 1fr));
    gap: 0.2rem;
    align-items: stretch;
  }
  /* The two axis names on one line — de jure (▾, down the rows) at the left, de facto
     (▸, across the columns) at the right. One line so the corner never forces the
     header row taller than its column headers need; nowrap so both keep their room
     and, together, define the row-header column's minimum width. */
  .corner {
    grid-column: 1;
    align-self: end;
    display: flex;
    justify-content: space-between;
    gap: 0.6rem;
    padding: 0 0.35rem 0.15rem 0;
    font-size: 0.7rem;
    font-style: italic;
    opacity: 0.7;
    white-space: nowrap;
  }
  .sovereignty-title .wiki {
    font-weight: 400;
    font-size: 0.9em;
  }
  .col-head {
    font-weight: 600;
    text-align: center;
    align-self: end;
    padding: 0 0.2rem 0.15rem;
  }
  .row-head {
    font-weight: 600;
    align-self: center;
    padding-right: 0.4rem;
    /* Wraps rather than overflowing — the Romance translations ("Reconocimiento
       universal") run well past the English and would otherwise slide over the row. */
    overflow-wrap: break-word;
    hyphens: auto;
  }
  /* Not colour alone: an included cell carries ✓, an excluded one ✕, so the state
     survives red-green colour-blindness and a monochrome render. */
  .sov-cell {
    min-height: 2rem;
    border: 1px solid var(--panel-border);
    border-radius: calc(var(--radius) * 0.6);
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    color: #fff;
  }
  .sov-cell.in,
  .sov-cell.regular {
    background: #1f6f43; /* dark green — provisional, pending a palette token */
  }
  .sov-cell.out {
    background: #8f2d2d; /* dark red — provisional, pending a palette token */
  }
  .sov-cell.regular {
    cursor: default;
    opacity: 0.85;
  }
  .sov-cell.empty {
    background: transparent;
    border-style: dashed;
    cursor: default;
  }
  .sov-cell:not(:disabled):hover,
  .sov-cell:not(:disabled):focus-visible {
    outline: 2px solid var(--accent, #4a90d9);
    outline-offset: 1px;
  }
</style>
