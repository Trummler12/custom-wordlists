<script lang="ts">
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
  type Rule = { id: string; cell: Cell; names: string[] };
  let { id, targets }: { id: string; targets: { tid: string; rules: Rule[] }[] } = $props();

  const ROWS = 4;
  const COLS = 2;
  const REGULAR: Cell = [1, 1];

  const open = $derived(overlays.sovereigntyPanel === id);

  // A cell is in force through a plain flip of an omittable, unlocked rule; a flat
  // topic's group id equals its topic id, so the key is (tid, tid, ruleId). A rule
  // that is NOT toggled (not omitting) means the cell is included — shown.
  const included = (tid: string, ruleId: string) => !settings.isToggled(tid, tid, ruleId);

  // Every (target, rule) pair sitting on a given cell — a leaf votes on and is
  // commanded for only the cells it actually carries.
  const holdersAt = (c: Cell) =>
    targets.flatMap((t) => t.rules.filter((r) => cellKey(r.cell) === cellKey(c)).map((r) => ({ tid: t.tid, id: r.id })));

  // Regular states are always in; any other cell follows the majority of its
  // holders, and a cell no target carries (empty here) is neither in nor out.
  const cellState = (c: Cell): "regular" | "in" | "out" | "empty" => {
    if (cellKey(c) === cellKey(REGULAR)) return "regular";
    const holders = holdersAt(c);
    if (holders.length === 0) return "empty";
    const inCount = holders.filter((h) => included(h.tid, h.id)).length;
    return inCount * 2 >= holders.length ? "in" : "out";
  };

  // Click a cell: turning it on fills the staircase up-and-left, turning it off
  // clears everything down-and-right — every rule across every target updated so the
  // included region stays one connected block.
  function toggleCell(c: Cell): void {
    const state = cellState(c);
    if (state === "regular" || state === "empty") return;
    const clickedIncluded = state === "in";
    for (const t of targets) {
      for (const r of t.rules) {
        const want = includedAfterClick(r.cell, c, clickedIncluded, included(t.tid, r.id));
        if (included(t.tid, r.id) !== want) settings.toggleOmission(t.tid, t.tid, r.id);
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
        const meaning = state === "regular" ? s.regular : `${rows[ri]} · ${cols[ci]}`;
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
      aria-label={lang.ui.sovereignty.label}
      title={lang.ui.sovereignty.label}
      onclick={(e) => overlays.toggleSovereigntyPanel(id, e.currentTarget)}>✅</button
    >
    {#if open}
      <div
        class="sovereignty-panel"
        class:above={overlays.sovereigntyAbove}
        role="group"
        aria-label={lang.ui.sovereignty.label}
      >
        <p class="sovereignty-title">
          {s.label} (<a class="wiki" href={s.wiki} target="_blank" rel="noopener noreferrer">Wikipedia</a>)
        </p>
        <div class="sovereignty-grid" style="--cols:{COLS}">
          <!-- The corner names the two axes: de jure (▾) down the rows on the left,
               de facto (▸) across the columns on the right. -->
          <span class="corner">
            <span class="axis-row">▾ {s.axisRow}</span>
            <span class="axis-col">{s.axisCol} ▸</span>
          </span>
          {#each cols as col, ci (col)}
            <span class="col-head" title={s.colDefs[ci]}>{col}</span>
          {/each}
          {#each grid as row, ri (ri)}
            <span class="row-head" title={s.rowDefs[ri]}>{rows[ri]}</span>
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
  /* Stretched across the row rather than hung off the button, as the other panels
     are, and for the same reason: the trigger sits at an unknown offset. */
  .sovereignty-panel {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 10;
    max-height: clamp(9rem, calc(60vh - var(--footer-h)), 30rem);
    overflow: auto;
    overscroll-behavior: contain;
    padding: 0.5rem 0.6rem;
    background: var(--chip-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
    font-size: 0.8rem;
    font-weight: 400;
    line-height: 1.3;
    text-align: left;
    cursor: auto;
  }
  .sovereignty-panel.above {
    top: auto;
    bottom: 100%;
  }
  .sovereignty-title {
    margin: 0 0 0.4rem;
    font-weight: 600;
  }
  .sovereignty-grid {
    display: grid;
    /* Row-header column takes what its content needs and shrinks to its min-content
       (wrapping the labels) when the panel is tight; the corner's two axis strings
       set that min-content, so they never lose their side-by-side room. The data
       columns share the rest and carry the wider column headers, which wrap. */
    grid-template-columns: minmax(min-content, max-content) repeat(var(--cols), minmax(3rem, 1fr));
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
