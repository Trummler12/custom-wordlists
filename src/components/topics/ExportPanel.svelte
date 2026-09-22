<script lang="ts">
  import { exportLists } from "../../lib/custom";
  import { custom } from "../../state/custom.svelte";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";

  // The 📤 export control (§X4b): a panel that picks which saved lists to write to a
  // JSON file the reader downloads — the only way to move lists off this browser.
  // Reuses the `exportLists` overlay slot for dismissal.

  const PANEL_ID = "export-lists";
  const open = $derived(overlays.exportPanel === PANEL_ID);

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
      class="io-panel"
      class:above={overlays.exportAbove}
      role="group"
      aria-label={lang.ui.custom.exportTitle}
    >
      <p class="io-title">{lang.ui.custom.exportTitle}</p>
      <label class="io-all">
        <input type="checkbox" checked={allSelected} onchange={toggleAll} />
        <span>{lang.ui.custom.selectAll}</span>
      </label>
      <ul>
        {#each custom.savedLists as l (l.id)}
          <li>
            <label>
              <input type="checkbox" checked={selected.includes(l.id)} onchange={() => toggle(l.id)} />
              <span class="io-name">{l.name}</span>
            </label>
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
    gap: 0.3rem;
    font-size: 0.85rem;
    padding-bottom: 0.3rem;
    border-bottom: 1px solid var(--border);
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
  li label {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.85rem;
  }
  .io-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
