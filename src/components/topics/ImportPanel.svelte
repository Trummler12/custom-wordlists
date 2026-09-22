<script lang="ts">
  import { overlapStats, parseImport, type PortableList } from "../../lib/custom";
  import { custom } from "../../state/custom.svelte";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";

  // The 📥 import control (§X4b): pick a file exported elsewhere, review its lists in a
  // table — name (editable, with a preview), size, and how much each overlaps an
  // existing list (Dupes %, to spot redundant imports) — and import the ticked ones.

  const PANEL_ID = "import-lists";
  const open = $derived(overlays.importPanel === PANEL_ID);
  const PREVIEW = 8;

  let chosen = $state(false); // a file has been picked (so "none found" can show)
  let parsed = $state<PortableList[]>([]);
  let selected = $state<number[]>([]);
  let editingIndex = $state<number | null>(null);
  let editingName = $state("");

  $effect(() => {
    if (!open) {
      chosen = false;
      parsed = [];
      selected = [];
      editingIndex = null;
    }
  });

  const allSelected = $derived(parsed.length > 0 && selected.length === parsed.length);

  async function onFile(e: Event): Promise<void> {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    chosen = true;
    parsed = parseImport(await file.text());
    selected = parsed.map((_, i) => i);
  }
  function toggle(i: number): void {
    selected = selected.includes(i) ? selected.filter((x) => x !== i) : [...selected, i];
  }
  function toggleAll(): void {
    selected = allSelected ? [] : parsed.map((_, i) => i);
  }
  function focusOnMount(el: HTMLInputElement) {
    el.focus();
    el.select();
  }
  function startRename(i: number, name: string): void {
    editingIndex = i;
    editingName = name;
  }
  function commitRename(): void {
    if (editingIndex != null) {
      const name = editingName.trim();
      if (name) parsed = parsed.map((p, i) => (i === editingIndex ? { ...p, name } : p));
    }
    editingIndex = null;
  }
  function preview(items: string[]): string {
    const head = items.slice(0, PREVIEW).join(", ");
    return items.length > PREVIEW ? `${head}, …` : head;
  }
  const pct = (x: number): string => `${Math.round(x * 100)}%`;
  // The highest overlap with an existing saved list: its name, the share of the
  // smaller set (Dupes %), and the share of the larger set (the reverse, on hover).
  function bestMatch(items: string[]): { name: string; ratio: number; reverse: number } | null {
    let best: { name: string; ratio: number; reverse: number } | null = null;
    for (const l of custom.savedLists) {
      const { shared, sizeA, sizeB } = overlapStats(items, l.items);
      if (shared === 0) continue;
      const ratio = shared / Math.min(sizeA, sizeB);
      if (!best || ratio > best.ratio) best = { name: l.name, ratio, reverse: shared / Math.max(sizeA, sizeB) };
    }
    return best;
  }
  function dupeClass(ratio: number): string {
    if (ratio > 0.8) return "high";
    if (ratio > 0.5) return "mid";
    if (ratio > 0.2) return "low";
    return "";
  }
  function doImport(): void {
    const lists = parsed.filter((_, i) => selected.includes(i));
    if (lists.length === 0) return;
    custom.importLists(lists);
    overlays.importPanel = null; // close after importing
  }
  function togglePanel(e: MouseEvent): void {
    overlays.toggleImportPanel(PANEL_ID, e.currentTarget as Element);
  }
</script>

<div class="import-lists-host">
  <button
    type="button"
    class="ctl-btn"
    aria-haspopup="true"
    aria-expanded={open}
    aria-label={lang.ui.custom.importLabel}
    title={lang.ui.custom.importLabel}
    onclick={togglePanel}>📥</button
  >
  {#if open}
    <div
      class="io-panel"
      class:above={overlays.importAbove}
      role="group"
      aria-label={lang.ui.custom.importTitle}
    >
      <p class="io-title">{lang.ui.custom.importTitle}</p>
      <input type="file" accept=".json,application/json" onchange={onFile} />
      {#if chosen && parsed.length === 0}
        <p class="io-empty">{lang.ui.custom.importEmpty}</p>
      {:else if parsed.length > 0}
        <table class="io-table">
          <thead>
            <tr>
              <th><input type="checkbox" checked={allSelected} onchange={toggleAll} title={lang.ui.custom.selectAll} /></th>
              <th>{lang.ui.custom.importColName}</th>
              <th>{lang.ui.custom.importColSize}</th>
              <th>{lang.ui.custom.importColDupes}</th>
              <th>{lang.ui.custom.importColWith}</th>
            </tr>
          </thead>
          <tbody>
            {#each parsed as p, i (i)}
              {@const m = bestMatch(p.items)}
              <tr>
                <td><input type="checkbox" checked={selected.includes(i)} onchange={() => toggle(i)} /></td>
                <td class="io-namecell">
                  {#if editingIndex === i}
                    <input
                      class="io-nameedit"
                      bind:value={editingName}
                      onblur={commitRename}
                      onkeydown={(e) => {
                        if (e.key === "Enter") commitRename();
                        else if (e.key === "Escape") editingIndex = null;
                      }}
                      use:focusOnMount
                    />
                  {:else}
                    <span class="io-name" title={preview(p.items)}>{p.name}</span>
                    <button type="button" class="mini" title={lang.ui.custom.listRename} onclick={() => startRename(i, p.name)}>✏️</button>
                  {/if}
                </td>
                <td class="num">{p.items.length}</td>
                <td class="num">
                  {#if m}<span class="dupe {dupeClass(m.ratio)}" title={pct(m.reverse)}>{pct(m.ratio)}</span>{:else}—{/if}
                </td>
                <td class="io-with">{m ? m.name : "—"}</td>
              </tr>
            {/each}
          </tbody>
        </table>
        <button type="button" class="io-action" disabled={selected.length === 0} onclick={doImport}>
          {lang.ui.custom.importButton}
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .import-lists-host {
    position: relative;
    display: inline-flex;
  }
  .io-panel {
    position: absolute;
    top: calc(100% + 0.25rem);
    right: 0;
    z-index: 20;
    min-width: 22rem;
    max-width: min(32rem, 94vw);
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
  .io-empty {
    margin: 0.5rem 0 0;
    font-size: 0.85rem;
    color: var(--muted-2);
  }
  .io-table {
    width: 100%;
    margin-top: 0.4rem;
    border-collapse: collapse;
    font-size: 0.82rem;
  }
  .io-table th {
    text-align: left;
    font-weight: 600;
    color: var(--muted-2);
    border-bottom: 1px solid var(--border);
    padding: 0.15rem 0.3rem;
  }
  .io-table td {
    padding: 0.15rem 0.3rem;
    border-bottom: 1px solid var(--border);
  }
  .io-table .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .io-namecell {
    display: flex;
    align-items: center;
    gap: 0.2rem;
  }
  .io-name,
  .io-with {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 9rem;
    display: inline-block;
  }
  .io-nameedit {
    font: inherit;
    font-size: 0.82rem;
    min-width: 6rem;
  }
  .mini {
    background: none;
    border: none;
    padding: 0 0.1rem;
    font: inherit;
    font-size: 0.8rem;
    line-height: 1;
    cursor: pointer;
  }
  /* Dupes % thresholds: the higher the overlap, the more an import repeats an existing
     list — worth a warmer warning. */
  .dupe.low {
    color: #b59f00;
  }
  .dupe.mid {
    color: #c8791e;
  }
  .dupe.high {
    color: #c83c3c;
    font-weight: 600;
  }
  .io-action {
    margin-top: 0.4rem;
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
