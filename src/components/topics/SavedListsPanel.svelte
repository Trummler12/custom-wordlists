<script lang="ts">
  import { SEPARATORS, separatorInItems, type Separator } from "../../lib/custom";
  import { custom, NAME_MAX, type SavedList } from "../../state/custom.svelte";
  import { lang } from "../../state/lang.svelte";
  import { clampPanelLeft, overlays } from "../../state/overlays.svelte";
  import TipMarker from "../common/TipMarker.svelte";
  import TipNote from "../common/TipNote.svelte";
  import TipText from "../common/TipText.svelte";

  // The 💾 saved-lists manager (§X3): a control on the Custom cluster that opens a
  // panel of the reader's stored lists. Each tile activates its list into the output,
  // renames / re-saves / loads / deletes / reorders it; a trailing placeholder tile
  // saves the current input as a new list. On the placeholder every control is shown
  // but disabled (like a real tile with nothing to act on), bar the 💾 that saves.
  //
  // The destructive actions (replace, overwrite-on-load, delete) confirm in their own
  // pinned popover — the same tip mechanism the input's 🗑️ uses — not inline.
  //
  // Reuses the `savedLists` overlay slot, so the panel dismisses on outside-click,
  // Escape and scroll like the app's other panels.

  const PANEL_ID = "saved-lists";
  const CONFIRM_ID = "saved-list-confirm";
  const open = $derived(overlays.savedListsPanel === PANEL_ID);

  // Inline rename + armed-confirm state, local to the open panel and reset on close.
  let editingId = $state<number | null>(null);
  let editingName = $state("");
  let pending = $state<{ kind: "replace" | "load" | "delete"; id: number; name: string } | null>(null);
  $effect(() => {
    if (!open) {
      editingId = null;
      pending = null;
    }
  });

  function sepLabel(s: Separator): string {
    return s === "\n" ? "\\n" : s === "\t" ? "\\t" : s;
  }
  function warnText(items: string[], sep: string): string | null {
    return separatorInItems(items, sep)
      ? `${lang.ui.custom.listWarnTitle}{br}- ${lang.ui.custom.listWarnSeparator}`
      : null;
  }
  function focusOnMount(el: HTMLInputElement) {
    el.focus();
    el.select();
  }

  function startRename(id: number, name: string): void {
    editingId = id;
    editingName = name;
  }
  function commitRename(): void {
    if (editingId != null) {
      const name = editingName.trim();
      if (name) custom.renameList(editingId, name);
    }
    editingId = null;
  }

  function arm(kind: "replace" | "load" | "delete", id: number, name: string, e: MouseEvent): void {
    pending = { kind, id, name };
    overlays.openTip(CONFIRM_ID, e.currentTarget as Element, true, true);
  }
  // No confirm when the field is empty — a load would overwrite nothing.
  function loadOrConfirm(id: number, name: string, e: MouseEvent): void {
    if (custom.input.length === 0) custom.loadIntoInput(id);
    else arm("load", id, name, e);
  }
  function confirmPending(): void {
    if (pending) {
      const { kind, id } = pending;
      if (kind === "replace") custom.replaceList(id);
      else if (kind === "load") custom.loadIntoInput(id);
      else custom.deleteList(id);
    }
    pending = null;
    overlays.closeTip();
  }
  function cancelPending(): void {
    pending = null;
    overlays.closeTip();
  }
  function confirmMessage(kind: "replace" | "load" | "delete", name: string): string {
    if (kind === "replace") return lang.ui.custom.listReplaceConfirm(name);
    if (kind === "delete") return lang.ui.custom.listDeleteConfirm(name);
    return lang.ui.custom.listLoadConfirm;
  }
  function toggle(e: MouseEvent): void {
    overlays.toggleSavedListsPanel(PANEL_ID, e.currentTarget as Element);
  }
  // Keep the panel in the viewport: right-align it under the 💾 button, but let it jut
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
</script>

{#snippet tile(list: SavedList | null, i: number)}
  {@const warn = list ? warnText(list.items, list.separator) : null}
  <li class="tile" class:placeholder={!list}>
    <div class="tile-main">
      <input
        type="checkbox"
        class="use"
        disabled={!list}
        checked={list ? custom.isActive(list.id) : false}
        aria-label={list ? lang.ui.custom.listActivate : lang.ui.custom.phActivate}
        title={list ? lang.ui.custom.listActivate : lang.ui.custom.phActivate}
        onchange={() => list && custom.toggleActive(list.id)}
      />
      {#if list && editingId === list.id}
        <input
          class="name-edit"
          maxlength={NAME_MAX}
          bind:value={editingName}
          onkeydown={(e) => {
            if (e.key === "Enter") commitRename();
            else if (e.key === "Escape") editingId = null;
          }}
          onblur={commitRename}
          use:focusOnMount
        />
      {:else if list}
        <TipText id={`list-preview-${list.id}`} text={custom.preview(list.items)} label={list.name} maxWidth="10rem" />
      {:else}
        <span class="name muted">Custom List {custom.savedLists.length + 1}</span>
      {/if}
      {#if !list || editingId !== list.id}
        <button
          type="button"
          class="mini"
          disabled={!list}
          title={list ? lang.ui.custom.listRename : lang.ui.custom.phRename}
          onclick={() => list && startRename(list.id, list.name)}>✏️</button
        >
      {/if}
      {#if list && warn}<TipMarker tipId={`list-warn-${list.id}`} icon="⚠️" text={warn} local />{/if}
      <span class="spacer"></span>
      <select
        class="tile-sep"
        disabled={!list}
        aria-label={lang.ui.custom.separatorPick}
        value={list ? list.separator : ","}
        onchange={(e) => list && custom.setListSeparator(list.id, e.currentTarget.value as Separator)}
      >
        {#each SEPARATORS as s (s)}<option value={s}>{sepLabel(s)}</option>{/each}
      </select>
      <button
        type="button"
        class="mini tip-trigger"
        disabled={list ? false : custom.items.length === 0}
        title={list ? lang.ui.custom.listSave : lang.ui.custom.listSaveNew}
        onclick={(e) => (list ? arm("replace", list.id, list.name, e) : custom.saveNew())}>💾</button
      >
      <button
        type="button"
        class="mini tip-trigger"
        disabled={!list}
        title={list ? lang.ui.custom.listLoad : lang.ui.custom.phLoad}
        onclick={(e) => list && loadOrConfirm(list.id, list.name, e)}>📥</button
      >
      <button
        type="button"
        class="mini danger tip-trigger"
        disabled={!list}
        title={list ? lang.ui.custom.listDelete : lang.ui.custom.phDelete}
        onclick={(e) => list && arm("delete", list.id, list.name, e)}>🗑️</button
      >
      <span class="reorder">
        <button
          type="button"
          class="mini"
          disabled={!list || i === 0}
          title={list ? lang.ui.custom.listUp : lang.ui.custom.phMove}
          onclick={() => list && custom.moveList(list.id, -1)}>▲</button
        >
        <button
          type="button"
          class="mini"
          disabled={!list || i === custom.savedLists.length - 1}
          title={list ? lang.ui.custom.listDown : lang.ui.custom.phMove}
          onclick={() => list && custom.moveList(list.id, 1)}>▼</button
        >
      </span>
    </div>
    {#if list && warn}<TipNote id={`list-warn-${list.id}`} text={warn} local />{/if}
  </li>
{/snippet}

<div class="saved-lists-host">
  <button
    type="button"
    class="ctl-btn"
    aria-haspopup="true"
    aria-expanded={open}
    aria-label={lang.ui.custom.listsLabel}
    title={lang.ui.custom.listsLabel}
    onclick={toggle}>💾</button
  >
  {#if open}
    <div
      bind:this={panelEl}
      class="lists-panel"
      class:above={overlays.savedListsAbove}
      style={panelLeft == null ? "" : `left:${panelLeft}px;right:auto;`}
      role="group"
      aria-label={lang.ui.custom.listsTitle}
    >
      <p class="lists-title">
        {lang.ui.custom.listsTitle}
        <TipMarker tipId="lists-info" icon="ℹ️" text={lang.ui.custom.listsInfo} local />
      </p>
      <TipNote id="lists-info" text={lang.ui.custom.listsInfo} local />
      <ul>
        {#each custom.savedLists as list, i (list.id)}
          {@render tile(list, i)}
        {/each}
        {@render tile(null, custom.savedLists.length)}
      </ul>
      <!-- The destructive actions' confirm, in its own popover (the tip slot), so a
           press elsewhere / Escape / scroll dismisses it and a click inside does not. -->
      {#if overlays.tip === CONFIRM_ID && pending}
        <div class="tip-note local confirm-pop" style={overlays.tipStyle} role="dialog">
          <p class="confirm-msg">{confirmMessage(pending.kind, pending.name)}</p>
          <div class="confirm-actions">
            <button type="button" class="confirm-yes" onclick={confirmPending}>{lang.ui.custom.confirm}</button>
            <button type="button" class="confirm-no" onclick={cancelPending}>{lang.ui.custom.cancel}</button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .saved-lists-host {
    position: relative;
    display: inline-flex;
  }
  .lists-panel {
    position: absolute;
    top: calc(100% + 0.25rem);
    right: 0;
    z-index: 20;
    min-width: 22rem;
    max-width: min(30rem, 92vw);
    padding: 0.5rem 0.6rem;
    color: var(--chip-fg);
    background: var(--chip-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  }
  .lists-panel.above {
    top: auto;
    bottom: calc(100% + 0.25rem);
  }
  .lists-title {
    margin: 0 0 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--muted-2);
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .tile {
    position: relative; /* anchor for a non-local tip-note, and the row layout */
    border-top: 1px solid var(--border);
    padding-top: 0.3rem;
  }
  .tile-main {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.85rem; /* the base the name's TipText inherits, so it matches the row */
  }
  .name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .name.muted {
    color: var(--muted-2);
  }
  .name-edit {
    font: inherit;
    font-size: 0.85rem;
    min-width: 6rem;
    flex: 1;
  }
  .spacer {
    flex: 1;
  }
  .tile-sep {
    font: inherit;
    font-size: 0.8rem;
  }
  .mini {
    background: none;
    border: none;
    padding: 0 0.1rem;
    font: inherit;
    font-size: 0.85rem;
    line-height: 1;
    cursor: pointer;
  }
  .mini:disabled {
    opacity: 0.35;
    cursor: default;
  }
  .mini.danger:hover:not(:disabled),
  .mini.danger:focus-visible {
    filter: brightness(1.2);
  }
  .reorder {
    display: inline-flex;
    flex-direction: column;
    line-height: 0.7;
  }
  .reorder .mini {
    font-size: 0.6rem;
  }

  /* The confirm popover — position from overlays.tipStyle, look mirrors a tip-note. */
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
  .confirm-yes,
  .confirm-no {
    font: inherit;
    font-size: 0.78rem;
    padding: 0.2rem 0.5rem;
    border-radius: var(--radius);
    cursor: pointer;
  }
  .confirm-yes {
    color: var(--chip-fg);
    background: rgba(200, 60, 60, 0.22);
    border: 1px solid rgba(200, 60, 60, 0.7);
  }
  .confirm-yes:hover,
  .confirm-yes:focus-visible {
    background: rgba(200, 60, 60, 0.34);
  }
  .confirm-no {
    color: var(--chip-fg);
    background: none;
    border: 1px solid var(--panel-border);
  }
</style>
