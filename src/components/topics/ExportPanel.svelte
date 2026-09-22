<script lang="ts">
  import { exportLists } from "../../lib/custom";
  import { custom } from "../../state/custom.svelte";
  import { lang } from "../../state/lang.svelte";
  import { clampPanelLeft, overlays } from "../../state/overlays.svelte";
  import TipText from "../common/TipText.svelte";

  // The 📤 export control (§X4b): a panel that picks which saved lists to write to a
  // JSON file the reader downloads — the only way to move lists off this browser.
  // Reuses the `exportLists` overlay slot for dismissal.

  const PANEL_ID = "export-lists";
  const open = $derived(overlays.exportPanel === PANEL_ID);
  const PREVIEW = 8; // items named in a row's content preview

  let selected = $state<number[]>([]);
  // Start with every list ticked each time the panel opens.
  $effect(() => {
    if (open) selected = custom.savedLists.map((l) => l.id);
  });

  const allSelected = $derived(
    custom.savedLists.length > 0 && selected.length === custom.savedLists.length,
  );

  function toggle(id: number): void {
    selected = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
  }
  function toggleAll(): void {
    selected = allSelected ? [] : custom.savedLists.map((l) => l.id);
  }
  function preview(items: string[]): string {
    const head = items.slice(0, PREVIEW).join(", ");
    return items.length > PREVIEW ? `${head}, …` : head;
  }
  // Keep the panel in the viewport: right-align it under its button, but let it jut
  // into the Output column rather than off the left edge (clampPanelLeft). Re-placed on
  // resize and whenever its own size changes (a ResizeObserver).
  let panelEl = $state<HTMLElement>();
  let panelLeft = $state<number | null>(null);
  $effect(() => {
    if (!open || !panelEl) {
      panelLeft = null;
      return;
    }
    const el = panelEl;
    const place = () => (panelLeft = clampPanelLeft(el));
    const ro = new ResizeObserver(place);
    ro.observe(el);
    window.addEventListener("resize", place);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", place);
    };
  });
  function download(): void {
    const lists = custom.savedLists
      .filter((l) => selected.includes(l.id))
      .map((l) => ({ name: l.name, separator: l.separator, items: l.items }));
    if (lists.length === 0) return;
    const blob = new Blob([exportLists(lists)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "custom-wordlists.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  function togglePanel(e: MouseEvent): void {
    overlays.toggleExportPanel(PANEL_ID, e.currentTarget as Element);
  }
</script>

<div class="export-lists-host">
  <button
    type="button"
    class="ctl-btn"
    aria-haspopup="true"
    aria-expanded={open}
    aria-label={lang.ui.custom.exportLabel}
    title={lang.ui.custom.exportLabel}
    disabled={custom.savedLists.length === 0}
    onclick={togglePanel}>📤</button
  >
  {#if open}
    <div
      bind:this={panelEl}
      class="io-panel"
      class:above={overlays.exportAbove}
      style={panelLeft == null ? "" : `left:${panelLeft}px;right:auto;`}
      role="group"
      aria-label={lang.ui.custom.exportTitle}
    >
      <p class="io-title">{lang.ui.custom.exportTitle}</p>
      <!-- Doubles as the column header: the "Select all" toggle on the left (its hitbox
           only its own text, not the whole row), the "Size" heading over the counts. -->
      <div class="io-all">
        <label class="io-all-label">
          <input type="checkbox" checked={allSelected} onchange={toggleAll} />
          <span>{lang.ui.custom.selectAll}</span>
        </label>
        <span class="io-head-size">{lang.ui.custom.importColSize}</span>
      </div>
      <!-- The name is its own preview trigger, so it sits beside the checkbox rather than
           inside its label — a tap on the name shows the list, it does not toggle the tick. -->
      <ul onscroll={overlays.onLocalScroll}>
        {#each custom.savedLists as l (l.id)}
          <li>
            <input
              type="checkbox"
              class="io-check"
              checked={selected.includes(l.id)}
              onchange={() => toggle(l.id)}
              aria-label={l.name}
            />
            <TipText id={`export-preview-${l.id}`} text={preview(l.items)} label={l.name} maxWidth="12rem" />
            <span class="io-size">{l.items.length}</span>
          </li>
        {/each}
      </ul>
      <button type="button" class="io-action" disabled={selected.length === 0} onclick={download}>
        {lang.ui.custom.exportDownload}
      </button>
    </div>
  {/if}
</div>

<style>
  .export-lists-host {
    position: relative;
    display: inline-flex;
  }
  .io-panel {
    position: absolute;
    top: calc(100% + 0.25rem);
    right: 0;
    z-index: 20;
    min-width: 16rem;
    max-width: min(24rem, 92vw);
    padding: 0.5rem 0.6rem;
    color: var(--chip-fg);
    background: var(--chip-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  }
  .io-panel.above {
    top: auto;
    bottom: calc(100% + 0.25rem);
  }
  .io-title {
    margin: 0 0 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--muted-2);
  }
  .io-all {
    display: flex;
    align-items: center;
    justify-content: space-between; /* toggle left, Size heading over the counts */
    gap: 0.3rem;
    font-size: 0.85rem;
    padding-bottom: 0.3rem;
    border-bottom: 1px solid var(--border);
  }
  /* Only the toggle's own text is a hitbox, not the full row out to the right edge. */
  .io-all-label {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    cursor: pointer;
  }
  .io-head-size {
    font-size: 0.8rem;
    color: var(--muted-2);
  }
  ul {
    list-style: none;
    margin: 0.3rem 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    max-height: 14rem;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  li {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
  }
  .io-check {
    flex: none;
  }
  /* The size sits at the row's right edge, so the counts line up as a column. */
  .io-size {
    margin-left: auto;
    font-size: 0.8rem;
    color: var(--muted-2);
    font-variant-numeric: tabular-nums;
  }
  .io-action {
    margin-top: 0.3rem;
    font: inherit;
    font-size: 0.8rem;
    padding: 0.25rem 0.6rem;
    color: var(--chip-fg);
    background: var(--chip-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    cursor: pointer;
  }
  .io-action:hover:not(:disabled),
  .io-action:focus-visible {
    border-color: var(--muted-2);
  }
  .io-action:disabled {
    opacity: 0.4;
    cursor: default;
  }
</style>
