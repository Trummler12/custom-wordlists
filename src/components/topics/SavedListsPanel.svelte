<script lang="ts">
  import Msg from "../../locale/html/Msg.svelte";
  import { plain } from "../../locale/html/plain";
  import { charKey, cleanItems, findDupes, oddChars, SEPARATORS, type Separator } from "../../lib/custom";
  import { custom, NAME_MAX, type SavedList } from "../../state/custom.svelte";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import { confirmPopup, controlPopup, placement } from "../shared/placement";
  import TipMarker from "../shared/TipMarker.svelte";
  import TipNote from "../shared/TipNote.svelte";
  import TipText from "../shared/TipText.svelte";

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
  let pending = $state<
    | { kind: "replace" | "load" | "delete"; id: number; name: string }
    | { kind: "clean"; id: number | null }
    | null
  >(null);
  // The save-time cleanup: which offered characters the reader ticked (by charKey), and what
  // saving would store under that choice — recomputed live, since removing a character can
  // turn two entries into duplicates.
  let cleanSel = $state<string[]>([]);
  const cleaning = $derived(pending?.kind === "clean");
  const offered = $derived(cleaning ? oddChars([custom.items]).filter((c) => c.cls !== "accepted") : []);
  const afterClean = $derived(cleaning ? findDupes(cleanItems(custom.items, new Set(cleanSel))) : null);
  const dropped = $derived(afterClean?.dupes.reduce((n, d) => n + d.copies - 1, 0) ?? 0);
  // Many characters spread over up to four columns rather than one long list.
  const cleanColumns = (n: number): number => Math.min(4, Math.max(1, Math.ceil(n / 5)));
  $effect(() => {
    if (!open) {
      editingId = null;
      pending = null;
    }
  });

  function sepLabel(s: Separator): string {
    return s === "\n" ? "\\n" : s === "\t" ? "\\t" : s;
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
  // Saving (a new list, or a replace once confirmed) first offers the cleanup, but only when
  // there is something to clean; the replace confirm then hands its popover over to it.
  function startSave(id: number | null, e?: MouseEvent): void {
    const chars = oddChars([custom.items]).filter((c) => c.cls !== "accepted");
    if (chars.length === 0 && findDupes(custom.items).dupes.length === 0) {
      custom.saveItems(id, custom.items);
      pending = null;
      overlays.closeTip();
      return;
    }
    cleanSel = chars.filter((c) => c.cls === "ignored").map(charKey);
    pending = { kind: "clean", id };
    if (e) overlays.openTip(CONFIRM_ID, e.currentTarget as Element, true, true);
  }
  function toggleClean(key: string): void {
    cleanSel = cleanSel.includes(key) ? cleanSel.filter((k) => k !== key) : [...cleanSel, key];
  }
  function confirmPending(): void {
    if (pending?.kind === "replace") return startSave(pending.id);
    if (pending?.kind === "clean") custom.saveItems(pending.id, afterClean?.unique ?? custom.items);
    else if (pending?.kind === "load") custom.loadIntoInput(pending.id);
    else if (pending?.kind === "delete") custom.deleteList(pending.id);
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
</script>

{#snippet tile(list: SavedList | null, i: number)}
  <li class="tile" class:placeholder={!list}>
    <div class="tile-main">
      <input
        type="checkbox"
        class="use"
        disabled={!list}
        checked={list ? custom.isActive(list.id) : false}
        aria-label={plain(list ? lang.ui.custom.listActivate : lang.ui.custom.phActivate)}
        title={plain(list ? lang.ui.custom.listActivate : lang.ui.custom.phActivate)}
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
          title={plain(list ? lang.ui.custom.listRename : lang.ui.custom.phRename)}
          onclick={() => list && startRename(list.id, list.name)}>✏️</button
        >
      {/if}
      <span class="spacer"></span>
      <select
        class="tile-sep"
        disabled={!list}
        aria-label={plain(lang.ui.custom.separatorPick)}
        value={list ? list.separator : ","}
        onchange={(e) => list && custom.setListSeparator(list.id, e.currentTarget.value as Separator)}
      >
        {#each SEPARATORS as s (s)}<option value={s}>{sepLabel(s)}</option>{/each}
      </select>
      <button
        type="button"
        class="mini tip-trigger"
        disabled={list ? false : custom.items.length === 0}
        title={plain(list ? lang.ui.custom.listSave : lang.ui.custom.listSaveNew)}
        onclick={(e) => (list ? arm("replace", list.id, list.name, e) : startSave(null, e))}>💾</button
      >
      <button
        type="button"
        class="mini tip-trigger"
        disabled={!list}
        title={plain(list ? lang.ui.custom.listLoad : lang.ui.custom.phLoad)}
        onclick={(e) => list && loadOrConfirm(list.id, list.name, e)}>📥</button
      >
      <button
        type="button"
        class="mini danger tip-trigger"
        disabled={!list}
        title={plain(list ? lang.ui.custom.listDelete : lang.ui.custom.phDelete)}
        onclick={(e) => list && arm("delete", list.id, list.name, e)}>🗑️</button
      >
      <span class="reorder">
        <button
          type="button"
          class="mini"
          disabled={!list || i === 0}
          title={plain(list ? lang.ui.custom.listUp : lang.ui.custom.phMove)}
          onclick={() => list && custom.moveList(list.id, -1)}>▲</button
        >
        <button
          type="button"
          class="mini"
          disabled={!list || i === custom.savedLists.length - 1}
          title={plain(list ? lang.ui.custom.listDown : lang.ui.custom.phMove)}
          onclick={() => list && custom.moveList(list.id, 1)}>▼</button
        >
      </span>
    </div>
  </li>
{/snippet}

<div class="saved-lists-host">
  <button
    type="button"
    class="ctl-btn"
    aria-haspopup="true"
    aria-expanded={open}
    aria-label={plain(lang.ui.custom.listsLabel)}
    title={plain(lang.ui.custom.listsLabel)}
    onclick={toggle}>💾</button
  >
  {#if open}
    <div
      class="lists-panel"
      use:placement={controlPopup(overlays.opener("savedLists"))}
      role="group"
      aria-label={plain(lang.ui.custom.listsTitle)}
    >
      <p class="lists-title">
        <Msg text={lang.ui.custom.listsTitle} />
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
        <div class="tip-note local confirm-pop" use:placement={confirmPopup(overlays.opener("tip"))} role="dialog">
          {#if pending.kind === "clean"}
            {#if offered.length}
              <p class="confirm-msg"><Msg text={lang.ui.custom.cleanChars} /></p>
              <ul class="clean-chars" style:grid-template-columns={`repeat(${cleanColumns(offered.length)}, max-content)`}>
                {#each offered as c (charKey(c))}
                  <li>
                    <label>
                      <input
                        type="checkbox"
                        checked={cleanSel.includes(charKey(c))}
                        onchange={() => toggleClean(charKey(c))}
                      />
                      <code>{c.label}</code>
                      <span class="count">x{c.count}</span>
                    </label>
                  </li>
                {/each}
              </ul>
            {/if}
            {#if afterClean?.dupes.length}
              {#if offered.length}<hr />{/if}
              <p class="confirm-msg"><Msg text={lang.ui.custom.cleanDupes(dropped)} /></p>
              <p class="clean-dupes">
                {#each afterClean.dupes as d, i (d.text)}{#if i > 0},{" "}{/if}<code>{d.text}</code
                  >{#if d.copies > 2}{" "}(x{d.copies}){/if}{/each}
              </p>
            {/if}
          {:else}
            <p class="confirm-msg">{confirmMessage(pending.kind, pending.name)}</p>
          {/if}
          <div class="confirm-actions">
            <button type="button" class="confirm-yes" onclick={confirmPending}><Msg text={lang.ui.custom.confirm} /></button>
            <button type="button" class="confirm-no" onclick={cancelPending}><Msg text={lang.ui.custom.cancel} /></button>
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
  /* Where it opens, how wide and how tall it may get: shared/placement, inline. */
  .lists-panel {
    position: absolute;
    z-index: 20;
    min-width: 22rem;
    padding: 0.5rem 0.6rem;
    color: var(--chip-fg);
    background: var(--chip-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
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

  /* The confirm popover — placed by shared/placement (fixed), look mirrors a tip-note. */
  .confirm-pop {
    position: fixed;
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
  /* column-count (inline) is the most columns; the min width lets a narrow popover use fewer. */
  /* A grid filling row by row, columns as wide as their content and flush left, so the
     tolerated characters follow the problematic ones in reading order. `justify-items`
     and an inline label keep each checkbox's click area to its own box and count. */
  .clean-chars {
    display: grid;
    justify-content: start;
    justify-items: start;
    column-gap: 1rem;
    row-gap: 0.15rem;
    margin: 0 0 0.5rem;
  }
  .clean-chars label {
    display: inline-flex;
    align-items: baseline;
    gap: 0.3rem;
    white-space: nowrap;
  }
  .clean-chars code {
    min-width: 1.4em;
    text-align: center;
  }
  .clean-chars .count {
    color: var(--muted-2);
    font-variant-numeric: tabular-nums;
  }
  /* A long list of duplicates stops after three lines; the count above says how many. */
  .clean-dupes {
    margin: 0 0 0.4rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    overflow: hidden;
    overflow-wrap: anywhere;
  }
  .confirm-pop hr {
    border: none;
    border-top: 1px solid var(--panel-border);
    margin: 0.4rem 0;
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
