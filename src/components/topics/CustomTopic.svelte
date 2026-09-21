<script lang="ts">
  import { availableSeparators, type Separator } from "../../lib/custom";
  import { custom } from "../../state/custom.svelte";
  import { lang } from "../../state/lang.svelte";
  import { output } from "../../state/output.svelte";
  import TipMarker from "../common/TipMarker.svelte";
  import TipNote from "../common/TipNote.svelte";
  import CustomOmittedPanel from "./CustomOmittedPanel.svelte";

  // The reader's own word-list row, pinned to the foot of the tree (§X1). It carries
  // no checkbox: the input drives the output directly, and what it contributes / drops
  // is the counter and the 🚫 panel. Styled like a top-layer topic row, and it reuses
  // the tree-root `.meta` / `.expander` styles by rendering inside `.topics`.

  const MAX_ROWS = 5; // X2 makes this adjustable (↕️ / − / +)
  const EXAMPLES = ["Apple", "Pear", "Orange"];

  const breakdown = $derived(output.customBreakdown);
  // The dropdown offers the separators that occur; the one in force is always among
  // them, but keep it so the select can never show a blank value.
  const options = $derived(withCurrent(availableSeparators(custom.input), custom.separator));

  function withCurrent(list: Separator[], cur: Separator): Separator[] {
    return list.includes(cur) ? list : [cur, ...list];
  }
  function sepLabel(s: Separator): string {
    return s === "\n" ? "\\n" : s === "\t" ? "\\t" : s;
  }
  // Illustrates the active separator in the empty field: inline for a visible
  // character, a stacked block for newline / tab.
  const placeholder = $derived(EXAMPLES.join(custom.separator) + custom.separator + "…");

  // Grow the textarea to its content up to MAX_ROWS, then scroll. X2 replaces the
  // fixed cap with the manual ↕️ / ± controls.
  function autosize(el: HTMLTextAreaElement) {
    const fit = () => {
      el.style.height = "auto";
      const cs = getComputedStyle(el);
      const line = parseFloat(cs.lineHeight) || 20;
      const extra =
        parseFloat(cs.paddingTop) +
        parseFloat(cs.paddingBottom) +
        parseFloat(cs.borderTopWidth) +
        parseFloat(cs.borderBottomWidth);
      const max = line * MAX_ROWS + extra;
      el.style.height = `${Math.min(el.scrollHeight, max)}px`;
      el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
    };
    fit();
    el.addEventListener("input", fit);
    return { destroy: () => el.removeEventListener("input", fit) };
  }
</script>

<div class="custom-item">
  <div class="custom-row">
    <!-- Holds the width a category's expander occupies, so the title lines up with
         the topic titles above. -->
    <span class="expander placeholder" aria-hidden="true">▸</span>
    <span class="title">{lang.ui.custom.title}</span>
    <TipMarker tipId="custom-info" icon="ℹ️" text={lang.ui.custom.infoHint} />
    <CustomOmittedPanel />
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
  <textarea
    class="custom-input"
    rows="1"
    placeholder={placeholder}
    value={custom.input}
    oninput={(e) => custom.setInput(e.currentTarget.value)}
    use:autosize
  ></textarea>
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
    padding: 0.5rem 0.2rem 0.35rem 0.1rem;
  }
  .custom-row .title {
    font-weight: 600;
  }
  .sep {
    display: inline-flex;
    align-items: baseline;
    gap: 0.3rem;
    margin-left: 0.5rem;
  }
  .sep-label {
    color: var(--muted-2);
    font-size: 0.85rem;
  }
  .sep-select {
    font: inherit;
    font-size: 0.85rem;
  }
  .custom-input {
    display: block;
    width: 100%;
    box-sizing: border-box;
    margin: 0 0 0.5rem;
    padding: 0.35rem 0.45rem;
    font: inherit;
    font-size: 0.9rem;
    line-height: 1.4;
    color: var(--chip-fg);
    background: var(--chip-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    /* Height is the autosize action's job; the X2 controls take it over. */
    resize: none;
    overflow-y: hidden;
  }
</style>
