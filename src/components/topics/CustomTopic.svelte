<script lang="ts">
  import { availableSeparators, separatorInItems, type Separator } from "../../lib/custom";
  import { custom, ROW_STEP } from "../../state/custom.svelte";
  import { lang } from "../../state/lang.svelte";
  import { output } from "../../state/output.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import TipMarker from "../common/TipMarker.svelte";
  import TipNote from "../common/TipNote.svelte";
  import CustomOmittedPanel from "./CustomOmittedPanel.svelte";
  import ExportPanel from "./ExportPanel.svelte";
  import ImportPanel from "./ImportPanel.svelte";
  import SavedListsPanel from "./SavedListsPanel.svelte";

  // The reader's own word-list row, pinned to the foot of the tree. No checkbox: the
  // input drives the output directly, and what it contributes / drops is the counter
  // and the 🚫 panel. Its title lines up with the "Topics" heading (no expander
  // column), and it reuses the tree-root `.meta` styles by rendering inside `.topics`.
  //
  // §X2 adds the control cluster right of the textarea. The controls are declared as
  // data — column (1 = left, 2 = right) and order (>=0 from the top, <0 anchored to
  // the bottom) — so a later batch drops 💾 / 📤 / 📥 in as more entries, not markup.

  const EXAMPLES = ["Apple", "Pear", "Orange"];
  const CONFIRM_ID = "custom-clear-confirm";

  const breakdown = $derived(output.customBreakdown);
  // The dropdown offers the separators that occur; the one in force is always among
  // them, but keep it so the select can never show a blank value.
  const options = $derived(withCurrent(availableSeparators(custom.input), custom.separator));
  // Illustrates the active separator in the empty field: inline for a visible
  // character, a stacked block for newline / tab.
  const placeholder = $derived(EXAMPLES.join(custom.separator) + custom.separator + "…");
  // The same separator-in-an-item advisory the saved lists carry, for the live input.
  const inputWarn = $derived(
    separatorInItems(custom.items, custom.separator)
      ? `${lang.ui.custom.listWarnTitle}{br}- ${lang.ui.custom.listWarnSeparator}`
      : null,
  );

  let textarea = $state<HTMLTextAreaElement>();
  // How many rows the content (or, while empty, the placeholder) needs — measured by
  // `fit`, read by the grow control's `+` count.
  let contentRows = $state(1);

  // How far the set cap sits above the content, as `+` glyphs: one for the base, then
  // one more per full row-step (ROW_STEP) the cap exceeds the content. Up to four `+`
  // fit the icon, laid out two-per-line (the space is the line break); beyond that it
  // reads "+N" (N = steps), which only widened range consts reach in practice. The
  // control keeps stepping the height even once the cap already clears the content —
  // this readout is how a reader sees by how much.
  function plusIcon(): string {
    const steps = Math.max(0, Math.floor((custom.maxRows - contentRows) / ROW_STEP));
    if (steps <= 3) {
      const n = steps + 1;
      return n <= 2 ? "+".repeat(n) : `++ ${"+".repeat(n - 2)}`;
    }
    return `+${Math.min(steps, 9)}`;
  }

  interface CustomControl {
    id: string;
    /** A function so an icon can reflect live state — the grow control shows one `+`
     *  per full row-step its cap sits above the content (see `plusIcon`). */
    icon: () => string;
    column: 1 | 2;
    order: number;
    tooltip: () => string;
    danger?: boolean;
    /** The icon holds several glyphs stacked over two lines — tighten its leading. */
    stack?: boolean;
    active?: () => boolean;
    enabled: () => boolean;
    onClick: (e: MouseEvent) => void;
  }

  const controls: CustomControl[] = [
    {
      id: "fit",
      icon: () => "↕️",
      column: 2,
      order: 0,
      tooltip: () => lang.ui.custom.fitToggle,
      active: () => custom.fitContent,
      enabled: () => true,
      onClick: () => custom.toggleFitContent(),
    },
    {
      id: "shrink",
      icon: () => "−",
      column: 1,
      order: 0,
      tooltip: () => lang.ui.custom.fewerRows,
      enabled: () => custom.canShrink,
      onClick: () => custom.shrinkRows(),
    },
    {
      id: "grow",
      icon: () => plusIcon(),
      column: 1,
      order: 1,
      stack: true,
      tooltip: () => lang.ui.custom.moreRows,
      enabled: () => custom.canGrow,
      onClick: () => custom.growRows(),
    },
    {
      id: "clear",
      icon: () => "🗑️",
      column: 1,
      order: -1, // anchored to the bottom of its column
      tooltip: () => lang.ui.custom.clearHint,
      danger: true,
      enabled: () => custom.input.length > 0,
      // First click arms a confirm popover (a pinned tip) rather than clearing at once.
      onClick: (e) => overlays.openTip(CONFIRM_ID, e.currentTarget as Element, true, true),
    },
  ];

  // One column split into a top group (order >= 0) and a bottom group (order < 0),
  // each sorted by order; the bottom group anchors to the foot of the column.
  const colGroup = (col: number, bottom: boolean): CustomControl[] =>
    controls
      .filter((c) => c.column === col && (bottom ? c.order < 0 : c.order >= 0))
      .sort((a, b) => a.order - b.order);

  function withCurrent(list: Separator[], cur: Separator): Separator[] {
    return list.includes(cur) ? list : [cur, ...list];
  }
  function sepLabel(s: Separator): string {
    return s === "\n" ? "\\n" : s === "\t" ? "\\t" : s;
  }
  function confirmClear(): void {
    custom.clear();
    overlays.closeTip();
  }

  // Grow the textarea to its content — or, while empty, to its placeholder — up to
  // `custom.maxRows`, then scroll; or, with ↕️ on, to the whole content uncapped.
  // Driven by an $effect so it refits as the reader types, when the separator changes
  // the placeholder's line count, and when the − / + / ↕️ controls change the cap.
  function fit(el: HTMLTextAreaElement): void {
    el.style.height = "auto";
    const cs = getComputedStyle(el);
    const line = parseFloat(cs.lineHeight) || 20;
    const extra =
      parseFloat(cs.paddingTop) +
      parseFloat(cs.paddingBottom) +
      parseFloat(cs.borderTopWidth) +
      parseFloat(cs.borderBottomWidth);
    // `scrollHeight` at `height:auto` is the content's (or placeholder's) natural
    // height; the grow control reads its row count.
    const natural = el.scrollHeight;
    contentRows = Math.max(1, Math.round((natural - extra) / line));
    if (custom.fitContent) {
      el.style.height = `${natural}px`;
      el.style.overflowY = "hidden";
      return;
    }
    const max = line * custom.maxRows + extra;
    el.style.height = `${Math.min(natural, max)}px`;
    el.style.overflowY = natural > max ? "auto" : "hidden";
  }
  $effect(() => {
    // Deps: the text, the placeholder (via the separator), and the height controls.
    custom.input;
    custom.separator;
    custom.maxRows;
    custom.fitContent;
    if (textarea) fit(textarea);
  });
</script>

{#snippet control(c: CustomControl)}
  <button
    type="button"
    class="ctl-btn"
    class:danger={c.danger}
    class:active={c.active?.()}
    class:stacked={c.stack}
    class:tip-trigger={c.id === "clear"}
    disabled={!c.enabled()}
    aria-pressed={c.active ? c.active() : undefined}
    aria-label={c.tooltip()}
    title={c.tooltip()}
    onclick={(e) => c.onClick(e)}>{c.icon()}</button
  >
{/snippet}

<div class="custom-item">
  <div class="custom-row">
    <span class="title">{lang.ui.custom.title}</span>
    <TipMarker tipId="custom-info" icon="ℹ️" text={lang.ui.custom.infoHint} />
    <CustomOmittedPanel />
    {#if inputWarn}
      <TipMarker tipId="custom-warn" icon="⚠️" text={inputWarn} />
    {/if}
    <span class="sep">
      <label class="sep-label" for="custom-sep">{lang.ui.custom.separatorLabel}</label>
      <select
        id="custom-sep"
        class="sep-select"
        aria-label={lang.ui.custom.separatorPick}
        value={custom.separator}
        onchange={(e) => custom.setSeparator(e.currentTarget.value as Separator)}
      >
        {#each options as s (s)}
          <option value={s}>{sepLabel(s)}</option>
        {/each}
      </select>
    </span>
    <!-- Kept / parsed, mirroring a topic row's selected / total. -->
    <span class="meta" title={lang.ui.tree.wordsOf(breakdown.kept.length, breakdown.total)}>
      {breakdown.kept.length}/<span class="total">{breakdown.total}</span>
    </span>
  </div>
  <!-- Outside the row, like a topic's marker note: it stretches the full width. -->
  <TipNote id="custom-info" text={lang.ui.custom.infoHint} />
  {#if inputWarn}<TipNote id="custom-warn" text={inputWarn} />{/if}
  <div class="custom-body">
    <textarea
      bind:this={textarea}
      class="custom-input"
      rows="1"
      placeholder={placeholder}
      value={custom.input}
      oninput={(e) => custom.setInput(e.currentTarget.value)}
    ></textarea>
    <div class="ctl-grid">
      {#each [1, 2] as col (col)}
        <div class="ctl-col">
          <div class="ctl-group top">
            {#each colGroup(col, false) as c (c.id)}{@render control(c)}{/each}
          </div>
          <div class="ctl-group bottom">
            {#each colGroup(col, true) as c (c.id)}{@render control(c)}{/each}
            <!-- The saved-lists manager and the import/export controls are panels, not
                 plain icon-buttons, so they are components rather than control
                 descriptors; they stack at the foot of column 2 (📤 / 📥 above 💾). -->
            {#if col === 2}
              <ExportPanel />
              <ImportPanel />
              <SavedListsPanel />
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
  <!-- The 🗑️ two-step confirm. Shares the tip overlay slot, so a press elsewhere,
       Escape or a scroll dismisses it; `tip-note` keeps a click inside from closing it. -->
  {#if overlays.tip === CONFIRM_ID}
    <div class="tip-note local confirm-pop" style={overlays.tipStyle} role="dialog" aria-label={lang.ui.custom.clearHint}>
      <p class="confirm-msg">{lang.ui.custom.clearConfirm}</p>
      <div class="confirm-actions">
        <button type="button" class="confirm-btn" onclick={confirmClear}>{lang.ui.custom.clearConfirmButton}</button>
        <button type="button" class="confirm-cancel" onclick={() => overlays.closeTip()}>{lang.ui.custom.cancel}</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .custom-item {
    position: relative; /* anchor for the .tip-note */
    /* A heavier rule than a topic row's bottom border, to set the reader's own list
       apart from the curated tree above. */
    border-top: 2px solid var(--border);
    margin-top: 0.35rem;
    padding-top: 0.15rem;
  }
  .custom-row {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    /* No left inset: the title sits flush under the "Topics" heading, not indented
       into the checkbox/expander column the topic rows use. */
    padding: 0.5rem 0.2rem 0.35rem 0;
  }
  .custom-row .title {
    font-weight: 600;
  }
  .sep {
    display: inline-flex;
    align-items: baseline;
    gap: 0.3rem;
    /* Pushed to the right of the row (the count trails it), rather than sitting just
       after the markers on the left. */
    margin-left: auto;
  }
  .sep-label {
    color: var(--muted-2);
    font-size: 0.85rem;
  }
  .sep-select {
    font: inherit;
    font-size: 0.85rem;
  }

  /* The input and its control cluster, side by side. The controls stretch to the
     input's height so the bottom-anchored ones (🗑️) sit at its foot. */
  .custom-body {
    display: flex;
    align-items: stretch;
    gap: 0.35rem;
    margin: 0 0 0.5rem;
  }
  .custom-input {
    flex: 1;
    min-width: 0;
    box-sizing: border-box;
    padding: 0.35rem 0.45rem;
    font: inherit;
    font-size: 0.9rem;
    line-height: 1.4;
    color: var(--chip-fg);
    background: var(--chip-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    /* Height is the fit() effect's job. */
    resize: none;
    overflow-y: hidden;
  }
  .ctl-grid {
    display: flex;
    gap: 0.15rem;
  }
  .ctl-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* pushes the bottom group to the foot */
    gap: 0.15rem;
  }
  .ctl-group {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  /* The controls try to stay in view while a tall input scrolls past: the top group
     sticks near the top, the bottom group near the bottom, each free to slide within
     the (full-height) column until the other end reaches it. */
  .ctl-group.top {
    position: sticky;
    top: 0.3rem;
  }
  .ctl-group.bottom {
    position: sticky;
    /* Clear the pinned footer (--footer-h) so the bottom control doesn't come to
       rest behind it — the top group needs no such offset, nothing overlays there. */
    bottom: calc(var(--footer-h) + 0.3rem);
    /* This sticky box is a stacking context that traps the export/import/saved-lists
       panels' own z-index. Lift it above the (transparent, later-in-DOM) sticky output
       column so a panel jutting into Output covers it, instead of the output's border /
       chips / headings painting back through the panel. Below the footer's z-index (20),
       which must stay on top. */
    z-index: 5;
  }
  /* The confirm popover. Position comes from overlays.tipStyle (fixed, anchored to
     the 🗑️); the rest mirrors a tip-note's look. */
  .confirm-pop {
    max-width: min(18rem, 90vw);
    padding: 0.5rem 0.6rem;
    font-size: 0.8rem;
    line-height: 1.35;
    color: var(--chip-fg);
    background: var(--chip-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
    z-index: 30;
  }
  .confirm-msg {
    margin: 0 0 0.4rem;
  }
  .confirm-actions {
    display: flex;
    gap: 0.4rem;
  }
  .confirm-btn {
    font: inherit;
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
    color: var(--chip-fg);
    background: rgba(200, 60, 60, 0.22);
    border: 1px solid rgba(200, 60, 60, 0.7);
    border-radius: var(--radius);
    cursor: pointer;
  }
  .confirm-btn:hover,
  .confirm-btn:focus-visible {
    background: rgba(200, 60, 60, 0.34);
  }
  .confirm-cancel {
    font: inherit;
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
    color: var(--chip-fg);
    background: none;
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    cursor: pointer;
  }
</style>
