<script lang="ts">
  import { availableSeparators, separatorInItems, type Separator } from "../../lib/custom";
  import {
    custom,
    PREVIEW_CHARS_MAX,
    PREVIEW_CHARS_MIN,
    PREVIEW_ITEMS_MAX,
    PREVIEW_ITEMS_MIN,
    ROW_STEP,
  } from "../../state/custom.svelte";
  import { lang } from "../../state/lang.svelte";
  import { output } from "../../state/output.svelte";
  import { clampPanelLeft, overlays } from "../../state/overlays.svelte";
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
  const SETTINGS_ID = "custom-settings";

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
  // The ⚙️ Custom settings — its own overlay slot (not the shared tip slot), so a hover
  // tooltip can't dismiss it; it dismisses on a press elsewhere / Escape / scroll like the
  // export/import/saved-lists panels, and is positioned the same way (clampPanelLeft).
  const settingsOpen = $derived(overlays.customSettingsPanel === SETTINGS_ID);
  function toggleSettings(e: MouseEvent): void {
    overlays.toggleCustomSettingsPanel(SETTINGS_ID, e.currentTarget as Element);
  }
  let settingsEl = $state<HTMLElement>();
  let settingsLeft = $state<number | null>(null);
  let settingsMaxW = $state<number | null>(null);
  $effect(() => {
    if (!settingsOpen || !settingsEl) {
      settingsLeft = null;
      settingsMaxW = null;
      return;
    }
    const el = settingsEl;
    const place = () => {
      // fit-content, capped at the Topics column's width like the tip / confirm popovers.
      const col = document.querySelector(".col-topics");
      settingsMaxW = Math.min(col?.clientWidth ?? 320, window.innerWidth - 16);
      settingsLeft = clampPanelLeft(el);
    };
    const ro = new ResizeObserver(place);
    ro.observe(el);
    window.addEventListener("resize", place);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", place);
    };
  });

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
    // The column height just changed, which moves where the two sticky groups meet.
    scheduleClamp();
  });

  // Keep each column's two sticky groups from overlapping. CSS sticky can't see across
  // siblings, so a group pulled toward a viewport edge by its sticky offset slides over
  // the other group (which is riding at the column edge) instead of stopping at it. This
  // eases the pulled group back toward the edge it came from until the overlap clears.
  let ctlGrid = $state<HTMLElement>();
  const GROUP_GAP = 3; // px kept between the groups when they meet (matches the control gap)
  let clampRaf = 0;
  function scheduleClamp(): void {
    if (clampRaf) return;
    clampRaf = requestAnimationFrame(() => {
      clampRaf = 0;
      clampSticky();
    });
  }
  function clampSticky(): void {
    if (!ctlGrid) return;
    for (const col of ctlGrid.querySelectorAll<HTMLElement>(".ctl-col")) {
      const top = col.querySelector<HTMLElement>(".ctl-group.top");
      const bottom = col.querySelector<HTMLElement>(".ctl-group.bottom");
      if (!top || !bottom) continue;
      // Measure at rest — a stale transform would poison the reading.
      top.style.transform = "";
      bottom.style.transform = "";
      const cr = col.getBoundingClientRect();
      const tr = top.getBoundingClientRect();
      const br = bottom.getBoundingClientRect();
      const overlap = tr.bottom + GROUP_GAP - br.top;
      if (overlap <= 0) continue;
      // The overlap is the sticky-displaced (anchored) group intruding on the one riding at
      // its column edge. Ease the anchored group back toward the edge it was pulled from —
      // never past it (min with its displacement), so it comes to rest at the boundary
      // rather than shoving the riding group over it. The column is always at least both
      // groups tall, so this fully clears the overlap except at the extreme where the whole
      // cluster is nearly scrolled off — there it stops at the boundary with a slight touch.
      if (tr.top > cr.top + 1) {
        // top group pulled down from the column top — let it slide back up
        top.style.transform = `translateY(${-Math.min(overlap, tr.top - cr.top)}px)`;
      } else if (br.bottom < cr.bottom - 1) {
        // bottom group pulled up from the column bottom — let it slide back down
        bottom.style.transform = `translateY(${Math.min(overlap, cr.bottom - br.bottom)}px)`;
      }
    }
  }
  $effect(() => () => cancelAnimationFrame(clampRaf));
</script>

<svelte:window onscroll={scheduleClamp} onresize={scheduleClamp} />

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
    <!-- The ⚙️ Custom settings, after the separator (so the gear doesn't read as part of it),
         its own panel slot so a hover tooltip can't dismiss it. -->
    <span class="custom-settings-host">
      <button
        type="button"
        class="settings-btn"
        aria-haspopup="dialog"
        aria-expanded={settingsOpen}
        aria-label={lang.ui.custom.settingsLabel}
        title={lang.ui.custom.settingsLabel}
        onclick={toggleSettings}>⚙️</button
      >
      {#if settingsOpen}
        <div
          bind:this={settingsEl}
          class="settings-panel"
          class:above={overlays.customSettingsAbove}
          style={`${settingsMaxW == null ? "" : `max-width:${settingsMaxW}px;`}${settingsLeft == null ? "" : `left:${settingsLeft}px;right:auto;`}`}
          role="dialog"
          aria-label={lang.ui.custom.settingsTitle}
        >
          <p class="settings-title">{lang.ui.custom.settingsTitle}</p>
          <label class="settings-row">
            <span>{lang.ui.custom.maxPreviewItems}</span>
            <input
              type="number"
              min={PREVIEW_ITEMS_MIN}
              max={PREVIEW_ITEMS_MAX}
              value={custom.maxPreviewItems}
              onchange={(e) => custom.setMaxPreviewItems(e.currentTarget.valueAsNumber)}
            />
          </label>
          <label class="settings-row">
            <span>{lang.ui.custom.maxPreviewChars}</span>
            <input
              type="number"
              min={PREVIEW_CHARS_MIN}
              max={PREVIEW_CHARS_MAX}
              value={custom.maxPreviewChars}
              onchange={(e) => custom.setMaxPreviewChars(e.currentTarget.valueAsNumber)}
            />
          </label>
        </div>
      {/if}
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
    <div class="ctl-grid" bind:this={ctlGrid}>
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
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* Only the title gives way; the markers, separator group and count keep their size. */
  .custom-row > :not(.title) {
    flex-shrink: 0;
  }
  .sep {
    display: inline-flex;
    align-items: baseline;
    gap: 0.3rem;
    /* Leads the right-hand group (Separator · ⚙️ · count): the auto margin sits on the
       first of them, so it and everything after are pushed to the right of the row. */
    margin-left: auto;
  }
  .custom-settings-host {
    position: relative;
    display: inline-flex;
  }
  .settings-btn {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-size: 0.85rem;
    line-height: 1;
    cursor: pointer;
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
  /* The 🗑️ confirm popover. Position comes from overlays.tipStyle (fixed, anchored to the
     trigger); the rest mirrors a tip-note's look. */
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
  /* The ⚙️ panel — absolute under its host, viewport-clamped by `settingsLeft`; the flip and
     look mirror the export/import panels. */
  .settings-panel {
    position: absolute;
    top: calc(100% + 0.25rem);
    /* left-anchored (JS sets the exact left): an out-of-flow box sized by `right` off this
       small host would shrink to the host's width. `max-content` fits the content; the JS
       `max-width` caps it at the Topics column, like the tip / confirm popovers. */
    left: 0;
    z-index: 20;
    width: max-content;
    max-width: min(28rem, 92vw); /* fallback before the JS col-topics cap lands */
    padding: 0.5rem 0.6rem;
    font-size: 0.8rem; /* the compact size the old tip-note popover inherited */
    color: var(--chip-fg);
    background: var(--chip-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  }
  .settings-panel.above {
    top: auto;
    bottom: calc(100% + 0.25rem);
  }
  .settings-title {
    margin: 0 0 0.4rem;
    font-weight: 600;
    color: var(--muted-2);
  }
  .settings-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    margin-top: 0.3rem;
  }
  .settings-row input {
    width: 4.5rem;
    font: inherit;
    font-size: 0.8rem;
  }
</style>
